from urllib.parse import urlencode

from fastapi import APIRouter, HTTPException

from app.api.dependencies import OauthServiceDep
from app.config import github_settings, google_settings

router = APIRouter(prefix="/oauth", tags=["Oauth"])


@router.get("/{provider}/login")
async def oauth_login(provider: str, service: OauthServiceDep):
    try:
        if provider.lower() == "github":
            params = {
                "client_id": github_settings.GITHUB_CLIENT_ID,
                "scope": "user:email",
            }
            auth_url = (
                github_settings.GITHUB_AUTHORIZATION_URL + "?" + urlencode(params)
            )

        elif provider.lower() == "google":
            params = {
                "client_id": google_settings.GOOGLE_CLIENT_ID,
                "redirect_uri": google_settings.GOOGLE_REDIRECT_URI,
                "response_type": "code",
                "scope": "openid email profile",
                "access_type": "offline",
                "prompt": "consent",
            }
            auth_url = (
                google_settings.GOOGLE_AUTHORIZATION_URL + "?" + urlencode(params)
            )

        else:
            raise HTTPException(status_code=400, detail="Unsupported provider")

        return {"auth_url": auth_url}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str,
    service: OauthServiceDep,
):
    token = await service.login(provider, code)
    return {
        "access_token": token,
        "token_type": "bearer",
    }
