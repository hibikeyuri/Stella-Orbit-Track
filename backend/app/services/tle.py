import math
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import TLE, Satellite

from .base import BaseService


class TLEService(BaseService):
    def __init__(self, session: AsyncSession):
        super().__init__(TLE, session)

    async def get(self, id: int) -> TLE:
        tle = await self._get_by_int(id)
        if not tle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"TLE {id} not found",
            )
        return tle

    async def list_by_satellite(self, satellite_id: int):
        return await self._list2(satellite_id=satellite_id)

    async def create_from_satellite(self, satellite_id: int) -> TLE:
        """
        從 Satellite 的 line1 / line2 計算軌道參數並建立 TLE 紀錄
        """

        satellite = await self.session.get(Satellite, satellite_id)
        if not satellite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Satellite {satellite_id} not found",
            )

        line2 = satellite.line2.split()

        try:
            inclination = float(line2[2])
            raan = float(line2[3])
            eccentricity = float("0." + line2[4])
            arg_perigee = float(line2[5])
            mean_anomaly = float(line2[6])
            mean_motion = float(line2[7])
        except (IndexError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid TLE line2 format",
            )

        # orbital calculation
        GM = 398600.4418  # km^3/s^2
        period = 86400 / mean_motion
        semi_major_axis = (GM * period**2 / (4 * math.pi**2)) ** (1 / 3)

        tle = TLE(
            satellite_id=satellite.id,
            inclination=inclination,
            raan=raan,
            eccentricity=eccentricity,
            arg_perigee=arg_perigee,
            mean_anomaly=mean_anomaly,
            mean_motion=mean_motion,
            semi_major_axis=semi_major_axis,
            created_at=datetime.now(timezone.utc),
        )

        return await self._add(tle)
