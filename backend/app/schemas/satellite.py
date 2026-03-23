from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from ..utils import utc_now


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
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime | None = Field(default_factory=utc_now)


class SatelliteUpdate(SatelliteBase):
    pass
