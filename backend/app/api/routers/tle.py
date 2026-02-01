from typing import Sequence

from fastapi import APIRouter, HTTPException, status

from app.schemas import TLECreate, TLERead

from ..dependencies import TLEServiceDep

router = APIRouter(prefix="/tle", tags=["TLE"])


@router.get("/", response_model=Sequence[TLERead])
async def list_tles(service: TLEServiceDep):
    return await service.list_all()


@router.get("/{id}", response_model=TLERead)
async def get_tle(id: int, service: TLEServiceDep):
    tle = await service.get(id)
    if not tle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TLE {id} not found",
        )
    return tle


@router.get("/satellite/{satellite_id}", response_model=Sequence[TLERead])
async def list_by_satellite(
    satellite_id: int,
    service: TLEServiceDep,
):
    return await service.list_by_satellite(satellite_id)


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
