from datetime import datetime

from fastapi import APIRouter, Query

from ..dependencies import PropagationServiceDep

router = APIRouter(prefix="/propagation", tags=["Propagation"])


@router.get("/position/{satellite_id}")
async def get_current_position(
    satellite_id: int,
    at: datetime,
    service: PropagationServiceDep,
):
    return await service.propagate(satellite_id, at)


@router.get("/flyover/{satellite_id}")
async def get_next_flyover(
    satellite_id: int,
    service: PropagationServiceDep,
    lat: float = Query(..., description="Observer latitude"),
    lon: float = Query(..., description="Observer longitude"),
    duration: int = 1440,
):
    return await service.predict_next_flyover(
        satellite_id=satellite_id,
        observer_lat=lat,
        observer_lon=lon,
        duration_minutes=duration,
    )
