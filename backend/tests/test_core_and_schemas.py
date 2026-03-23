"""Tests for core/logging module and schemas validation."""

import logging

import pytest
from pydantic import ValidationError

from app.core.logging import get_logger, setup_logging
from app.schemas import (
    SatelliteCreate,
    SettingCreate,
    TLECreate,
    UserCreate,
)


# ── Logging ──────────────────────────────────────────────────────


def test_setup_logging():
    setup_logging(logging.DEBUG)
    root = logging.getLogger()
    assert root.level == logging.DEBUG


def test_get_logger_returns_named():
    logger = get_logger("test.module")
    assert logger.name == "test.module"


def test_noisy_loggers_silenced():
    setup_logging()
    for name in ("sqlalchemy.engine", "httpx", "httpcore", "watchfiles"):
        assert logging.getLogger(name).level >= logging.WARNING


# ── Schema validation ────────────────────────────────────────────


def test_satellite_create_valid():
    s = SatelliteCreate(name="Test Sat", norad_id=12345, is_active=True)
    assert s.name == "Test Sat"


def test_tle_create_valid():
    t = TLECreate(
        satellite_id=1,
        name="ISS",
        line1="1 25544U ...",
        line2="2 25544 ...",
    )
    assert t.satellite_id == 1


def test_user_create_valid():
    u = UserCreate(fullName="Alice", email="alice@example.com", password="SecretPass123")
    assert u.email == "alice@example.com"


def test_user_create_invalid_email():
    with pytest.raises(ValidationError):
        UserCreate(fullName="Alice", email="not-an-email", password="x")


def test_setting_create_accepts_none():
    s = SettingCreate()
    assert s.default_propagation_minutes is None
    assert s.conjunction_threshold_km is None


def test_setting_create_with_values():
    s = SettingCreate(default_propagation_minutes=120, map_default_zoom=5)
    assert s.default_propagation_minutes == 120
    assert s.map_default_zoom == 5
