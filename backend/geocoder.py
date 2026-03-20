"""
Geocoding via OpenStreetMap Nominatim — free, no API key required.
Usage policy: max 1 req/sec, User-Agent header required.
"""

import httpx
from fastapi import HTTPException

_URL = "https://nominatim.openstreetmap.org/search"
_HEADERS = {"User-Agent": "Terrascope/1.0 (terrascope.io)"}

STATE_ABBR: dict[str, str] = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
    "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
    "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
    "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
    "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
    "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
}


async def search_locations(query: str, limit: int = 5) -> list[dict]:
    """
    Return autocomplete suggestions for a partial US location string.
    Used by the /api/location-search endpoint. Fails silently on network errors.
    """
    if not query or len(query.strip()) < 2:
        return []
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                _URL,
                params={
                    "q": query,
                    "format": "json",
                    "countrycodes": "us",
                    "limit": limit,
                    "addressdetails": 1,
                },
                headers=_HEADERS,
                timeout=5.0,
            )
        except (httpx.TimeoutException, httpx.RequestError):
            return []
    if resp.status_code != 200:
        return []

    results = []
    seen = set()
    for hit in resp.json():
        addr = hit.get("address", {})
        state = addr.get("state", "")
        city = (
            addr.get("city") or addr.get("town") or addr.get("village")
            or addr.get("suburb") or addr.get("hamlet")
            or addr.get("county", "").replace(" County", "").replace(" Parish", "")
        )
        state_abbr = STATE_ABBR.get(state, state[:2].upper() if len(state) >= 2 else "")
        canonical = f"{city}, {state_abbr}" if city and state_abbr else hit["display_name"].split(",")[0]
        # Deduplicate identical canonical names
        if canonical in seen:
            continue
        seen.add(canonical)
        results.append({"canonical": canonical, "display": hit["display_name"]})
    return results


async def geocode_us(location: str) -> dict:
    """
    Convert any US location string (city, zip code, suburb, address, landmark)
    to lat/lng and address components.

    Returns: {lat, lng, canonical, city, state, state_abbr, county, display_name}
    Raises HTTPException(404) if not found in the United States.
    Raises HTTPException(503) if Nominatim is unreachable.
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                _URL,
                params={
                    "q": location,
                    "format": "json",
                    "countrycodes": "us",
                    "limit": 1,
                    "addressdetails": 1,
                },
                headers=_HEADERS,
                timeout=10.0,
            )
        except httpx.TimeoutException:
            raise HTTPException(status_code=503, detail="Geocoding service timed out. Please try again.")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Geocoding service unavailable. Please try again.")

    if resp.status_code != 200:
        raise HTTPException(status_code=503, detail="Geocoding service returned an error.")

    results = resp.json()
    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"Location '{location}' not found in the United States. "
                   "Try a city name, zip code, or 'City, State' format.",
        )

    hit = results[0]
    addr = hit.get("address", {})

    state = addr.get("state", "")
    city = (
        addr.get("city")
        or addr.get("town")
        or addr.get("village")
        or addr.get("suburb")
        or addr.get("hamlet")
        or addr.get("neighbourhood")
        or addr.get("county", "").replace(" County", "").replace(" Parish", "")
    )
    county = addr.get("county", "").replace(" County", "").replace(" Parish", "")
    state_abbr = STATE_ABBR.get(state, state[:2].upper() if len(state) >= 2 else "US")

    canonical = f"{city}, {state_abbr}" if city and state_abbr else (city or location)

    return {
        "lat": float(hit["lat"]),
        "lng": float(hit["lon"]),
        "display_name": hit["display_name"],
        "canonical": canonical,
        "city": city,
        "state": state,
        "state_abbr": state_abbr,
        "county": county,
    }
