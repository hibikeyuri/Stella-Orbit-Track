from datetime import datetime
from typing import Dict

from pydantic import BaseModel, ConfigDict, Field

from ..utils import utc_now


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
    model_config = ConfigDict(from_attributes=True)

    id: int
    tle_id: int | None = None
    created_at: datetime | None = Field(default_factory=utc_now)


class PropagateCacheUpdate(PropagateCacheBase):
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


class GroundTrackPoint(BaseModel):
    lat: float
    lon: float
    alt: float
    timestamp: str


class GroundTrackData(BaseModel):
    satellite_id: int
    norad_id: int | None
    name: str | None
    points: list[GroundTrackPoint]


class GroundTrackResponse(BaseModel):
    data: GroundTrackData | None = None
    error: ErrorResponse | None = None


# ── Multi-satellite batch position ─────────────────────────────
class MultiSatPosition(BaseModel):
    satellite_id: int
    norad_id: int | None
    name: str | None
    lat: float
    lon: float
    alt: float
    velocity_km_s: float


class MultiSatPositionResponse(BaseModel):
    data: list[MultiSatPosition]
    error: ErrorResponse | None = None


# ── Conjunction analysis ────────────────────────────────────────
class ConjunctionPosition(BaseModel):
    lat: float
    lon: float
    alt: float


class ConjunctionEvent(BaseModel):
    time: str
    distance_km: float
    sat_a: ConjunctionPosition
    sat_b: ConjunctionPosition


class ConjunctionData(BaseModel):
    sat_id_a: int
    sat_id_b: int
    duration_hours: int
    threshold_km: float
    closest_approach_km: float
    closest_approach_time: str
    events: list[ConjunctionEvent]


class ConjunctionResponse(BaseModel):
    data: ConjunctionData | None = None
    error: ErrorResponse | None = None


# ── Sky pass track (polar plot data) ───────────────────────────
class SkyTrackPoint(BaseModel):
    time: str
    azimuth: float
    elevation: float


class SkyPassData(BaseModel):
    satellite_id: int
    norad_id: int | None
    name: str | None
    observer_lat: float
    observer_lon: float
    rise_time: str
    set_time: str
    max_elevation: float
    track: list[SkyTrackPoint]


class SkyPassResponse(BaseModel):
    data: SkyPassData | None = None
    error: ErrorResponse | None = None


# ── Orbital decay estimation ───────────────────────────────────
class OrbitalDecayData(BaseModel):
    satellite_id: int
    norad_id: int | None
    name: str | None
    altitude_km: float
    mean_motion: float
    ndot: float
    bstar: float
    estimated_days_to_decay: float | None
    risk_level: str


class OrbitalDecayResponse(BaseModel):
    data: OrbitalDecayData | None = None
    error: ErrorResponse | None = None
