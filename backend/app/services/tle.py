import math
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import TLE, Satellite
from app.schemas import TLECreate

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

    async def list_all(self):
        return await self._list2()

    def _parse_line2(self, line2: str) -> dict:
        parts = line2.split()

        try:
            inclination = float(parts[2])
            raan = float(parts[3])
            eccentricity = float("0." + parts[4])
            arg_perigee = float(parts[5])
            mean_anomaly = float(parts[6])
            mean_motion = float(parts[7])
        except (IndexError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid TLE line2 format",
            )

        GM = 398600.4418  # km^3/s^2
        period = 86400 / mean_motion
        semi_major_axis = (GM * period**2 / (4 * math.pi**2)) ** (1 / 3)

        return {
            "inclination": inclination,
            "raan": raan,
            "eccentricity": eccentricity,
            "arg_perigee": arg_perigee,
            "mean_anomaly": mean_anomaly,
            "mean_motion": mean_motion,
            "semi_major_axis": semi_major_axis,
        }

    async def add(self, tle_create: TLECreate) -> TLE:
        if not tle_create.satellite_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="satellite_id is required",
            )

        if not tle_create.line1 or not tle_create.line2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="line1 and line2 are required",
            )

        orbital_params = self._parse_line2(tle_create.line2)

        tle = TLE(
            satellite_id=tle_create.satellite_id,
            name=tle_create.name,
            line1=tle_create.line1,
            line2=tle_create.line2,
            created_at=datetime.now(timezone.utc),
            **orbital_params,
        )

        return await self._add(tle)

    async def upsert(self, existing_tle: TLE, sat_data: dict) -> TLE:
        """Update an existing TLE record in-place with new line data."""
        if not sat_data.get("line2"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="line2 is required for upsert",
            )

        orbital_params = self._parse_line2(sat_data["line2"])

        existing_tle.name = sat_data.get("name")
        existing_tle.line1 = sat_data["line1"]
        existing_tle.line2 = sat_data["line2"]
        existing_tle.created_at = datetime.now(timezone.utc)

        for key, value in orbital_params.items():
            setattr(existing_tle, key, value)

        return await self._update(existing_tle)

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

        if not satellite.line1 or not satellite.line2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Satellite line1/line2 not found",
            )

        orbital_params = self._parse_line2(satellite.line2)

        tle = TLE(
            satellite_id=satellite.id,
            line1=satellite.line1,
            line2=satellite.line2,
            created_at=datetime.now(timezone.utc),
            **orbital_params,
        )

        return await self._add(tle)
