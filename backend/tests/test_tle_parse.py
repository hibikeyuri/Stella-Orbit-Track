from app.services.tle import TLEService


def test_parse_line2_success():
    service = TLEService(session=None)
    line2 = "2 25544  51.6431  65.1511 0007417  91.2857  13.1246 15.49147143210616"

    data = service._parse_line2(line2)

    assert data["inclination"] > 0
    assert data["mean_motion"] > 0
    assert data["semi_major_axis"] > 0
