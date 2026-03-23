from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from ..utils import utc_now


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
    model_config = ConfigDict(from_attributes=True)

    id: int
    satellite_id: int | None = None
    created_at: datetime | None = Field(default_factory=utc_now)


class TLEUpdate(TLEBase):
    pass
