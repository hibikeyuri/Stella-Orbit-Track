from typing import Annotated
from uuid import UUID

from fastapi import BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import oauth2_scheme
from app.database.models import User
from app.database.redis import is_jti_blacklisted
from app.database.session import get_session
from app.services.mfa import MFAService
from app.services.oauth.oauth import OauthService
from app.services.propagatecache import PropagationService
from app.services.satellite import SatelliteService
from app.services.tle import TLEService
from app.services.user import UserService
from app.utils import decode_access_token

SessionDep = Annotated[AsyncSession, Depends(get_session)]


def get_satellite_service(session: SessionDep):
    return SatelliteService(session)


SatelliteServiceDep = Annotated[
    SatelliteService,
    Depends(get_satellite_service),
]


def get_tle_service(session: SessionDep):
    return TLEService(session)


def get_propagation_service(session: SessionDep):
    return PropagationService(session)


# Access token data dep
async def get_access_token(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
    data = decode_access_token(token)

    if data is None or await is_jti_blacklisted(data["jti"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )

    return data


async def get_current_user(
    token_data: Annotated[dict, Depends(get_access_token)],
    session: SessionDep,
):
    return await session.get(User, UUID(token_data["user"]["id"]))


def get_user_service(session: SessionDep, tasks: BackgroundTasks):
    return UserService(session, tasks)


def get_mfa_service(session: SessionDep):
    return MFAService(session)


def get_oauth_service(session: SessionDep):
    return OauthService(session)


# Dependency Chain:
# get_access_token -> get_current_user -> UserDep
UserDep = Annotated[User, Depends(get_current_user)]

UserServiceDep = Annotated[UserService, Depends(get_user_service)]
MFAServiceDep = Annotated[MFAService, Depends(get_mfa_service)]
OauthServiceDep = Annotated[OauthService, Depends(get_oauth_service)]
TLEServiceDep = Annotated[TLEService, Depends(get_tle_service)]
PropagationServiceDep = Annotated[PropagationService,Depends(get_propagation_service),]
