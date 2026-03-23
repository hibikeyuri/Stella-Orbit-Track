"""Tests for TLE service — parsing, add, upsert, create_from_satellite."""

import math

import pytest
from fastapi import HTTPException

from app.database.models import TLE, Satellite
from app.schemas import TLECreate
from app.services.tle import TLEService

from .conftest import FakeSession

LINE1 = "1 25544U 98067A   20029.54791435  .00001264  00000-0  29634-4 0  9993"
LINE2 = "2 25544  51.6431  65.1511 0007417  91.2857  13.1246 15.49147143210616"


# ── _parse_line2 unit tests ───────────────────────────────────────


def test_parse_line2_all_fields():
    data = TLEService(session=None)._parse_line2(LINE2, LINE1)

    assert data["inclination"] == pytest.approx(51.6431)
    assert data["raan"] == pytest.approx(65.1511)
    assert data["eccentricity"] == pytest.approx(0.0007417)
    assert data["argument_of_perigee"] == pytest.approx(91.2857)
    assert data["mean_anomaly"] == pytest.approx(13.1246)
    assert data["mean_motion"] == pytest.approx(15.49147143)
    assert data["semi_major_axis"] > 6000
    assert data["period"] > 0
    assert data["age_days"] is not None
    assert data["age_days"] > 0


def test_parse_line2_without_line1():
    data = TLEService(session=None)._parse_line2(LINE2)
    assert data["inclination"] == pytest.approx(51.6431)
    assert data["age_days"] is None


def test_parse_line2_invalid_format():
    with pytest.raises(HTTPException) as exc_info:
        TLEService(session=None)._parse_line2("INVALID DATA")
    assert exc_info.value.status_code == 400


def test_parse_line2_iss_leo_range():
    """Semi-major axis for ISS should be in LEO range (~6700-6800 km)."""
    data = TLEService(session=None)._parse_line2(LINE2)
    assert 6500 < data["semi_major_axis"] < 7000


def test_parse_line2_period_reasonable():
    """ISS orbital period should be ~92 minutes."""
    data = TLEService(session=None)._parse_line2(LINE2)
    period_min = data["period"] / 60
    assert 88 < period_min < 96


# ── add / upsert / create_from_satellite ──────────────────────────


@pytest.mark.asyncio
async def test_add_tle(sample_satellite):
    session = FakeSession([sample_satellite])
    service = TLEService(session)
    result = await service.add(TLECreate(satellite_id=1, name="ISS", line1=LINE1, line2=LINE2))

    assert result.satellite_id == 1
    assert result.inclination == pytest.approx(51.6431)
    assert result.mean_motion == pytest.approx(15.49147143)


@pytest.mark.asyncio
async def test_add_tle_missing_satellite_id():
    with pytest.raises(HTTPException) as exc_info:
        await TLEService(FakeSession()).add(TLECreate(satellite_id=None, line1=LINE1, line2=LINE2))
    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
async def test_add_tle_missing_lines():
    with pytest.raises(HTTPException):
        await TLEService(FakeSession()).add(TLECreate(satellite_id=1, line1=None, line2=None))


@pytest.mark.asyncio
async def test_upsert_tle(sample_tle):
    session = FakeSession([sample_tle])
    service = TLEService(session)

    result = await service.upsert(sample_tle, {"name": "ISS Updated", "line1": LINE1, "line2": LINE2})

    assert result.name == "ISS Updated"
    assert result.inclination == pytest.approx(51.6431)


@pytest.mark.asyncio
async def test_upsert_missing_line2(sample_tle):
    with pytest.raises(HTTPException):
        await TLEService(FakeSession()).upsert(sample_tle, {"name": "x"})


@pytest.mark.asyncio
async def test_create_from_satellite(sample_satellite):
    session = FakeSession([sample_satellite])
    result = await TLEService(session).create_from_satellite(1)

    assert result.satellite_id == 1
    assert result.line1 == sample_satellite.line1
    assert result.inclination > 0


@pytest.mark.asyncio
async def test_create_from_satellite_not_found():
    with pytest.raises(HTTPException) as exc_info:
        await TLEService(FakeSession()).create_from_satellite(999)
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_get_tle_not_found():
    with pytest.raises(HTTPException) as exc_info:
        await TLEService(FakeSession()).get(999)
    assert exc_info.value.status_code == 404
