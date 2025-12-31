from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Satellite
from app.schemas import SatelliteCreate

from .base import BaseService


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
        return await self._list2()

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
