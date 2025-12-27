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


# @router.get("/auth/url")
# def github_login():
#     return {
#         "auth_url": GITHUB_AUTHORIZATION_URL
#         + f"?client_id={GITHUB_CLIENT_ID}"
#     }


# @router.get(
#     "/github/auth/token",
#     response_model=Token,
#     responses={
#         status.HTTP_401_UNAUTHORIZED: {
#             "description": "User not registered"
#         }
#     },
# )
# async def github_callback(code: str):
#     token_response = httpx.post(
#         "https://github.com/login/oauth/access_token",
#         data={
#             "client_id": GITHUB_CLIENT_ID,
#             "client_secret": GITHUB_CLIENT_SECRET,
#             "code": code,
#             "redirect_uri": GITHUB_REDIRECT_URI,
#         },
#         headers={"Accept": "application/json"},
#     ).json()
#     access_token = token_response.get("access_token")
#     if not access_token:
#         raise HTTPException(
#             status_code=401,
#             detail="User not registered",
#         )
#     token_type = token_response.get(
#         "token_type", "bearer"
#     )

#     return {
#         "access_token": access_token,
#         "token_type": token_type,
#     }
