"""Phase 2: Waiting List — API Tests"""

import pytest


class TestWaitlistPost:
    async def test_post_returns_201(self, client):
        response = await client.post(
            "/api/waitlist", json={"email": "test@example.com"}
        )
        assert response.status_code == 201
