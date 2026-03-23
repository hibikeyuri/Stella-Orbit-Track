import io
import uuid
from pathlib import Path
from typing import Annotated

import qrcode
from fastapi import APIRouter, Depends, Form, HTTPException, Request, Response, UploadFile, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from pydantic import EmailStr

from app.api.dependencies import (
    MFAServiceDep,
    UserDep,
    UserServiceDep,
    get_access_token,
)
from app.config import app_settings
from app.core.logging import get_logger
from app.core.security import oauth2_scheme
from app.database.redis import add_jti_to_blacklist
from app.utils import TEMPLATE_DIR

from ...schemas import UserCreate, UserRead, UserUpdate

logger = get_logger(__name__)

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "avatars"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_AVATAR_BYTES = 5 * 1024 * 1024  # 5 MB

router = APIRouter(prefix="/user", tags=["User"])
templates = Jinja2Templates(TEMPLATE_DIR)


### Register a user
@router.post("/signup", response_model=UserRead)
async def register_user(user: UserCreate, service: UserServiceDep):
    return await service.add_user(user)


### Login the user
@router.post("/token")
async def login_user(
    request_form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: UserServiceDep,
    mfa_service: MFAServiceDep,
):
    user = await service.authenticate_user(request_form.username, request_form.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="username or password is wrong",
        )

    if await mfa_service.check_mfa(request_form.username):
        temp_token = await mfa_service._generate_mfa_token(request_form.username)
        return {
            "mfa_required": True,
            "temp_token": temp_token,
        }
    token = await service._generate_token(request_form.username, request_form.password)
    return {
        "access_token": token,
        "type": "jwt",
    }


### Login the User by MFA
@router.post("/token/mfa")
async def login_mfa(
    temp_token: Annotated[str, Form()],
    code: Annotated[str, Form()],
    service: UserServiceDep,
    mfa_service: MFAServiceDep,
):
    valid = await mfa_service.verify_code(temp_token, code)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA code",
        )

    access_token = await service._generate_token_mfa(temp_token)
    return {
        "access_token": access_token,
        "type": "jwt",
    }


### Input MFA
@router.get("/mfa_verify_page")
async def mfa_verify_page(request: Request, temp_token: str):
    return templates.TemplateResponse(
        "mfa/mfa_verify.html",
        {
            "request": request,
            "temp_token": temp_token,
            "verify_url": f"{app_settings.base_url}/user/token/mfa?temp_token={temp_token}",
        },
    )


### Enable MFA
@router.post("/enable_mfa_page")
async def get_enable_mfa_page(
    request: Request,
    user: UserDep,
    service: MFAServiceDep,
):
    if not user.email:
        return {"error": "No User"}

    temp_token = await service._generate_mfa_token(user.email)

    if not temp_token:
        return {"error": "no temp_token"}

    mfa_data = await service._enable_mfa(temp_token)

    return templates.TemplateResponse(
        request=request,
        name="mfa/mfa_setup.html",
        context={
            "request": request,
            "otpauth_uri": str(mfa_data["otpauth_uri"]),
            "qrcode_url": f"{app_settings.base_url}/user/mfa/qrcode?uri={mfa_data['otpauth_uri']}",
            "verify_url": f"{app_settings.base_url}/user/enable_mfa_verify?temp_token={temp_token}",
        },
    )


### Enable MFA
@router.get("/enable_mfa")
async def enable_mfa(user: UserDep, service: MFAServiceDep):
    if not user.email:
        return {"error": "No User"}

    temp_token = await service._generate_mfa_token(user.email)

    if not temp_token:
        return {"error": "no temp_token"}

    mfa_data = await service._enable_mfa(temp_token)

    return {
        "temp_token": temp_token,
        "otpauth_uri": str(mfa_data["otpauth_uri"]),
        "verify_url": f"/user/enable_mfa_verify?temp_token={temp_token}",
    }


### Generate QR code
@router.get("/mfa/qrcode")
async def generate_mfa_qrcode(uri: str):
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return Response(content=buf.getvalue(), media_type="image/png")


### Verify MFA settings
@router.post("/enable_mfa_verify")
async def verify_mfa_code(
    temp_token: str,
    code: Annotated[str, Form()] = None,
    mfa_service: MFAServiceDep = None,
):
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code is required",
        )

    valid = await mfa_service.verify_code(temp_token, code)

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MFA code",
        )

    return {"detail": "MFA enabled successfully"}


### Get user profile
@router.get("/me", response_model=UserRead)
async def get_user_profile(user: UserDep):
    return user


### Update user profile
@router.patch("/me", response_model=UserRead)
async def update_user_profile(
    data: UserUpdate,
    user: UserDep,
    service: UserServiceDep,
):
    return await service.update_user(user, data)


### Upload avatar
@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile,
    user: UserDep,
    service: UserServiceDep,
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG/WebP/GIF allowed")

    contents = await file.read()
    if len(contents) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=400, detail="Avatar must be under 5 MB")

    ext = file.filename.rsplit(".", 1)[-1] if "." in (file.filename or "") else "jpg"
    filename = f"{user.id}.{ext}"
    (UPLOAD_DIR / filename).write_bytes(contents)

    avatar_url = f"{app_settings.base_url}/user/avatar/{filename}"
    user.avatar_url = avatar_url
    updated = await service.update_user(user, UserUpdate())
    return {"avatar_url": updated.avatar_url}


### Serve avatar
@router.get("/avatar/{filename}")
async def serve_avatar(filename: str):
    safe_name = Path(filename).name  # prevent directory traversal
    filepath = UPLOAD_DIR / safe_name
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Avatar not found")

    suffix = filepath.suffix.lower()
    media_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif"}
    media_type = media_map.get(suffix, "application/octet-stream")
    return Response(content=filepath.read_bytes(), media_type=media_type)


### Verify User Email
@router.get("/verify")
async def verify_user_email(token: str, service: UserServiceDep):
    try:
        await service.verify_email(token)
        # Redirect to frontend with success status
        return RedirectResponse(
            url=f"{app_settings.FRONTEND_URL}/login?verified=true",
            status_code=302,
        )
    except HTTPException:
        return RedirectResponse(
            url=f"{app_settings.FRONTEND_URL}/login?verified=false",
            status_code=302,
        )


### Email Password Reset Link
@router.get("/forgot_password")
async def forgot_password(email: EmailStr, service: UserServiceDep):
    await service.send_password_reset_link(email)
    return {"detail": "Check email for password reset link"}


### Password Reset Form
@router.get("/reset_password_form")
async def get_reset_password_form(request: Request, token: str):
    return templates.TemplateResponse(
        request=request,
        name="password/reset.html",
        context={
            "reset_url": f"{app_settings.base_url}/user/reset_password?token={token}"
        },
    )


### Reset User Password
@router.post("/reset_password")
async def reset_password(
    request: Request,
    token: str,
    password: Annotated[str, Form()],
    service: UserServiceDep,
):
    is_success = await service.reset_password(token, password)

    return templates.TemplateResponse(
        request=request,
        name="password/reset_success.html"
        if is_success
        else "password/reset_failed.html",
    )


### Logout the user
@router.post("/logout")
async def logout_user(
    token_data: Annotated[dict, Depends(get_access_token)],
):
    await add_jti_to_blacklist(token_data["jti"])
    return {"detail": "Successfully logged out"}
