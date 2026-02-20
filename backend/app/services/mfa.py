from uuid import UUID

import pyotp
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import User
from app.services.base import BaseService
from app.utils import decode_url_safe_token, generate_url_safe_token, utc_now


class MFAService(BaseService):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def _get_by_email(self, email):
        return await self.session.scalar(
            select(self.model).where(self.model.email == email)
        )

    async def _generate_mfa_token(self, email: str) -> str | None:
        user = await self._get_by_email(email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No user",
            )
        
        token = generate_url_safe_token({"id": str(user.id), "email": email})

        return token

    async def check_mfa(self, email: str) -> bool:
        user = await self._get_by_email(email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        if user.mfa_enabled:
            return True
        else:
            return False

    async def _enable_mfa(self, token: str) -> dict:
        """Generate secret and return URI to frontend"""
        token_data = decode_url_safe_token(token)

        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid MFA token"
            )

        mfa_user = await self._get(UUID(token_data["id"]))

        # generate TOTP secret (don't enable yet — wait for verify)
        secret = pyotp.random_base32()
        mfa_user.totp_secret = secret

        await self._update(mfa_user)

        # create QR code using uri schema
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=mfa_user.email, issuer_name="Stella Orbital Track"
        )

        return {"secret": secret, "otpauth_uri": totp_uri}

    async def verify_code(self, token: str, code: str) -> bool:
        """Verify TOTP when user logs in (2nd stage)"""
        temp_token_data = decode_url_safe_token(token)

        if not temp_token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid MFA token"
            )

        mfa_user = await self._get(UUID(temp_token_data["id"]))

        if not mfa_user.totp_secret or not mfa_user.mfa_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="MFA is not enabled"
            )

        totp = pyotp.TOTP(mfa_user.totp_secret)

        is_valid = totp.verify(code)

        # If this is the first successful verification, activate MFA
        if is_valid and not mfa_user.mfa_enabled:
            mfa_user.mfa_enabled = True
            mfa_user.mfa_enabled_at = utc_now()
            await self._update(mfa_user)

        return is_valid

    async def disable_mfa(self, id: UUID):
        mfa_user = await self._get(id)

        mfa_user.totp_secret = None
        mfa_user.mfa_enabled = False
        mfa_user.mfa_enabled_at = None

        await self._update(mfa_user)
