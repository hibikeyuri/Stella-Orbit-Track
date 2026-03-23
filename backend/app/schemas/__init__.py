"""Schemas package – re-exports all schemas for backward compatibility."""

from .common import PaginatedResponse
from .propagation import (
    ConjunctionData,
    ConjunctionEvent,
    ConjunctionPosition,
    ConjunctionResponse,
    ECI,
    ErrorResponse,
    FlyoverData,
    FlyoverResponse,
    Geodetic,
    GroundTrackData,
    GroundTrackPoint,
    GroundTrackResponse,
    MultiSatPosition,
    MultiSatPositionResponse,
    OrbitalDecayData,
    OrbitalDecayResponse,
    PropagateCacheBase,
    PropagateCacheCreate,
    PropagateCacheRead,
    PropagateCacheUpdate,
    PropagationPositionData,
    PropagationPositionResponse,
    SkyPassData,
    SkyPassResponse,
    SkyTrackPoint,
)
from .satellite import SatelliteCreate, SatelliteRead, SatelliteUpdate
from .settings import SettingCreate, SettingRead, SettingUpdate
from .tle import TLECreate, TLERead, TLEUpdate
from .user import UserCreate, UserRead, UserUpdate

__all__ = [
    # Satellite
    "SatelliteCreate", "SatelliteRead", "SatelliteUpdate",
    # TLE
    "TLECreate", "TLERead", "TLEUpdate",
    # User
    "UserCreate", "UserRead", "UserUpdate",
    # Settings
    "SettingCreate", "SettingRead", "SettingUpdate",
    # Propagation
    "PropagateCacheBase", "PropagateCacheCreate", "PropagateCacheRead", "PropagateCacheUpdate",
    "ECI", "Geodetic", "ErrorResponse",
    "PropagationPositionData", "PropagationPositionResponse",
    "FlyoverData", "FlyoverResponse",
    "GroundTrackPoint", "GroundTrackData", "GroundTrackResponse",
    "MultiSatPosition", "MultiSatPositionResponse",
    "ConjunctionPosition", "ConjunctionEvent", "ConjunctionData", "ConjunctionResponse",
    "SkyTrackPoint", "SkyPassData", "SkyPassResponse",
    "OrbitalDecayData", "OrbitalDecayResponse",
    # Pagination
    "PaginatedResponse",
]
