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
