"""Phase 3: MVP — Site Risk Analyser Tests"""

import pytest


@pytest.fixture
async def token(client):
    """Log in and return a valid auth token."""
    response = await client.post(
        "/api/auth/login",
        json={"email": "demo@terrascope.com", "password": "Terrascope2024"},
    )
    return response.json()["token"]


@pytest.fixture
def auth(token):
    return {"Authorization": f"Bearer {token}"}


class TestAuth:
    async def test_login_returns_200(self, client):
        response = await client.post(
            "/api/auth/login",
            json={"email": "demo@terrascope.com", "password": "Terrascope2024"},
        )
        assert response.status_code == 200

    async def test_login_returns_token(self, client):
        response = await client.post(
            "/api/auth/login",
            json={"email": "demo@terrascope.com", "password": "Terrascope2024"},
        )
        data = response.json()
        assert "token" in data
        assert len(data["token"]) > 10

    async def test_wrong_password_returns_401(self, client):
        response = await client.post(
            "/api/auth/login",
            json={"email": "demo@terrascope.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    async def test_analyse_without_token_returns_401(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "New Albany, OH", "size": "small"}
        )
        assert response.status_code == 401


class TestRiskMap:
    async def test_risk_map_returns_200(self, client):
        response = await client.get("/api/risk-map")
        assert response.status_code == 200

    async def test_risk_map_returns_list(self, client):
        response = await client.get("/api/risk-map")
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 10

    async def test_risk_map_areas_have_coordinates(self, client):
        data = (await client.get("/api/risk-map")).json()
        area = data[0]
        assert "lat" in area
        assert "lng" in area
        assert "verdict" in area
        assert "metro" in area


class TestAnalyseEndpoint:
    async def test_returns_200(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "Chandler, AZ", "size": "large"}, headers=auth
        )
        assert response.status_code == 200

    async def test_returns_location_and_size(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "Chandler, AZ", "size": "large"}, headers=auth
        )
        data = response.json()
        assert data["location"] == "Chandler, AZ"
        assert data["size"] == "large"

    async def test_returns_scores(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "New Albany, OH", "size": "small"}, headers=auth
        )
        scores = response.json()["scores"]
        assert all(k in scores for k in ("water", "energy", "community"))
        assert all(isinstance(scores[k], int) for k in scores)

    async def test_scores_in_valid_range(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "New Albany, OH", "size": "medium"}, headers=auth
        )
        scores = response.json()["scores"]
        assert all(0 <= scores[k] <= 99 for k in scores)

    async def test_returns_verdict(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "Chandler, AZ", "size": "large"}, headers=auth
        )
        assert response.json()["verdict"] in ["SAFE TO BUILD", "PROCEED WITH CAUTION", "HIGH RISK"]

    async def test_high_risk_site_returns_high_risk_verdict(self, client, auth):
        # Mesa, AZ large: water 82+18=99, energy 45+18=63 → two HIGH dims → HIGH RISK
        response = await client.post(
            "/api/analyse", json={"location": "Mesa, AZ", "size": "large"}, headers=auth
        )
        assert response.json()["verdict"] == "HIGH RISK"

    async def test_safe_site_returns_safe_verdict(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "New Albany, OH", "size": "small"}, headers=auth
        )
        assert response.json()["verdict"] == "SAFE TO BUILD"

    async def test_returns_alternatives_for_high_risk(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "Mesa, AZ", "size": "large"}, headers=auth
        )
        alts = response.json()["alternatives"]
        assert len(alts) >= 2

    async def test_alternatives_have_required_fields(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "Mesa, AZ", "size": "large"}, headers=auth
        )
        alt = response.json()["alternatives"][0]
        assert all(k in alt for k in ("location", "scores", "verdict", "reason"))

    async def test_safe_site_has_empty_alternatives(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "New Albany, OH", "size": "small"}, headers=auth
        )
        assert response.json()["alternatives"] == []

    async def test_size_modifier_increases_scores(self, client, auth):
        small = (await client.post(
            "/api/analyse", json={"location": "Irving, TX", "size": "small"}, headers=auth
        )).json()["scores"]
        large = (await client.post(
            "/api/analyse", json={"location": "Irving, TX", "size": "large"}, headers=auth
        )).json()["scores"]
        assert large["water"] > small["water"]
        assert large["energy"] > small["energy"]

    async def test_unknown_location_returns_404(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "Atlantis, XX", "size": "small"}, headers=auth
        )
        assert response.status_code == 404

    async def test_invalid_size_returns_422(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "Chandler, AZ", "size": "giant"}, headers=auth
        )
        assert response.status_code == 422

    async def test_returns_flags_list(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "Ashburn, VA", "size": "large"}, headers=auth
        )
        data = response.json()
        assert isinstance(data["flags"], list)
        assert len(data["flags"]) > 0

    async def test_high_risk_returns_reasoning(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "Mesa, AZ", "size": "large"}, headers=auth
        )
        reasoning = response.json()["reasoning"]
        assert isinstance(reasoning, list)
        assert len(reasoning) > 0
        item = reasoning[0]
        assert all(k in item for k in ("dimension", "label", "risk_level", "detail", "mitigation"))
        assert item["risk_level"] in ("HIGH", "MEDIUM")

    async def test_safe_site_has_low_risk_reasoning(self, client, auth):
        response = await client.post(
            "/api/analyse", json={"location": "New Albany, OH", "size": "small"}, headers=auth
        )
        reasoning = response.json()["reasoning"]
        assert len(reasoning) == 3
        assert all(r["risk_level"] == "LOW" for r in reasoning)
