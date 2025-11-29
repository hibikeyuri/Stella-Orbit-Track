from typing import Annotated

from fastapi import APIRouter, Depends, Form, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from pydantic import EmailStr

from app.api.dependencies import UserDep, UserServiceDep, get_access_token
from app.core.security import oauth2_scheme
from app.database.redis import add_jti_to_blacklist
from app.utils import TEMPLATE_DIR

from ...schemas import UserCreate, UserRead

router = APIRouter(prefix="/user", tags=["User"])


### Register a user
@router.post("/signup", response_model=UserRead)
async def register_user(user: UserCreate, service: UserServiceDep):
    return await service.add_user(user)


### Login the user
@router.post("/token")
async def login_user(
    request_form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: UserServiceDep,
):
    token = await service._generate_token(request_form.username, request_form.password)
    return {
        "access_token": token,
        "type": "jwt",
    }


### Get user profile
@router.get("/me", response_model=UserRead)
async def get_user_profile(user: UserDep):
    return user


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
    templates = Jinja2Templates(TEMPLATE_DIR)

    return templates.TemplateResponse(
        request=request,
        name="password/reset.html",
        context={
            "reset_url": f"http://localhost:8000/user/reset_password?token={token}"
        },
    )


### Reset Seller Password
@router.post("/reset_password")
async def reset_password(
    request: Request,
    token: str,
    password: Annotated[str, Form()],
    service: UserServiceDep,
):
    is_success = await service.reset_password(token, password)

    templates = Jinja2Templates(TEMPLATE_DIR)
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
    print("我的資料 token_data:", token_data)
    await add_jti_to_blacklist(token_data["jti"])
    return {"detail": "Successfully logged out"}
