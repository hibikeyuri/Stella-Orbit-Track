"""Tests for SatelliteService — CRUD, stats, pagination."""

from datetime import datetime, timezone

import pytest
from fastapi import HTTPException

from app.database.models import TLE, Satellite
from app.schemas import SatelliteCreate
from app.services.satellite import SatelliteService

from .conftest import FakeSession


@pytest.mark.asyncio
async def test_get_satellite(sample_satellite):
    session = FakeSession([sample_satellite])
    result = await SatelliteService(session).get(1)
    assert result.name == "ISS (ZARYA)"
    assert result.norad_id == 25544


@pytest.mark.asyncio
async def test_get_satellite_not_found():
    with pytest.raises(HTTPException) as exc_info:
        await SatelliteService(FakeSession()).get(999)
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_add_satellite():
    session = FakeSession()
    create = SatelliteCreate(
        name="Hubble",
        norad_id=20580,
        line1="1 20580U 90037B   ...",
        line2="2 20580  28.4700 ...",
        is_active=True,
    )
    result = await SatelliteService(session).add(create)
    assert result.name == "Hubble"
    assert result.created_at is not None


@pytest.mark.asyncio
async def test_update_satellite(sample_satellite):
    session = FakeSession([sample_satellite])
    service = SatelliteService(session)
    result = await service.update(1, {"name": "ISS RENAMED", "is_active": False})
    assert result.name == "ISS RENAMED"
    assert result.is_active is False


@pytest.mark.asyncio
async def test_delete_satellite(sample_satellite):
    session = FakeSession([sample_satellite])
    service = SatelliteService(session)
    await service.delete(1)
    # After deletion, entity should be removed from fake session
    assert len(session._deleted) == 1


@pytest.mark.asyncio
async def test_list_all(sample_satellite):
    sat2 = Satellite(id=2, name="Hubble", norad_id=20580, is_active=True)
    session = FakeSession([sample_satellite, sat2])
    result = await SatelliteService(session).list_all()
    assert len(result) == 2
