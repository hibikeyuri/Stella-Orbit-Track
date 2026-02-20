import httpx

from app.config import google_settings

from .base import OAuthProfile


class GoogleOAuthProvider:
    name = "google"

    async def get_access_token(self, code: str) -> str:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": google_settings.GOOGLE_CLIENT_ID,
                    "client_secret": google_settings.GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": google_settings.GOOGLE_REDIRECT_URI,
                },
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

        return data["access_token"]

    async def get_user_profile(self, access_token: str) -> OAuthProfile:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={
                    "Authorization": f"Bearer {access_token}",
                },
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

        return {
            "provider": self.name,
            "provider_user_id": data["id"],
            "email": data["email"],
            "name": data.get("name", ""),
            "avatar_url": data.get("picture"),
        }
