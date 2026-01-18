import logging
import math
from datetime import datetime, timedelta, timezone

from sgp4.api import Satrec, jday
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Satellite

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class PropagationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def _get_satrec(self, satellite_id: int) -> Satrec:
        satellite = await self.session.get(Satellite, satellite_id)
        # print("我到了_get_satrec", satellite.line1, satellite.line2)
        if not satellite:
            raise ValueError(f"Satellite {satellite_id} not found")

        return Satrec.twoline2rv(satellite.line1, satellite.line2)

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

        print(jd, fr)

        error, r, v = sat.sgp4(jd, fr)

        print(r, v)
        if error != 0:
            print("我進來了")
            return None

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
        if not result:
            return None

        r, _ = result
        geo = self.eci_to_geodetic(r)

        return {
            "lat": geo["latitude"],
            "lon": geo["longitude"],
            "alt": geo["altitude"],
            "timestamp": at,
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
        sat = await self._get_satrec(satellite_id)

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

            print(f"Time {t} Elevation {elevation:.2f}", flush=True)
            print(
                f"t={t}, lat_sat={math.degrees(lat_sat):.2f}, lon_sat={math.degrees(lon_sat):.2f}, elevation={elevation:.2f}",
                flush=True,
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
            "start": rise,
            "peak": peak,
            "end": set_,
            "maxElevation": max_elev,
        }
