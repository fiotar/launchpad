"""Phase 3: MVP — Site Risk Analyser Tests"""

import pytest


class TestAnalyseEndpoint:
    async def test_returns_200(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "Phoenix, AZ", "size": "large"}
        )
        assert response.status_code == 200

    async def test_returns_location_and_size(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "Phoenix, AZ", "size": "large"}
        )
        data = response.json()
        assert data["location"] == "Phoenix, AZ"
        assert data["size"] == "large"

    async def test_returns_scores(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "Des Moines, IA", "size": "small"}
        )
        data = response.json()
        assert "scores" in data
        scores = data["scores"]
        assert "water" in scores
        assert "energy" in scores
        assert "community" in scores
        assert all(isinstance(scores[k], int) for k in scores)

    async def test_scores_in_valid_range(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "Columbus, OH", "size": "medium"}
        )
        scores = response.json()["scores"]
        assert all(0 <= scores[k] <= 99 for k in scores)

    async def test_returns_verdict(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "Phoenix, AZ", "size": "large"}
        )
        data = response.json()
        assert "verdict" in data
        assert data["verdict"] in ["SAFE TO BUILD", "PROCEED WITH CAUTION", "HIGH RISK"]

    async def test_high_risk_site_returns_high_risk_verdict(self, client):
        # Phoenix large = severe water + size modifier pushes it to HIGH RISK
        response = await client.post(
            "/api/analyse", json={"location": "Phoenix, AZ", "size": "large"}
        )
        assert response.json()["verdict"] == "HIGH RISK"

    async def test_safe_site_returns_safe_verdict(self, client):
        # Des Moines small = best scores, no modifier → SAFE
        response = await client.post(
            "/api/analyse", json={"location": "Des Moines, IA", "size": "small"}
        )
        assert response.json()["verdict"] == "SAFE TO BUILD"

    async def test_returns_alternatives_for_high_risk(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "Phoenix, AZ", "size": "large"}
        )
        data = response.json()
        assert "alternatives" in data
        assert len(data["alternatives"]) >= 2

    async def test_alternatives_have_required_fields(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "Phoenix, AZ", "size": "large"}
        )
        alt = response.json()["alternatives"][0]
        assert "location" in alt
        assert "scores" in alt
        assert "verdict" in alt
        assert "reason" in alt

    async def test_safe_site_has_empty_alternatives(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "Des Moines, IA", "size": "small"}
        )
        assert response.json()["alternatives"] == []

    async def test_size_modifier_increases_scores(self, client):
        small = await client.post(
            "/api/analyse", json={"location": "Dallas, TX", "size": "small"}
        )
        large = await client.post(
            "/api/analyse", json={"location": "Dallas, TX", "size": "large"}
        )
        small_scores = small.json()["scores"]
        large_scores = large.json()["scores"]
        assert large_scores["water"] > small_scores["water"]
        assert large_scores["energy"] > small_scores["energy"]

    async def test_unknown_location_returns_404(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "Atlantis, XX", "size": "small"}
        )
        assert response.status_code == 404

    async def test_invalid_size_returns_422(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "Phoenix, AZ", "size": "giant"}
        )
        assert response.status_code == 422

    async def test_returns_flags_list(self, client):
        response = await client.post(
            "/api/analyse", json={"location": "Phoenix, AZ", "size": "large"}
        )
        data = response.json()
        assert "flags" in data
        assert isinstance(data["flags"], list)
        assert len(data["flags"]) > 0
