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
        }


# {
#   "web": {
#     "client_id": "1002443518940-c9gv7ngn86a5nf19p73218jchrv0arl8.apps.googleusercontent.com",
#     "project_id": "address-to-lang-long",
#     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
#     "token_uri": "https://oauth2.googleapis.com/token",
#     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
#     "client_secret": "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",
#     "redirect_uris": ["https://localhost:8000/oauth/google/callback"]
#   }
# }
