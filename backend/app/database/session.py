from typing import Annotated, AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlmodel import SQLModel

from app.config import app_settings

engine = create_async_engine(
    app_settings.DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False},
)


async def create_db_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(engine) as session:
        yield session


# Dependency Annotation
SessionDep = Annotated[AsyncSession, Depends(get_session)]
