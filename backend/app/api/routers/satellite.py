from typing import Sequence

from fastapi import APIRouter, HTTPException, status

from app.schemas import SatelliteCreate, SatelliteRead, SatelliteUpdate

from ..dependencies import SatelliteServiceDep

router = APIRouter(prefix="/satellites", tags=["Satellite"])


@router.get("/{id}", response_model=SatelliteRead)
async def get_satellite(id: int, service: SatelliteServiceDep):
    satellite = await service.get(id)
    if satellite is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Satellite with id #{id} not found",
        )
    return satellite


@router.get("/", response_model=Sequence[SatelliteRead])
async def list_satellites(service: SatelliteServiceDep):
    return await service.list_all()


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
