from datetime import datetime, timezone
from typing import Sequence

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database.models import Satellite

from ..schemas import SatelliteCreate


class SatelliteService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, id: int) -> Satellite | None:
        return await self.session.get(Satellite, id)

    async def list_all(self) -> Sequence[Satellite]:
        result = await self.session.execute(select(Satellite))
        return result.scalars().all()

    async def add(self, satellite_create: SatelliteCreate) -> Satellite:
        new_satellite = Satellite(
            **satellite_create.model_dump(),
            created_at=datetime.now(timezone.utc),
        )
        self.session.add(new_satellite)
        await self.session.commit()
        await self.session.refresh(new_satellite)
        return new_satellite

    async def update(self, id: int, update_data: dict) -> Satellite:
        satellite = await self.get(id)
        if not satellite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Satellite {id} not found",
            )

        # using sqlmodel_update or using setattr
        for key, value in update_data.items():
            setattr(satellite, key, value)

        self.session.add(satellite)
        await self.session.commit()
        await self.session.refresh(satellite)
        return satellite

    async def delete(self, id: int) -> None:
        satellite = await self.get(id)
        if satellite:
            await self.session.delete(satellite)
            await self.session.commit()
