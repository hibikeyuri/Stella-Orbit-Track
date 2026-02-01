from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas import FlyoverResponse, PropagationPositionResponse

from ..dependencies import PropagationServiceDep

router = APIRouter(prefix="/propagation", tags=["Propagation"])


@router.get("/position/{satellite_id}")
async def get_current_position(
    satellite_id: int,
    service: PropagationServiceDep,
    at: datetime | None = None,
) -> PropagationPositionResponse:
    data = await service.propagate_with_geo(satellite_id, at)
    return PropagationPositionResponse(data=data)


@router.get("/flyover/{satellite_id}")
async def get_next_flyover(
    satellite_id: int,
    service: PropagationServiceDep,
    lat: float = Query(..., description="Observer latitude"),
    lon: float = Query(..., description="Observer longitude"),
    duration: int = 1440,
) -> FlyoverResponse:
    data = await service.predict_next_flyover(
        satellite_id=satellite_id,
        observer_lat=lat,
        observer_lon=lon,
        duration_minutes=duration,
    )
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No flyover found for the given parameters",
        )

    return FlyoverResponse(data=data)
