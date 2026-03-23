"""Tests for worker/tasks.py — TLE text parsing, NORAD ID extraction."""

import pytest

from app.worker.tasks import _parse_norad_id, _parse_tle_text


# ── _parse_norad_id ──────────────────────────────────────────────


def test_parse_norad_id_normal():
    assert _parse_norad_id("1 25544U 98067A   20029.54791435  .00001264  00000-0  29634-4 0  9993") == 25544


def test_parse_norad_id_with_suffix():
    assert _parse_norad_id("1 25544U 98067A   ...") == 25544


def test_parse_norad_id_empty():
    assert _parse_norad_id("") is None


def test_parse_norad_id_no_digits():
    assert _parse_norad_id("1 XXXXU") is None


# ── _parse_tle_text ──────────────────────────────────────────────


def test_parse_tle_text_single_satellite():
    text = (
        "ISS (ZARYA)\n"
        "1 25544U 98067A   20029.54791435  .00001264  00000-0  29634-4 0  9993\n"
        "2 25544  51.6431  65.1511 0007417  91.2857  13.1246 15.49147143210616\n"
    )
    items = _parse_tle_text(text)
    assert len(items) == 1
    assert items[0]["name"] == "ISS (ZARYA)"
    assert items[0]["norad_id"] == 25544
    assert items[0]["line1"].startswith("1 ")
    assert items[0]["line2"].startswith("2 ")


def test_parse_tle_text_multiple_satellites():
    text = (
        "ISS (ZARYA)\n"
        "1 25544U 98067A   20029.54791435  .00001264  00000-0  29634-4 0  9993\n"
        "2 25544  51.6431  65.1511 0007417  91.2857  13.1246 15.49147143210616\n"
        "HUBBLE\n"
        "1 20580U 90037B   20029.50000000  .00000421  00000-0  15023-4 0  9999\n"
        "2 20580  28.4700 102.0000 0002700 320.0000  40.0000 15.09000000100000\n"
    )
    items = _parse_tle_text(text)
    assert len(items) == 2
    assert items[0]["name"] == "ISS (ZARYA)"
    assert items[1]["name"] == "HUBBLE"


def test_parse_tle_text_empty():
    assert _parse_tle_text("") == []
    assert _parse_tle_text("   \n\n  ") == []


def test_parse_tle_text_malformed_skips():
    """Lines that don't start with '1 ' and '2 ' should be skipped."""
    text = (
        "GARBAGE\n"
        "NOT A TLE LINE\n"
        "ALSO NOT\n"
        "ISS (ZARYA)\n"
        "1 25544U 98067A   20029.54791435  .00001264  00000-0  29634-4 0  9993\n"
        "2 25544  51.6431  65.1511 0007417  91.2857  13.1246 15.49147143210616\n"
    )
    items = _parse_tle_text(text)
    assert len(items) == 1
    assert items[0]["name"] == "ISS (ZARYA)"


def test_parse_tle_text_blank_lines():
    """Blank lines between entries should be handled."""
    text = (
        "ISS (ZARYA)\n"
        "1 25544U 98067A   20029.54791435  .00001264  00000-0  29634-4 0  9993\n"
        "2 25544  51.6431  65.1511 0007417  91.2857  13.1246 15.49147143210616\n"
        "\n"
        "\n"
        "HUBBLE\n"
        "1 20580U 90037B   20029.50000000  .00000421  00000-0  15023-4 0  9999\n"
        "2 20580  28.4700 102.0000 0002700 320.0000  40.0000 15.09000000100000\n"
    )
    items = _parse_tle_text(text)
    assert len(items) == 2
