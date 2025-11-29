from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable, Union
from uuid import uuid4

import jwt
from fastapi import HTTPException
from fastapi_mail import NameEmail
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from pydantic import EmailStr

from app.config import security_settings

_serializer = URLSafeTimedSerializer(security_settings.TOKEN_SAFE_SECRET)


APP_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_DIR = APP_DIR / "templates"

if not TEMPLATE_DIR.exists() or not TEMPLATE_DIR.is_dir():
    raise RuntimeError(f"Template folder not found: {TEMPLATE_DIR}")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def to_nameemail(
    recipients: Iterable[Union[str, EmailStr, NameEmail]],
) -> list[NameEmail]:
    result: list[NameEmail] = []
    for r in recipients:
        if r is None:
            continue
        if isinstance(r, NameEmail):
            result.append(r)
        else:
            result.append(NameEmail(email=str(r), name=str(r)))

    return result


def generate_access_token(
    data: dict,
    expiry: timedelta = timedelta(days=7),
) -> str:
    payload = {
        **data,
        "jti": str(uuid4()),
        "exp": datetime.now(timezone.utc) + expiry,
    }
    return jwt.encode(
        payload,
        key=security_settings.JWT_SECRET,
        algorithm=security_settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(
            token,
            key=security_settings.JWT_SECRET,
            algorithms=[security_settings.JWT_ALGORITHM],
        )
    except jwt.PyJWTError:
        return None
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Expired token",
        )


def generate_url_safe_token(
    data: dict, salt: str | None = security_settings.TOKEN_SALT
) -> str:
    return _serializer.dumps(data, salt=salt)


def decode_url_safe_token(
    token: str,
    salt: str | None = security_settings.TOKEN_SALT,
    expiry: timedelta | None = timedelta(days=3),
) -> dict | None:
    try:
        return _serializer.loads(
            token,
            salt=salt,
            max_age=int(expiry.total_seconds()) if expiry else None,
        )
    except (BadSignature, SignatureExpired):
        return None
