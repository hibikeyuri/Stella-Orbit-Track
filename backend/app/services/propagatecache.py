import logging
import math
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sgp4.api import Satrec, jday
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import TLE, Satellite

logger = logging.getLogger(__name__)

EARTH_RADIUS_KM = 6371.0


def _jday_from_datetime(dt: datetime) -> tuple[float, float]:
    return jday(
        dt.year, dt.month, dt.day,
        dt.hour, dt.minute,
        dt.second + dt.microsecond / 1e6,
    )


def _gmst(dt: datetime) -> float:
    """Calculate Greenwich Mean Sidereal Time in radians."""
    jd, fr = _jday_from_datetime(dt)
    d = jd + fr - 2451545.0
    t = d / 36525.0
    gmst_deg = (
        280.46061837
        + 360.98564736629 * d
        + 0.000387933 * t * t
        - t * t * t / 38710000.0
    ) % 360
    return math.radians(gmst_deg)


def _eci_to_ecef(r, gmst_rad: float) -> tuple[float, float, float]:
    """Rotate ECI (TEME) position vector to ECEF using GMST."""
    x, y, z = r
    cos_g = math.cos(gmst_rad)
    sin_g = math.sin(gmst_rad)
    x_ecef = x * cos_g + y * sin_g
    y_ecef = -x * sin_g + y * cos_g
    z_ecef = z
    return x_ecef, y_ecef, z_ecef


def _ecef_to_geodetic(x, y, z) -> dict:
    """Convert ECEF coordinates to geodetic lat/lon/alt."""
    lon = math.atan2(y, x)
    hyp = math.sqrt(x * x + y * y)
    lat = math.atan2(z, hyp)
    alt = math.sqrt(x * x + y * y + z * z) - EARTH_RADIUS_KM
    return {
        "latitude": math.degrees(lat),
        "longitude": math.degrees(lon),
        "altitude": alt,
    }


def eci_to_geodetic(r, dt: datetime) -> dict:
    """Convert ECI position to geodetic, accounting for Earth rotation (GMST)."""
    gmst_rad = _gmst(dt)
    x_ecef, y_ecef, z_ecef = _eci_to_ecef(r, gmst_rad)
    return _ecef_to_geodetic(x_ecef, y_ecef, z_ecef)


def _elevation_from_ecef(sat_ecef, observer_lat_rad, observer_lon_rad, observer_alt_km=0.0):
    """Calculate elevation angle (degrees) of satellite from an observer using ECEF."""
    obs_r = EARTH_RADIUS_KM + observer_alt_km
    ox = obs_r * math.cos(observer_lat_rad) * math.cos(observer_lon_rad)
    oy = obs_r * math.cos(observer_lat_rad) * math.sin(observer_lon_rad)
    oz = obs_r * math.sin(observer_lat_rad)

    # Range vector from observer to satellite (ECEF)
    rx = sat_ecef[0] - ox
    ry = sat_ecef[1] - oy
    rz = sat_ecef[2] - oz
    range_mag = math.sqrt(rx * rx + ry * ry + rz * rz)
    if range_mag == 0:
        return 90.0

    # Observer up-direction unit vector (radial)
    ux = math.cos(observer_lat_rad) * math.cos(observer_lon_rad)
    uy = math.cos(observer_lat_rad) * math.sin(observer_lon_rad)
    uz = math.sin(observer_lat_rad)

    # Dot product gives cosine of zenith angle
    cos_zenith = (rx * ux + ry * uy + rz * uz) / range_mag
    elevation = 90.0 - math.degrees(math.acos(max(-1.0, min(1.0, cos_zenith))))
    return elevation


class PropagationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def _get_latest_tle(self, satellite_id: int) -> TLE | None:
        stmt = (
            select(TLE)
            .where(TLE.satellite_id == satellite_id)
            .order_by(TLE.created_at.desc())
            .limit(1)
        )
        return await self.session.scalar(stmt)

    async def _get_satellite_and_tle(self, satellite_id: int) -> tuple[Satellite, TLE]:
        satellite = await self.session.get(Satellite, satellite_id)
        if not satellite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Satellite {satellite_id} not found",
            )

        tle = await self._get_latest_tle(satellite_id)
        if not tle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"TLE for satellite {satellite_id} not found",
            )

        if not tle.line1 or not tle.line2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="TLE line1/line2 not found",
            )

        return satellite, tle

    async def _get_satrec(self, satellite_id: int) -> Satrec:
        _, tle = await self._get_satellite_and_tle(satellite_id)
        return Satrec.twoline2rv(tle.line1, tle.line2)

    async def propagate(
        self,
        satellite_id: int,
        date: datetime,
    ):
        sat = await self._get_satrec(satellite_id)

        jd, fr = _jday_from_datetime(date)

        error, r, v = sat.sgp4(jd, fr)
        if error != 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SGP4 propagation error: {error}",
            )

        return r, v

    async def get_current_position(
        self,
        satellite_id: int,
        at: datetime | None = None,
    ):
        if at is None:
            at = datetime.now(timezone.utc)

        result = await self.propagate(satellite_id, at)
        r, _ = result
        geo = eci_to_geodetic(r, at)

        return {
            "lat": geo["latitude"],
            "lon": geo["longitude"],
            "alt": geo["altitude"],
            "timestamp": at,
        }

    async def propagate_with_geo(
        self,
        satellite_id: int,
        at: datetime | None = None,
    ) -> dict:
        if at is None:
            at = datetime.now(timezone.utc)

        satellite, tle = await self._get_satellite_and_tle(satellite_id)
        satrec = Satrec.twoline2rv(tle.line1, tle.line2)

        jd, fr = _jday_from_datetime(at)

        error, r, v = satrec.sgp4(jd, fr)
        if error != 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SGP4 propagation error: {error}",
            )

        geo = eci_to_geodetic(r, at)

        return {
            "satellite_id": satellite.id,
            "tle_id": tle.id,
            "norad_id": satellite.norad_id,
            "eci": {
                "position_km": list(r),
                "velocity_km_s": list(v),
            },
            "geodetic": {
                "latitude": geo["latitude"],
                "longitude": geo["longitude"],
                "altitude": geo["altitude"],
            },
            "timestamp": at,
            "frame": "TEME",
        }

    async def get_ground_track(
        self,
        satellite_id: int,
        minutes: int = 120,
        step_seconds: int = 30,
        at: datetime | None = None,
    ) -> dict:
        """Generate a full ground track (lat/lon points) for the given time window."""
        if at is None:
            at = datetime.now(timezone.utc)

        satellite, tle = await self._get_satellite_and_tle(satellite_id)
        satrec = Satrec.twoline2rv(tle.line1, tle.line2)

        points = []
        steps = int(minutes * 60 / step_seconds)
        for i in range(steps):
            t = at + timedelta(seconds=i * step_seconds)
            jd, fr = _jday_from_datetime(t)
            e, r, _ = satrec.sgp4(jd, fr)
            if e != 0:
                continue
            geo = eci_to_geodetic(r, t)
            points.append({
                "lat": geo["latitude"],
                "lon": geo["longitude"],
                "alt": geo["altitude"],
                "timestamp": t.isoformat(),
            })

        return {
            "satellite_id": satellite.id,
            "norad_id": satellite.norad_id,
            "name": satellite.name,
            "points": points,
        }

    async def predict_next_flyover(
        self,
        satellite_id: int,
        observer_lat: float,
        observer_lon: float,
        start: datetime | None = None,
        duration_minutes: int = 1440,
        step_seconds: int = 30,
    ):
        satellite, tle = await self._get_satellite_and_tle(satellite_id)
        sat = Satrec.twoline2rv(tle.line1, tle.line2)

        if start is None:
            start = datetime.now(timezone.utc)

        obs_lat_rad = math.radians(observer_lat)
        obs_lon_rad = math.radians(observer_lon)

        rise = peak = set_ = None
        max_elev = -90.0

        for i in range(int(duration_minutes * 60 / step_seconds)):
            t = start + timedelta(seconds=i * step_seconds)

            jd, fr = _jday_from_datetime(t)

            e, r, _ = sat.sgp4(jd, fr)
            if e != 0:
                continue

            gmst_rad = _gmst(t)
            sat_ecef = _eci_to_ecef(r, gmst_rad)

            elevation = _elevation_from_ecef(sat_ecef, obs_lat_rad, obs_lon_rad)

            if elevation > 0 and rise is None:
                rise = t
            if elevation > max_elev:
                max_elev = elevation
                peak = t
            if rise and elevation <= 0:
                set_ = t
                break

        if not rise:
            return None

        return {
            "satellite_id": satellite.id,
            "tle_id": tle.id,
            "observer_lat": observer_lat,
            "observer_lon": observer_lon,
            "duration_minutes": duration_minutes,
            "step_seconds": step_seconds,
            "start": rise,
            "peak": peak,
            "end": set_,
            "maxElevation": max_elev,
        }

    # ── Feature: Multi-satellite batch position ────────────────────
    async def get_multi_positions(
        self,
        satellite_ids: list[int],
        at: datetime | None = None,
    ) -> list[dict]:
        """Get current positions for multiple satellites in one call."""
        if at is None:
            at = datetime.now(timezone.utc)

        jd, fr = _jday_from_datetime(at)
        results = []

        for sid in satellite_ids:
            try:
                satellite, tle = await self._get_satellite_and_tle(sid)
                satrec = Satrec.twoline2rv(tle.line1, tle.line2)
                e, r, v = satrec.sgp4(jd, fr)
                if e != 0:
                    continue
                geo = eci_to_geodetic(r, at)
                speed = math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
                results.append({
                    "satellite_id": satellite.id,
                    "norad_id": satellite.norad_id,
                    "name": satellite.name,
                    "lat": geo["latitude"],
                    "lon": geo["longitude"],
                    "alt": geo["altitude"],
                    "velocity_km_s": speed,
                })
            except HTTPException:
                continue

        return results

    # ── Feature: Conjunction (close approach) analysis ─────────────
    async def predict_conjunction(
        self,
        sat_id_a: int,
        sat_id_b: int,
        duration_hours: int = 24,
        step_seconds: int = 60,
        threshold_km: float = 50.0,
    ) -> list[dict]:
        """Find close approaches between two satellites within a time window."""
        _, tle_a = await self._get_satellite_and_tle(sat_id_a)
        _, tle_b = await self._get_satellite_and_tle(sat_id_b)

        sat_a = Satrec.twoline2rv(tle_a.line1, tle_a.line2)
        sat_b = Satrec.twoline2rv(tle_b.line1, tle_b.line2)

        now = datetime.now(timezone.utc)
        events = []
        min_dist = float("inf")
        min_time = now

        steps = int(duration_hours * 3600 / step_seconds)
        for i in range(steps):
            t = now + timedelta(seconds=i * step_seconds)
            jd, fr = _jday_from_datetime(t)

            e1, r1, _ = sat_a.sgp4(jd, fr)
            e2, r2, _ = sat_b.sgp4(jd, fr)
            if e1 != 0 or e2 != 0:
                continue

            dx = r1[0] - r2[0]
            dy = r1[1] - r2[1]
            dz = r1[2] - r2[2]
            dist = math.sqrt(dx * dx + dy * dy + dz * dz)

            if dist < min_dist:
                min_dist = dist
                min_time = t

            if dist < threshold_km:
                geo_a = eci_to_geodetic(r1, t)
                geo_b = eci_to_geodetic(r2, t)
                events.append({
                    "time": t.isoformat(),
                    "distance_km": round(dist, 3),
                    "sat_a": {"lat": geo_a["latitude"], "lon": geo_a["longitude"], "alt": geo_a["altitude"]},
                    "sat_b": {"lat": geo_b["latitude"], "lon": geo_b["longitude"], "alt": geo_b["altitude"]},
                })

        return {
            "sat_id_a": sat_id_a,
            "sat_id_b": sat_id_b,
            "duration_hours": duration_hours,
            "threshold_km": threshold_km,
            "closest_approach_km": round(min_dist, 3),
            "closest_approach_time": min_time.isoformat(),
            "events": events,
        }

    # ── Feature: Sky pass track (azimuth/elevation for polar plot) ─
    async def get_pass_track(
        self,
        satellite_id: int,
        observer_lat: float,
        observer_lon: float,
        start: datetime | None = None,
        duration_minutes: int = 1440,
        step_seconds: int = 10,
    ) -> dict | None:
        """Return azimuth/elevation track of the next pass for sky plot rendering."""
        satellite, tle = await self._get_satellite_and_tle(satellite_id)
        sat = Satrec.twoline2rv(tle.line1, tle.line2)

        if start is None:
            start = datetime.now(timezone.utc)

        obs_lat_rad = math.radians(observer_lat)
        obs_lon_rad = math.radians(observer_lon)
        obs_r = EARTH_RADIUS_KM
        ox = obs_r * math.cos(obs_lat_rad) * math.cos(obs_lon_rad)
        oy = obs_r * math.cos(obs_lat_rad) * math.sin(obs_lon_rad)
        oz = obs_r * math.sin(obs_lat_rad)

        # Local coordinate frame at observer
        # Up: radial
        ux, uy, uz = (
            math.cos(obs_lat_rad) * math.cos(obs_lon_rad),
            math.cos(obs_lat_rad) * math.sin(obs_lon_rad),
            math.sin(obs_lat_rad),
        )
        # East: -sin(lon), cos(lon), 0
        ex, ey, ez = -math.sin(obs_lon_rad), math.cos(obs_lon_rad), 0.0
        # North: up × east (cross product)
        nx = uy * ez - uz * ey
        ny = uz * ex - ux * ez
        nz = ux * ey - uy * ex

        rise_time = None
        track_points = []

        steps = int(duration_minutes * 60 / step_seconds)
        for i in range(steps):
            t = start + timedelta(seconds=i * step_seconds)
            jd, fr = _jday_from_datetime(t)
            e, r, _ = sat.sgp4(jd, fr)
            if e != 0:
                continue

            gmst_rad = _gmst(t)
            sx, sy, sz = _eci_to_ecef(r, gmst_rad)

            # Range vector
            rx, ry, rz = sx - ox, sy - oy, sz - oz
            rng = math.sqrt(rx * rx + ry * ry + rz * rz)
            if rng == 0:
                continue

            # Project onto local frame
            r_up = rx * ux + ry * uy + rz * uz
            r_east = rx * ex + ry * ey + rz * ez
            r_north = rx * nx + ry * ny + rz * nz

            elevation = math.degrees(math.asin(max(-1, min(1, r_up / rng))))
            azimuth = math.degrees(math.atan2(r_east, r_north)) % 360

            if elevation > 0 and rise_time is None:
                rise_time = t

            if rise_time is not None:
                track_points.append({
                    "time": t.isoformat(),
                    "azimuth": round(azimuth, 2),
                    "elevation": round(elevation, 2),
                })
                if elevation <= 0 and len(track_points) > 1:
                    break

        if not track_points:
            return None

        max_el = max(p["elevation"] for p in track_points)
        return {
            "satellite_id": satellite.id,
            "norad_id": satellite.norad_id,
            "name": satellite.name,
            "observer_lat": observer_lat,
            "observer_lon": observer_lon,
            "rise_time": track_points[0]["time"],
            "set_time": track_points[-1]["time"],
            "max_elevation": max_el,
            "track": track_points,
        }

    # ── Feature: Orbital decay estimation ──────────────────────────
    async def estimate_orbital_decay(
        self,
        satellite_id: int,
    ) -> dict:
        """Estimate remaining orbital lifetime using simplified drag model.

        Uses the ballistic coefficient from TLE first derivative of mean motion
        (ndot/2) to estimate when the orbit will decay below ~150 km altitude.
        """
        satellite, tle = await self._get_satellite_and_tle(satellite_id)

        # Parse ndot/2 from line1 (columns 34-43)
        # Format: ±.XXXXXXXX (implied decimal)
        line1 = tle.line1
        try:
            ndot_str = line1[33:43].strip()
            ndot = float(ndot_str)  # rev/day^2 (half of actual)
        except (ValueError, IndexError):
            ndot = 0.0

        # Parse BSTAR drag term from line1 (columns 54-61)
        try:
            bstar_mantissa = line1[53:59].strip()
            bstar_exp = line1[59:61].strip()
            bstar = float(f"0.{bstar_mantissa}e{bstar_exp}")
        except (ValueError, IndexError):
            bstar = 0.0

        mean_motion = tle.mean_motion or 15.0
        semi_major_axis = tle.semi_major_axis or 6771.0
        altitude_km = semi_major_axis - EARTH_RADIUS_KM

        # Simplified Lifetime estimation
        # If ndot > 0, the orbit is decaying
        if ndot > 0 and mean_motion > 0:
            # Time for mean_motion to reach ~16.4 rev/day (≈ 150 km altitude)
            terminal_mm = 16.4  # rev/day at ~150 km LEO
            if mean_motion < terminal_mm:
                remaining_revs_per_day = terminal_mm - mean_motion
                # ndot is rev/day^2 (half value), so actual rate = 2 * ndot
                actual_ndot = 2.0 * ndot
                if actual_ndot > 1e-12:
                    days_to_decay = remaining_revs_per_day / actual_ndot
                else:
                    days_to_decay = -1  # effectively infinite
            else:
                days_to_decay = 30  # already very low
        else:
            days_to_decay = -1  # stable or insufficient data

        # Classify risk level
        if days_to_decay < 0:
            risk = "stable"
        elif days_to_decay < 365:
            risk = "high"
        elif days_to_decay < 3650:
            risk = "medium"
        else:
            risk = "low"

        return {
            "satellite_id": satellite.id,
            "norad_id": satellite.norad_id,
            "name": satellite.name,
            "altitude_km": round(altitude_km, 2),
            "mean_motion": round(mean_motion, 6),
            "ndot": ndot,
            "bstar": bstar,
            "estimated_days_to_decay": round(days_to_decay, 1) if days_to_decay > 0 else None,
            "risk_level": risk,
        }
