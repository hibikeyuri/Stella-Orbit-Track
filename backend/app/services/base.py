from uuid import UUID

from sqlalchemy import func, select
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

    async def _list_paginated(self, page: int, page_size: int, **filters):
        """Return (items, total_count) with offset/limit pagination."""
        base = select(self.model)
        for attr, value in filters.items():
            base = base.where(getattr(self.model, attr) == value)

        # total count
        count_stmt = select(func.count()).select_from(base.subquery())
        total = await self.session.scalar(count_stmt) or 0

        # paginated rows
        offset = (page - 1) * page_size
        data_stmt = base.offset(offset).limit(page_size)
        result = await self.session.execute(data_stmt)
        items = result.scalars().all()

        return items, total
