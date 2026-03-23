from datetime import datetime, timezone
from uuid import UUID, uuid4

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


class Satellite(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str | None = Field(default=None, description="satellite name")
    created_at: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc), description="build time"
    )
    date: datetime | None = Field(default=None, description="launch date")
    category: str | None = Field(default=None, description="type")
    line1: str | None = Field(default=None, description="TLE first line")
    line2: str | None = Field(default=None, description="TLE second line")
    norad_id: int | None = Field(
        default=None, index=True, unique=True, description="NORAD ID"
    )
    is_active: bool | None = Field(default=True, description="active")
    img: str | None = Field(default=None, description="img")

    # Relations
    tles: list["TLE"] = Relationship(back_populates="satellite")


class TLE(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    satellite_id: int | None = Field(default=None, foreign_key="satellite.id")
    name: str | None = Field(default=None, description="TLE name")
    line1: str | None = Field(default=None, description="TLE first line")
    line2: str | None = Field(default=None, description="TLE second line")
    inclination: float | None = Field(default=None, description="inclination")
    eccentricity: float | None = Field(default=None, description="eccentricity")
    semi_major_axis: float | None = Field(default=None, description="semi_major_axis")
    period: float | None = Field(default=None, description="period")
    raan: float | None = Field(default=None, description="raan")
    created_at: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc), description="build time"
    )
    argument_of_perigee: float | None = Field(
        default=None, description="argument_of_perigee"
    )
    mean_anomaly: float | None = Field(default=None, description="mean_anomaly")
    mean_motion: float | None = Field(default=None, description="mean_motion")
    age_days: float | None = Field(default=None, description="age_days")

    # Relations
    satellite: Satellite | None = Relationship(back_populates="tles")
    # propagate_caches: list["PropagateCache"] = Relationship(back_populates="tle")


# class PropagateCache(SQLModel, table=True):
#     id: int | None = Field(default=None, primary_key=True)
#     created_at: datetime | None = Field(
#         default_factory=lambda: datetime.now(timezone.utc), description="build time"
#     )
#     tle_id: int | None = Field(default=None, foreign_key="tle.id")
#     target_time: datetime | None = Field(default=None, description="target_time")
#     latitude: float | None = Field(default=None, description="latitude")
#     longitude: float | None = Field(default=None, description="longitude")
#     altitude: float | None = Field(default=None, description="altitude")
#     position: Dict | None = Field(default=None, description="position")
#     velocity: Dict | None = Field(default=None, description="velocity")
#     algorithm: str | None = Field(default=None, description="computing algorithm")

#     # Relations
#     tle: TLE | None = Relationship(back_populates="propagate_caches")


class User(SQLModel, table=True):
    __tablename__ = "user"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    password_hash: str | None = Field(default=None, description="password hash")
    created_at: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc), description="build time"
    )
    fullName: str | None = Field(default=None, description="fullName")
    avatar_url: str | None = Field(default=None, description="avatar url")

    email: EmailStr | None = Field(
        default=None, unique=True, index=True, description="email"
    )
    email_verified: bool = Field(default=False, description="email_verified")

    provider: str | None = Field(default=None, description="third-party provider")
    provider_user_id: str | None = Field(default=None, description="provider id")

    totp_secret: str | None = Field(default=None, description="totp_secret")
    mfa_enabled: bool = Field(default=False, description="enable_mfa")
    mfa_enabled_at: datetime | None = Field(default=None)

    nationalID: str | None = Field(default=None, unique=True, description="nationalID")
    nationality: str | None = Field(default=None, description="nationality")
    countryFlag: str | None = Field(default=None, description="countryFlag")
    address: str | None = Field(default=None, description="address")
    zip_code: int | None = Field(default=None, description="zip_code")


class Setting(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=lambda: datetime.now(timezone.utc), description="build time"
    )
    default_propagation_minutes: int | None = Field(default=90, description="default propagation duration in minutes")
    default_ground_track_minutes: int | None = Field(default=90, description="default ground track duration")
    conjunction_threshold_km: float | None = Field(default=50.0, description="conjunction warning threshold in km")
    flyover_min_elevation: float | None = Field(default=10.0, description="minimum elevation for flyover in degrees")
    celestrak_sync_interval: int | None = Field(default=3600, description="celestrak sync interval in seconds")
    tle_refresh_interval: int | None = Field(default=900, description="TLE refresh interval in seconds")
    map_default_zoom: int | None = Field(default=3, description="default map zoom level")
