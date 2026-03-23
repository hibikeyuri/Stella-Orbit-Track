from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from ..utils import utc_now


class SettingBase(BaseModel):
    default_propagation_minutes: int | None = None
    default_ground_track_minutes: int | None = None
    conjunction_threshold_km: float | None = None
    flyover_min_elevation: float | None = None
    celestrak_sync_interval: int | None = None
    tle_refresh_interval: int | None = None
    map_default_zoom: int | None = None


class SettingCreate(SettingBase):
    pass


class SettingRead(SettingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime | None = Field(default_factory=utc_now)


class SettingUpdate(SettingBase):
    pass
