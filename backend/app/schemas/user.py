from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from ..utils import utc_now


class UserBase(BaseModel):
    fullName: str | None = None
    email: EmailStr | None = None
    avatar_url: str | None = None
    nationalID: str | None = None
    nationality: str | None = None
    countryFlag: str | None = None
    address: str | None = None
    zip_code: int | None = None

    mfa_enabled: bool | None = None

    provider: str | None = None
    provider_user_id: str | None = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime | None = Field(default_factory=utc_now)


class UserUpdate(UserBase):
    password: str | None = None
