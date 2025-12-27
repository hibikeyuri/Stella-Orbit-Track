from typing import Protocol, TypedDict


class OAuthProfile(TypedDict):
    provider: str
    provider_user_id: str
    email: str
    name: str


class OAuthProvider(Protocol):
    async def get_access_token(self, code: str) -> str:
        ...

    async def get_user_profile(self, access_token: str) -> OAuthProfile:
        ...
