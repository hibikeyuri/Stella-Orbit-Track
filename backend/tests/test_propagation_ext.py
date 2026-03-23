"""Tests for PropagationService — coordinate transforms, propagation, ground track."""

import math
from datetime import datetime, timezone

import pytest
from fastapi import HTTPException

from app.database.models import TLE, Satellite
from app.services.propagatecache import (
    PropagationService,
    _ecef_to_geodetic,
    _eci_to_ecef,
    _gmst,
    eci_to_geodetic,
)

LINE1 = "1 25544U 98067A   20029.54791435  .00001264  00000-0  29634-4 0  9993"
LINE2 = "2 25544  51.6431  65.1511 0007417  91.2857  13.1246 15.49147143210616"


# ── Pure-function coordinate transform tests ─────────────────────


def test_gmst_returns_radians():
    dt = datetime(2020, 1, 29, 12, 0, 0, tzinfo=timezone.utc)
    g = _gmst(dt)
    assert 0 <= g < 2 * math.pi


def test_eci_to_ecef_rotation():
    """ECEF should equal ECI when GMST is 0."""
    r = (7000.0, 0.0, 0.0)
    x, y, z = _eci_to_ecef(r, 0.0)
    assert x == pytest.approx(7000.0)
    assert y == pytest.approx(0.0)
    assert z == pytest.approx(0.0)


def test_eci_to_ecef_90deg():
    """90° GMST should swap x/y components."""
    r = (7000.0, 0.0, 0.0)
    x, y, z = _eci_to_ecef(r, math.pi / 2)
    assert x == pytest.approx(0.0, abs=1e-6)
    assert y == pytest.approx(-7000.0, abs=1e-6)
    assert z == pytest.approx(0.0)


def test_ecef_to_geodetic_north_pole():
    geo = _ecef_to_geodetic(0, 0, 7000)
    assert geo["latitude"] == pytest.approx(90.0)
    assert geo["altitude"] == pytest.approx(7000 - 6371.0)


def test_ecef_to_geodetic_equator():
    geo = _ecef_to_geodetic(7000, 0, 0)
    assert geo["latitude"] == pytest.approx(0.0)
    assert geo["longitude"] == pytest.approx(0.0)


def test_eci_to_geodetic_roundtrip():
    """Geographical coordinates should be within valid ranges."""
    r = (4500.0, 5400.0, 2100.0)
    dt = datetime(2020, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
    geo = eci_to_geodetic(r, dt)
    assert -90 <= geo["latitude"] <= 90
    assert -180 <= geo["longitude"] <= 180
    assert geo["altitude"] > 0  # above Earth for this vector


# ── PropagationService async tests ───────────────────────────────


class _FakePropSession:
    """Session mock tailored for PropagationService tests."""

    def __init__(self, satellite, tle):
        self._satellite = satellite
        self._tle = tle

    async def get(self, model, id):
        if model is Satellite and id == self._satellite.id:
            return self._satellite
        return None

    async def scalar(self, stmt):
        return self._tle


@pytest.mark.asyncio
async def test_propagate_returns_position_vectors():
    sat = Satellite(id=1, line1=LINE1, line2=LINE2)
    tle = TLE(id=1, satellite_id=1, line1=LINE1, line2=LINE2)
    service = PropagationService(session=_FakePropSession(sat, tle))

    r, v = await service.propagate(1, datetime(2020, 2, 1, tzinfo=timezone.utc))

    assert len(r) == 3
    assert len(v) == 3
    # Position should be in reasonable LEO range
    magnitude = math.sqrt(r[0] ** 2 + r[1] ** 2 + r[2] ** 2)
    assert 6300 < magnitude < 7000


@pytest.mark.asyncio
async def test_propagate_with_geo_structure():
    sat = Satellite(id=1, name="ISS", norad_id=25544, line1=LINE1, line2=LINE2)
    tle = TLE(id=1, satellite_id=1, line1=LINE1, line2=LINE2)
    service = PropagationService(session=_FakePropSession(sat, tle))

    result = await service.propagate_with_geo(1, datetime(2020, 2, 1, tzinfo=timezone.utc))

    assert "eci" in result
    assert "geodetic" in result
    assert "satellite_id" in result
    assert "norad_id" in result
    assert len(result["eci"]["position_km"]) == 3
    assert len(result["eci"]["velocity_km_s"]) == 3
    assert -90 <= result["geodetic"]["latitude"] <= 90
    assert -180 <= result["geodetic"]["longitude"] <= 180


@pytest.mark.asyncio
async def test_get_current_position():
    sat = Satellite(id=1, line1=LINE1, line2=LINE2)
    tle = TLE(id=1, satellite_id=1, line1=LINE1, line2=LINE2)
    service = PropagationService(session=_FakePropSession(sat, tle))

    result = await service.get_current_position(1, at=datetime(2020, 2, 1, tzinfo=timezone.utc))

    assert "lat" in result
    assert "lon" in result
    assert "alt" in result
    assert -90 <= result["lat"] <= 90


@pytest.mark.asyncio
async def test_get_ground_track():
    sat = Satellite(id=1, name="ISS", norad_id=25544, line1=LINE1, line2=LINE2)
    tle = TLE(id=1, satellite_id=1, line1=LINE1, line2=LINE2)
    service = PropagationService(session=_FakePropSession(sat, tle))

    result = await service.get_ground_track(
        1, minutes=10, step_seconds=60,
        at=datetime(2020, 2, 1, tzinfo=timezone.utc),
    )

    assert result["satellite_id"] == 1
    assert len(result["points"]) == 10
    for pt in result["points"]:
        assert "lat" in pt and "lon" in pt and "alt" in pt


@pytest.mark.asyncio
async def test_satellite_not_found():
    service = PropagationService(session=_FakePropSession(
        Satellite(id=99), TLE(id=1, satellite_id=99, line1=LINE1, line2=LINE2),
    ))
    with pytest.raises(HTTPException) as exc_info:
        await service.propagate(999, datetime(2020, 2, 1, tzinfo=timezone.utc))
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_estimate_orbital_decay():
    sat = Satellite(id=1, name="ISS", norad_id=25544, line1=LINE1, line2=LINE2)
    tle = TLE(
        id=1, satellite_id=1, line1=LINE1, line2=LINE2,
        mean_motion=15.49, semi_major_axis=6778.0,
    )
    service = PropagationService(session=_FakePropSession(sat, tle))

    result = await service.estimate_orbital_decay(1)

    assert "altitude_km" in result
    assert "risk_level" in result
    assert result["risk_level"] in ("stable", "low", "medium", "high")
