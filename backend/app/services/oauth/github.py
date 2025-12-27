import httpx

from app.config import github_settings

from .base import OAuthProfile


class GitHubOAuthProvider:
    name = "github"

    async def get_access_token(self, code: str) -> str:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": github_settings.GITHUB_CLIENT_ID,
                    "client_secret": github_settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                },
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

        return data["access_token"]

    async def get_user_profile(self, access_token: str) -> OAuthProfile:
        async with httpx.AsyncClient() as client:
            user_resp = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                },
                timeout=10,
            )
            user_resp.raise_for_status()
            user = user_resp.json()

            email_resp = await client.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                },
                timeout=10,
            )
            email_resp.raise_for_status()
            emails = email_resp.json()

            print(emails)

            primary_email = None
            for e in emails:
                if e.get("primary") and e.get("verified"):
                    primary_email = e["email"]
                    break

        return {
            "provider": self.name,
            "provider_user_id": str(user["id"]),
            "email": str(primary_email),
            "name": user.get("name") or user.get("login"),
        }
