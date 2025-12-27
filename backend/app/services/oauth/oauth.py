from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import User
from app.services.base import BaseService
from app.services.oauth.base import OAuthProfile
from app.services.oauth.registry import OAUTH_PROVIDERS
from app.utils import generate_access_token, utc_now


class OauthService(BaseService):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def _get_or_create_user(self, profile: OAuthProfile) -> User | None:
        oauth = await self.session.scalar(
            select(self.model).where(
                self.model.provider == profile["provider"],
                self.model.provider_user_id == profile["provider_user_id"],
            )
        )

        if oauth:
            return await self.session.get(User, oauth.user_id)

        # same email → link account
        user = await self.session.scalar(
            select(User).where(User.email == str(profile["email"]))
        )

        if not user:
            new_user = User(
                email=profile["email"],
                fullName=profile["name"],
                provider=profile["provider"],
                provider_user_id=profile["provider_user_id"],
                email_verified=True,
                created_at=utc_now(),
            )
            await self._add(new_user)

            return new_user

        oauth = User(
            provider=profile["provider"],
            provider_user_id=profile["provider_user_id"],
            email=profile["email"],
            created_at=utc_now(),
        )
        await self._update(oauth)

        return user

    def _issue_access_token(self, user: User) -> str | None:
        return generate_access_token(
            data={
                "user": {
                    "id": str(user.id),
                    "name": user.fullName,
                }
            }
        )

    async def login(self, provider: str, code: str) -> str | None:
        adapter = OAUTH_PROVIDERS.get(provider)
        if not adapter:
            raise HTTPException(400, "Unsupported provider")

        token = await adapter.get_access_token(code)
        profile = await adapter.get_user_profile(token)

        if not profile:
            return None

        user = await self._get_or_create_user(profile)

        if not user:
            return None

        return self._issue_access_token(user)


# third-part login
# GITHUB_CLIENT_ID = "your_github_client_id"
# GITHUB_CLIENT_SECRET = "your_github_client_secret"
# GITHUB_REDIRECT_URI = (
#     "http://localhost:8000/github/auth/token"
# )
# GITHUB_AUTHORIZATION_URL = (
#     "https://github.com/login/oauth/authorize"
# )


# def resolve_github_token(
#     access_token: str = Depends(OAuth2()),
#     session: Session = Depends(get_session),
# ) -> User:
#     user_response = httpx.get(
#         "https://api.github.com/user",
#         headers={"Authorization": access_token},
#     ).json()
#     username = user_response.get("login", " ")
#     user = get_user(session, username)
#     if not user:
#         email = user_response.get("email", " ")
#         user = get_user(session, email)
#     # Process user_response to log
#     # the user in or create a new account
#     if not user:
#         raise HTTPException(
#             status_code=403, detail="Token not valid"
#         )
#     return user
