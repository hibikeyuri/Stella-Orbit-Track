from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas import (
    ConjunctionResponse,
    FlyoverResponse,
    GroundTrackResponse,
    MultiSatPositionResponse,
    OrbitalDecayResponse,
    PropagationPositionResponse,
    SkyPassResponse,
)

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


@router.get("/ground-track/{satellite_id}")
async def get_ground_track(
    satellite_id: int,
    service: PropagationServiceDep,
    minutes: int = Query(120, description="Time window in minutes"),
    step: int = Query(30, description="Step size in seconds"),
) -> GroundTrackResponse:
    data = await service.get_ground_track(
        satellite_id=satellite_id,
        minutes=minutes,
        step_seconds=step,
    )
    return GroundTrackResponse(data=data)


@router.get("/multi-position")
async def get_multi_positions(
    service: PropagationServiceDep,
    ids: str = Query(..., description="Comma-separated satellite IDs"),
    at: datetime | None = None,
) -> MultiSatPositionResponse:
    satellite_ids = [int(x.strip()) for x in ids.split(",") if x.strip().isdigit()]
    if not satellite_ids:
        raise HTTPException(status_code=400, detail="No valid satellite IDs provided")
    data = await service.get_multi_positions(satellite_ids, at)
    return MultiSatPositionResponse(data=data)


@router.get("/conjunction")
async def get_conjunction(
    service: PropagationServiceDep,
    sat_a: int = Query(..., description="First satellite ID"),
    sat_b: int = Query(..., description="Second satellite ID"),
    hours: int = Query(24, ge=1, le=168, description="Look-ahead hours"),
    threshold: float = Query(50.0, ge=1, le=1000, description="Distance threshold km"),
) -> ConjunctionResponse:
    data = await service.predict_conjunction(
        sat_id_a=sat_a,
        sat_id_b=sat_b,
        duration_hours=hours,
        threshold_km=threshold,
    )
    return ConjunctionResponse(data=data)


@router.get("/sky-pass/{satellite_id}")
async def get_sky_pass(
    satellite_id: int,
    service: PropagationServiceDep,
    lat: float = Query(..., description="Observer latitude"),
    lon: float = Query(..., description="Observer longitude"),
    duration: int = Query(1440, description="Search window in minutes"),
) -> SkyPassResponse:
    data = await service.get_pass_track(
        satellite_id=satellite_id,
        observer_lat=lat,
        observer_lon=lon,
        duration_minutes=duration,
    )
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No visible pass found",
        )
    return SkyPassResponse(data=data)


@router.get("/decay/{satellite_id}")
async def get_orbital_decay(
    satellite_id: int,
    service: PropagationServiceDep,
) -> OrbitalDecayResponse:
    data = await service.estimate_orbital_decay(satellite_id)
    return OrbitalDecayResponse(data=data)
