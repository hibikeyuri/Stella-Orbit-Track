from fastapi import APIRouter

from .routers import oauth, propagation, satellite, tle, user

# Single router to group all api routers
master_router = APIRouter()

master_router.include_router(satellite.router)
master_router.include_router(user.router)
master_router.include_router(oauth.router)
master_router.include_router(tle.router)
master_router.include_router(propagation.router)
