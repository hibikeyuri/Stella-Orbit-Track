import io
from typing import Annotated

import qrcode
from fastapi import APIRouter, Depends, Form, HTTPException, Request, Response, status
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
from app.core.security import oauth2_scheme
from app.database.redis import add_jti_to_blacklist
from app.utils import TEMPLATE_DIR

from ...schemas import UserCreate, UserRead, UserUpdate

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
    code: Annotated[str, Form()],
    mfa_service: MFAServiceDep,
):
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


### test oauth2 bearer function
@router.post("/test")
async def get_test(token: Annotated[str, Depends(oauth2_scheme)]):
    return await get_access_token(token)


### Verify User Email
@router.get("/verify")
async def verify_user_email(token: str, service: UserServiceDep):
    await service.verify_email(token)
    return {"detail": "Account verified"}


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
