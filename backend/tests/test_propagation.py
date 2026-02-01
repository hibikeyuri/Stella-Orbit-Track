from datetime import datetime, timezone

import pytest

from app.database.models import TLE, Satellite
from app.services.propagatecache import PropagationService


class FakeSession:
    def __init__(self, satellite: Satellite, tle: TLE):
        self._satellite = satellite
        self._tle = tle

    async def get(self, model, id):
        if model is Satellite and id == self._satellite.id:
            return self._satellite
        return None

    async def scalar(self, stmt):
        return self._tle


@pytest.mark.asyncio
async def test_propagate_with_geo_returns_eci_and_geodetic():
    line1 = "1 25544U 98067A   20029.54791435  .00001264  00000-0  29634-4 0  9993"
    line2 = "2 25544  51.6431  65.1511 0007417  91.2857  13.1246 15.49147143210616"

    satellite = Satellite(id=1, line1=line1, line2=line2)
    tle = TLE(id=1, satellite_id=1, line1=line1, line2=line2)

    service = PropagationService(session=FakeSession(satellite, tle))

    result = await service.propagate_with_geo(
        1, datetime(2020, 2, 1, tzinfo=timezone.utc)
    )

    assert "eci" in result
    assert "geodetic" in result
    assert len(result["eci"]["position_km"]) == 3
    assert len(result["eci"]["velocity_km_s"]) == 3
    assert "latitude" in result["geodetic"]
    assert "longitude" in result["geodetic"]
    assert "altitude" in result["geodetic"]
