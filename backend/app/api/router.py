from fastapi import APIRouter

from .routers import satellite, user

# Single router to group all api routers
master_router = APIRouter()

master_router.include_router(satellite.router)
master_router.include_router(user.router)


# from typing import Sequence

# from fastapi import APIRouter, HTTPException, status

# from app.schemas import SatelliteCreate, SatelliteRead, SatelliteUpdate

# from .dependencies import SatelliteServiceDep

# router = APIRouter(prefix="/satellites", tags=["Satellite"])


# # -----------------------------
# # Get Satellite by ID
# # -----------------------------
# @router.get("/{id}", response_model=SatelliteRead)
# async def get_satellite(id: int, service: SatelliteServiceDep):
#     satellite = await service.get(id)
#     if satellite is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail=f"Satellite with id #{id} not found",
#         )
#     return satellite


# # -----------------------------
# # List all Satellites
# # -----------------------------
# @router.get("/", response_model=Sequence[SatelliteRead])
# async def list_satellites(service: SatelliteServiceDep):
#     return await service.list_all()


# # -----------------------------
# # Create Satellite
# # -----------------------------
# @router.post("/", response_model=SatelliteRead)
# async def create_satellite(
#     satellite: SatelliteCreate,
#     service: SatelliteServiceDep,
# ):
#     return await service.add(satellite)


# # -----------------------------
# # Update Satellite
# # -----------------------------
# @router.patch("/{id}", response_model=SatelliteRead)
# async def update_satellite(
#     id: int,
#     satellite_update: SatelliteUpdate,
#     service: SatelliteServiceDep,
# ):
#     update_data = satellite_update.model_dump(exclude_none=True)
#     if not update_data:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="No data provided to update",
#         )
#     return await service.update(id, update_data)


# # -----------------------------
# # Delete Satellite
# # -----------------------------
# @router.delete("/{id}")
# async def delete_satellite(id: int, service: SatelliteServiceDep) -> dict[str, str]:
#     await service.delete(id)
#     return {"detail": f"Satellite with id #{id} deleted"}
