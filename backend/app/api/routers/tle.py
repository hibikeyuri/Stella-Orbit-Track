import math
from typing import Sequence

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas import PaginatedResponse, TLECreate, TLERead

from ..dependencies import TLEServiceDep

router = APIRouter(prefix="/tle", tags=["TLE"])


@router.get("/", response_model=PaginatedResponse[TLERead])
async def list_tles(
    service: TLEServiceDep,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    items, total = await service.list_paginated(page, page_size)
    return PaginatedResponse(
        data=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


@router.get("/{id}", response_model=TLERead)
async def get_tle(id: int, service: TLEServiceDep):
    tle = await service.get(id)
    if not tle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TLE {id} not found",
        )
    return tle


@router.get("/satellite/{satellite_id}", response_model=PaginatedResponse[TLERead])
async def list_by_satellite(
    satellite_id: int,
    service: TLEServiceDep,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    items, total = await service.list_by_satellite_paginated(satellite_id, page, page_size)
    return PaginatedResponse(
        data=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


@router.post("/", response_model=TLERead)
async def create_tle(
    tle: TLECreate,
    service: TLEServiceDep,
):
    return await service.add(tle)


@router.get("/{id}/orbit")
async def compute_orbital_params(
    id: int,
    service: TLEServiceDep,
):
    return await service.create_from_satellite(id)
