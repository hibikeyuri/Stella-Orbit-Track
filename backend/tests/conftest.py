"""conftest.py — shared fixtures for backend tests."""

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import TLE, Satellite, Setting, User


@pytest.fixture
def sample_line1():
    return "1 25544U 98067A   20029.54791435  .00001264  00000-0  29634-4 0  9993"


@pytest.fixture
def sample_line2():
    return "2 25544  51.6431  65.1511 0007417  91.2857  13.1246 15.49147143210616"


@pytest.fixture
def sample_satellite(sample_line1, sample_line2):
    return Satellite(
        id=1,
        name="ISS (ZARYA)",
        line1=sample_line1,
        line2=sample_line2,
        norad_id=25544,
        is_active=True,
    )


@pytest.fixture
def sample_tle(sample_line1, sample_line2):
    return TLE(
        id=1,
        satellite_id=1,
        name="ISS (ZARYA)",
        line1=sample_line1,
        line2=sample_line2,
    )


@pytest.fixture
def sample_user():
    return User(
        id=uuid4(),
        fullName="Test User",
        email="test@example.com",
        password_hash="$pbkdf2-sha256$29000$hash",
        email_verified=True,
        created_at=datetime.now(timezone.utc),
    )


@pytest.fixture
def sample_setting():
    return Setting(
        id=1,
        default_propagation_minutes=90,
        default_ground_track_minutes=90,
        conjunction_threshold_km=50.0,
        flyover_min_elevation=10.0,
        celestrak_sync_interval=3600,
        tle_refresh_interval=900,
        map_default_zoom=3,
    )


class FakeSession:
    """Minimal async session mock for unit tests."""

    def __init__(self, entities=None):
        self._entities = {
            (type(e).__name__, self._pk(e)): e for e in (entities or [])
        }
        self._committed = []
        self._deleted = []

    @staticmethod
    def _pk(entity):
        return getattr(entity, "id", None)

    async def get(self, model, id):
        return self._entities.get((model.__name__, id))

    async def scalar(self, stmt):
        # Return first matching entity
        for entity in self._entities.values():
            return entity
        return None

    async def execute(self, stmt):
        class FakeResult:
            def __init__(self, items):
                self._items = items

            def scalars(self):
                return self

            def all(self):
                return self._items

        return FakeResult(list(self._entities.values()))

    def add(self, entity):
        self._entities[(type(entity).__name__, self._pk(entity))] = entity

    async def commit(self):
        pass

    async def refresh(self, entity):
        pass

    async def delete(self, entity):
        key = (type(entity).__name__, self._pk(entity))
        self._entities.pop(key, None)
        self._deleted.append(entity)
