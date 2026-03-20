import pytest
from fastapi import HTTPException
from httpx import AsyncClient, ASGITransport

# ── Geocoder mock ──────────────────────────────────────────────────────────────
# Maps lowercase test location strings → geocoding results so tests never hit
# the real Nominatim API and remain deterministic.
_GEO_MAP = {
    "chandler, az":   {"lat": 33.3062, "lng": -111.8413, "state": "Arizona",  "state_abbr": "AZ", "canonical": "Chandler, AZ",   "city": "Chandler",   "county": "Maricopa", "display_name": "Chandler, AZ, USA"},
    "mesa, az":       {"lat": 33.4152, "lng": -111.8315, "state": "Arizona",  "state_abbr": "AZ", "canonical": "Mesa, AZ",       "city": "Mesa",       "county": "Maricopa", "display_name": "Mesa, AZ, USA"},
    "new albany, oh": {"lat": 40.0811, "lng": -82.8060,  "state": "Ohio",     "state_abbr": "OH", "canonical": "New Albany, OH", "city": "New Albany", "county": "Franklin", "display_name": "New Albany, OH, USA"},
    "irving, tx":     {"lat": 32.8140, "lng": -96.9489,  "state": "Texas",    "state_abbr": "TX", "canonical": "Irving, TX",     "city": "Irving",     "county": "Dallas",   "display_name": "Irving, TX, USA"},
    "ashburn, va":    {"lat": 39.0438, "lng": -77.4874,  "state": "Virginia", "state_abbr": "VA", "canonical": "Ashburn, VA",    "city": "Ashburn",    "county": "Loudoun",  "display_name": "Ashburn, VA, USA"},
}


@pytest.fixture(autouse=True)
def mock_geocoder(monkeypatch):
    """Patch geocode_us so tests never make real HTTP calls to Nominatim."""
    async def _fake_geocode(location: str) -> dict:
        key = location.lower().strip()
        if key not in _GEO_MAP:
            raise HTTPException(
                status_code=404,
                detail=f"Location '{location}' not found in the United States.",
            )
        return _GEO_MAP[key]

    monkeypatch.setattr("backend.analyser.geocode_us", _fake_geocode)


@pytest.fixture(autouse=True)
def reset_db_and_rate_limiter():
    """Clear the database and rate limiter state before each test."""
    import sqlite3
    from backend.server import _db_path, _rate_limit

    if _db_path.exists():
        conn = sqlite3.connect(str(_db_path))
        conn.execute("DELETE FROM signups")
        conn.commit()
        conn.close()

    _rate_limit.clear()


@pytest.fixture
async def client():
    """Async test client for the FastAPI app."""
    from backend.server import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
