"""Phase 2: Waiting List — API Tests"""

import pytest


class TestWaitlistPost:
    async def test_post_returns_201(self, client):
        response = await client.post(
            "/api/waitlist", json={"email": "test@example.com"}
        )
        assert response.status_code == 201

    async def test_post_returns_success_true(self, client):
        response = await client.post(
            "/api/waitlist", json={"email": "success@example.com"}
        )
        assert response.json()["success"] is True

    async def test_post_returns_position(self, client):
        response = await client.post(
            "/api/waitlist", json={"email": "position@example.com"}
        )
        data = response.json()
        assert "position" in data
        assert isinstance(data["position"], int)
        assert data["position"] >= 1

    async def test_post_duplicate_returns_409(self, client):
        await client.post("/api/waitlist", json={"email": "dupe@example.com"})
        response = await client.post(
            "/api/waitlist", json={"email": "dupe@example.com"}
        )
        assert response.status_code == 409

    async def test_post_invalid_email_returns_422(self, client):
        response = await client.post(
            "/api/waitlist", json={"email": "not-an-email"}
        )
        assert response.status_code == 422

    async def test_post_with_name_and_interest(self, client):
        response = await client.post(
            "/api/waitlist",
            json={"email": "full@example.com", "name": "Alice", "interest": "Water Risk"},
        )
        assert response.status_code == 201


class TestWaitlistCount:
    async def test_count_returns_200(self, client):
        response = await client.get("/api/waitlist/count")
        assert response.status_code == 200

    async def test_count_returns_count_field(self, client):
        response = await client.get("/api/waitlist/count")
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)


class TestWaitlistExport:
    async def test_export_without_key_returns_401(self, client):
        response = await client.get("/api/waitlist/export")
        assert response.status_code == 401

    async def test_export_with_valid_key_returns_200(self, client, monkeypatch):
        monkeypatch.setenv("ADMIN_API_KEY", "test-secret-key")
        response = await client.get(
            "/api/waitlist/export", headers={"X-API-Key": "test-secret-key"}
        )
        assert response.status_code == 200

    async def test_export_returns_list(self, client, monkeypatch):
        monkeypatch.setenv("ADMIN_API_KEY", "test-secret-key")
        response = await client.get(
            "/api/waitlist/export", headers={"X-API-Key": "test-secret-key"}
        )
        assert isinstance(response.json(), list)


class TestRateLimiting:
    async def test_rate_limit_returns_429_after_5_requests(self, client):
        for i in range(5):
            await client.post(
                "/api/waitlist", json={"email": f"rate{i}@example.com"}
            )
        response = await client.post(
            "/api/waitlist", json={"email": "rate6@example.com"}
        )
        assert response.status_code == 429
