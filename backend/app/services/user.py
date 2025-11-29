from datetime import timedelta
from typing import Sequence
from uuid import UUID

from fastapi import BackgroundTasks, HTTPException, status
from fastapi_mail import NameEmail
from passlib.context import CryptContext
from passlib.exc import PasswordValueError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import app_settings
from app.database.models import User
from app.services.base import BaseService
from app.services.notification import NotificationService
from app.utils import (
    decode_url_safe_token,
    generate_access_token,
    generate_url_safe_token,
    utc_now,
)

from ..schemas import UserCreate

password_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


class UserService(BaseService):
    def __init__(self, session: AsyncSession, tasks: BackgroundTasks):
        super().__init__(User, session)
        self.notification_service = NotificationService(tasks)

    async def get(self, id: UUID) -> User | None:
        return await self._get(id)

    async def list_all(self) -> Sequence[User]:
        return await self._list()

    async def add_user(
        self, credentials: UserCreate, router_prefix: str = "user"
    ) -> User:
        try:
            new_user = User(
                **credentials.model_dump(exclude={"password"}),
                password_hash=password_context.hash(credentials.password),
                created_at=utc_now(),
            )
        except PasswordValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password"
            )

        new_user = await self._add(new_user)

        token = generate_url_safe_token(
            {"email": new_user.email, "id": str(new_user.id)}
        )

        # Send registration email with verification link
        await self.notification_service.send_email_with_template(
            recipients=[
                NameEmail(email=str(new_user.email), name=str(new_user.fullName))
            ],
            subject="Verify Your Account With Stella Orbital Track",
            context={
                "username": new_user.fullName,
                "verification_url": f"http://{app_settings.APP_DOMAIN}/{router_prefix}/verify?token={token}",
            },
            template_name="mail_email_verify.html",
        )

        return new_user

    async def verify_email(self, token: str):
        token_data = decode_url_safe_token(token)
        # Validate the token
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token"
            )
        # Update the verified field on the user
        # to mark user as verified
        user = await self._get(UUID(token_data["id"]))

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        user.email_verified = True

        await self._update(user)

    async def _get_by_email(self, email) -> User | None:
        return await self.session.scalar(
            select(self.model).where(self.model.email == email)
        )

    async def _generate_token(self, email, password) -> str:
        user = await self._get_by_email(email)

        if (
            user is None
            or not password_context.verify(
                password,
                user.password_hash,
            )
            or not user.email_verified
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email or Password is incorrect or not verified",
            )

        token = generate_access_token(
            data={
                "user": {
                    "name": user.fullName,
                    "id": str(user.id),
                }
            }
        )
        return token

    async def send_password_reset_link(self, email, router_prefix="user"):
        user = await self._get_by_email(email)

        token = generate_url_safe_token({"id": str(user.id)})

        await self.notification_service.send_email_with_template(
            recipients=[NameEmail(email=user.email, name=user.fullName)],
            subject="Stella Orbital Track Account Password Reset",
            context={
                "username": user.fullName,
                "reset_url": f"http://{app_settings.APP_DOMAIN}/{router_prefix}/verify?token={token}",
            },
            template_name="mail_password_reset.html",
        )

    async def reset_password(self, token: str, password: str) -> bool:
        token_data = decode_url_safe_token(
            token,
            expiry=timedelta(days=1),
        )

        if not token_data:
            return False

        user = await self._get(UUID(token_data["id"]))

        if user is None:
            return False

        user.password_hash = password_context.hash(password)

        await self._update(user)

        return True
