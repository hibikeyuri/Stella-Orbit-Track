import logging
import math
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sgp4.api import Satrec, jday
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import TLE, Satellite

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


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

        jd, fr = jday(
            date.year,
            date.month,
            date.day,
            date.hour,
            date.minute,
            date.second + date.microsecond / 1e6,
        )

        error, r, v = sat.sgp4(jd, fr)
        if error != 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SGP4 propagation error: {error}",
            )

        return r, v

    def eci_to_geodetic(self, r):
        x, y, z = r

        lon = math.atan2(y, x)
        hyp = math.sqrt(x * x + y * y)
        lat = math.atan2(z, hyp)

        alt = math.sqrt(x * x + y * y + z * z) - 6371.0

        return {
            "latitude": math.degrees(lat),
            "longitude": math.degrees(lon),
            "altitude": alt,
        }

    async def get_current_position(
        self,
        satellite_id: int,
        at: datetime | None = None,
    ):
        if at is None:
            at = datetime.now(timezone.utc)

        result = await self.propagate(satellite_id, at)
        r, _ = result
        geo = self.eci_to_geodetic(r)

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

        jd, fr = jday(
            at.year,
            at.month,
            at.day,
            at.hour,
            at.minute,
            at.second + at.microsecond / 1e6,
        )

        error, r, v = satrec.sgp4(jd, fr)
        if error != 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SGP4 propagation error: {error}",
            )

        geo = self.eci_to_geodetic(r)

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

        rise = peak = set_ = None
        max_elev = -90.0

        for i in range(int(duration_minutes * 60 / step_seconds)):
            t = start + timedelta(seconds=i * step_seconds)

            jd, fr = jday(
                t.year, t.month, t.day, t.hour, t.minute, t.second + t.microsecond / 1e6
            )

            e, r, _ = sat.sgp4(jd, fr)
            if e != 0:
                continue

            x, y, z = r
            lon_sat = math.atan2(y, x)
            lat_sat = math.atan2(z, math.sqrt(x * x + y * y))

            dlon = lon_sat - math.radians(observer_lon)
            dlat = lat_sat - math.radians(observer_lat)

            elevation = math.degrees(
                math.asin(
                    math.sin(lat_sat) * math.sin(math.radians(observer_lat))
                    + math.cos(lat_sat)
                    * math.cos(math.radians(observer_lat))
                    * math.cos(dlon)
                )
            )

            if elevation > 0 and rise is None:
                rise = t
            if elevation > max_elev:
                max_elev = elevation
                peak = t
            if rise and elevation < 0:
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
