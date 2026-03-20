import pytest
from httpx import AsyncClient, ASGITransport


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
