from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class BaseService:
    def __init__(self, model, session: AsyncSession):
        self.model = model
        self.session = session

    async def _get(self, id: UUID):
        return await self.session.get(self.model, id)

    async def _get_by_int(self, id: int):
        return await self.session.get(self.model, id)

    async def _add(self, entity):
        self.session.add(entity)
        await self.session.commit()
        await self.session.refresh(entity)
        return entity

    async def _update(self, entity):
        return await self._add(entity)

    async def _delete(self, entity):
        await self.session.delete(entity)
        await self.session.commit()

    async def _list(self, **filters):
        stmt = select(self.model)

        for attr, value in filters.items():
            stmt = stmt.where(getattr(self.model, attr) == value)

        result = await self.session.execute(stmt)
        return result.scalars().all()
