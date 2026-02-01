from datetime import datetime
from typing import Dict
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from .utils import utc_now


class SatelliteBase(BaseModel):
    name: str | None = None
    date: datetime | None = None
    category: str | None = None
    line1: str | None = None
    line2: str | None = None
    norad_id: int | None = None
    is_active: bool | None = True
    img: str | None = None


class SatelliteCreate(SatelliteBase):
    pass


class SatelliteRead(SatelliteBase):
    id: int
    created_at: datetime | None = Field(default_factory=utc_now)

    class Config:
        orm_mode = True


class SatelliteUpdate(SatelliteBase):
    pass


class TLEBase(BaseModel):
    name: str | None = None
    line1: str | None = None
    line2: str | None = None
    inclination: float | None = None
    eccentricity: float | None = None
    semi_major_axis: float | None = None
    period: float | None = None
    raan: float | None = None
    argument_of_perigee: float | None = None
    mean_anomaly: float | None = None
    mean_motion: float | None = None
    age_days: float | None = None


class TLECreate(TLEBase):
    satellite_id: int | None = None


class TLERead(TLEBase):
    id: int
    satellite_id: int | None = None
    created_at: datetime | None = Field(default_factory=utc_now)

    class Config:
        orm_mode = True


class TLEUpdate(TLEBase):
    pass


class PropagateCacheBase(BaseModel):
    target_time: datetime | None = None
    latitude: float | None = None
    longitude: float | None = None
    altitude: float | None = None
    position: Dict | None = None
    velocity: Dict | None = None
    algorithm: str | None = None


class PropagateCacheCreate(PropagateCacheBase):
    tle_id: int | None = None


class PropagateCacheRead(PropagateCacheBase):
    id: int
    tle_id: int | None = None
    created_at: datetime | None = Field(default_factory=utc_now)

    class Config:
        orm_mode = True


class PropagateCacheUpdate(PropagateCacheBase):
    pass


class UserBase(BaseModel):
    fullName: str | None = None
    email: EmailStr | None = None
    nationalID: str | None = None
    nationality: str | None = None
    countryFlag: str | None = None

    mfa_enabled: bool | None = None

    provider: str | None = None
    provider_user_id: str | None = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: UUID
    created_at: datetime | None = Field(default_factory=utc_now)

    class Config:
        orm_mode = True


class UserUpdate(UserBase):
    password: str | None = None


class SettingBase(BaseModel):
    minLength: int | None = None
    maxLength: int | None = None
    maxPayload: float | None = None
    minPayload: int | None = None
    price: float | None = None


class SettingCreate(SettingBase):
    pass


class SettingRead(SettingBase):
    id: int
    created_at: datetime | None = Field(default_factory=utc_now)

    class Config:
        orm_mode = True


class SettingUpdate(SettingBase):
    pass


class ErrorResponse(BaseModel):
    code: int
    message: str


class ECI(BaseModel):
    position_km: list[float]
    velocity_km_s: list[float]


class Geodetic(BaseModel):
    latitude: float
    longitude: float
    altitude: float


class PropagationPositionData(BaseModel):
    satellite_id: int
    tle_id: int | None
    norad_id: int | None
    eci: ECI
    geodetic: Geodetic
    timestamp: datetime
    frame: str = "TEME"


class PropagationPositionResponse(BaseModel):
    data: PropagationPositionData | None = None
    error: ErrorResponse | None = None


class FlyoverData(BaseModel):
    satellite_id: int
    tle_id: int | None
    observer_lat: float
    observer_lon: float
    duration_minutes: int
    step_seconds: int
    start: datetime | None
    peak: datetime | None
    end: datetime | None
    maxElevation: float


class FlyoverResponse(BaseModel):
    data: FlyoverData | None = None
    error: ErrorResponse | None = None
