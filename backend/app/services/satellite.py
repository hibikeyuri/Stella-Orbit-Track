from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import TLE, Satellite
from app.schemas import SatelliteCreate

from .base import BaseService

EARTH_RADIUS = 6371
LEO_MAX_SMA = EARTH_RADIUS + 2000  # 8371 km

SATELLITE_SORTABLE = {"name", "norad_id", "date", "created_at", "is_active", "category"}


class SatelliteService(BaseService):
    def __init__(self, session: AsyncSession):
        super().__init__(Satellite, session)

    async def get(self, id: int) -> Satellite:
        satellite = await self._get_by_int(id)
        if not satellite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Satellite {id} not found",
            )
        return satellite

    async def list_all(self):
        return await self._list()

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        is_active: bool | None = None,
        sort_by: str | None = None,
        sort_dir: str = "asc",
    ):
        safe_sort = sort_by if sort_by in SATELLITE_SORTABLE else None
        filters = {}
        if is_active is not None:
            filters["is_active"] = is_active
        return await self._list_paginated(
            page, page_size, sort_by=safe_sort, sort_dir=sort_dir, **filters
        )

    async def get_stats(self) -> dict:
        total = await self.session.scalar(select(func.count(Satellite.id))) or 0
        active = await self.session.scalar(
            select(func.count(Satellite.id)).where(Satellite.is_active == True)
        ) or 0

        # LEO: satellites with at least one TLE where semi_major_axis < 8371
        leo_subq = (
            select(TLE.satellite_id)
            .where(TLE.semi_major_axis < LEO_MAX_SMA)
            .distinct()
            .subquery()
        )
        leo = await self.session.scalar(
            select(func.count()).select_from(leo_subq)
        ) or 0

        return {
            "total": total,
            "active": active,
            "inactive": total - active,
            "leo": leo,
        }

    async def add(self, satellite_create: SatelliteCreate) -> Satellite:
        satellite = Satellite(
            **satellite_create.model_dump(),
            created_at=datetime.now(timezone.utc),
        )
        return await self._add(satellite)

    async def update(self, id: int, update_data: dict) -> Satellite:
        satellite = await self.get(id)

        for key, value in update_data.items():
            setattr(satellite, key, value)

        return await self._update(satellite)

    async def delete(self, id: int):
        satellite = await self.get(id)
        await self._delete(satellite)
