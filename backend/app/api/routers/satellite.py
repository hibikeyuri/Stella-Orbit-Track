import math

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas import PaginatedResponse, SatelliteCreate, SatelliteRead, SatelliteUpdate

from ..dependencies import SatelliteServiceDep

router = APIRouter(prefix="/satellites", tags=["Satellite"])


@router.get("/stats")
async def get_satellite_stats(service: SatelliteServiceDep):
    return await service.get_stats()


@router.get("/{id}", response_model=SatelliteRead)
async def get_satellite(id: int, service: SatelliteServiceDep):
    satellite = await service.get(id)
    if satellite is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Satellite with id #{id} not found",
        )
    return satellite


@router.get("/", response_model=PaginatedResponse[SatelliteRead])
async def list_satellites(
    service: SatelliteServiceDep,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=200),
    is_active: bool | None = Query(None),
    sort_by: str | None = Query(None),
    sort_dir: str = Query("asc"),
):
    items, total = await service.list_paginated(
        page, page_size, is_active=is_active, sort_by=sort_by, sort_dir=sort_dir,
    )
    return PaginatedResponse(
        data=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


@router.post("/", response_model=SatelliteRead)
async def create_satellite(
    satellite: SatelliteCreate,
    service: SatelliteServiceDep,
):
    return await service.add(satellite)


@router.patch("/{id}", response_model=SatelliteRead)
async def update_satellite(
    id: int,
    satellite_update: SatelliteUpdate,
    service: SatelliteServiceDep,
):
    update_data = satellite_update.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided to update",
        )
    return await service.update(id, update_data)


@router.delete("/{id}")
async def delete_satellite(id: int, service: SatelliteServiceDep) -> dict[str, str]:
    await service.delete(id)
    return {"detail": f"Satellite with id #{id} deleted"}
