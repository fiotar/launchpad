# Phase 3: MVP — Site Risk Analyser

A tool that lets data centre developers enter a US location and data centre size to instantly get a risk score across water, energy, and community dimensions — with alternative site suggestions when risks are too high.

## What the user sees

1. **Analyser form** — A section on the page (or new route) with two inputs: a location text field (US city or state) and a size dropdown (Small / Medium / Large). A "Analyse Site" button submits it.
2. **Results card** — Shows the analysed location, size, and three risk scores (Water & Cooling, Energy Grid, Community & Political) each with a colour-coded label (LOW / MEDIUM / HIGH) and a numeric score out of 100.
3. **Overall verdict** — A banner: SAFE TO BUILD (all LOW/MEDIUM), PROCEED WITH CAUTION (one HIGH), or HIGH RISK (two or more HIGH).
4. **Alternative suggestions** — If the overall verdict is PROCEED WITH CAUTION or HIGH RISK, show 2–3 alternative US cities with lower risk profiles and a one-line reason why they score better.

## Frontend

- New component: `frontend/components/SiteAnalyser.jsx`
- Mounted as a new section below the features section in `App.jsx`, with `id="analyser"`
- Add "Analyser" to the nav links
- Key UI elements:
  - Location text input + size dropdown + submit button
  - Results card with three risk bars (reuse the visual style from the Remotion hero composition)
  - Verdict banner (green / amber / red background)
  - Alternatives list (2–3 cards, each showing city + scores + reason)
  - Loading state while fetching
  - "Analyse another site" button to reset

## Backend

**New endpoint**: `POST /api/analyse`

Request body:
```json
{ "location": "Phoenix, AZ", "size": "large" }
```

Response:
```json
{
  "location": "Phoenix, AZ",
  "size": "large",
  "scores": {
    "water": 82,
    "energy": 44,
    "community": 51
  },
  "verdict": "HIGH RISK",
  "flags": ["Severe water stress — Colorado River constraints affect cooling capacity"],
  "alternatives": [
    {
      "location": "Des Moines, IA",
      "scores": { "water": 28, "energy": 31, "community": 24 },
      "verdict": "SAFE TO BUILD",
      "reason": "Abundant water supply and unconstrained grid capacity"
    }
  ]
}
```

**Logic** (mock dataset in `backend/analyser.py`):
- Pre-built dict of ~15 US cities with base risk scores per dimension
- Size modifier: Small (10MW) = scores as-is; Medium (50MW) = water +8, energy +8; Large (100MW+) = water +18, energy +18
- Scores capped at 99
- Verdict: all scores <60 = SAFE, one score ≥60 = CAUTION, two+ scores ≥60 = HIGH RISK
- Alternatives: return 2 cities from the dataset with the lowest average scores (excluding the queried city)
- If location not in dataset, return a "location not found" 404 with helpful message

**New Pydantic models** in `backend/models.py`:
- `AnalyseRequest`: location (str), size (enum: small/medium/large)
- `SiteScore`: water (int), energy (int), community (int)
- `AlternativeSite`: location, scores, verdict, reason
- `AnalyseResponse`: location, size, scores, verdict, flags (list[str]), alternatives (list[AlternativeSite])

## What we're NOT building

- No real data API calls (no satellite data, no grid APIs, no census lookups)
- No map rendering or geographic visualisation
- No user accounts or saved searches
- No export or PDF report

## Demo script

1. Open the Analyser section and type **"Phoenix, AZ"**, select **Large (100MW+)**, click Analyse
2. Show the HIGH RISK result — water score 82, red verdict banner, flag about Colorado River constraints
3. Point to the alternatives list — Des Moines and Columbus score SAFE TO BUILD
4. Reset, type **"Des Moines, IA"**, select **Medium (50MW)** — show the green SAFE TO BUILD result
5. Punch line: *"This is what used to take 3 months of consulting — Terrascope does it in 3 seconds."*

## US cities in mock dataset

| City | Water (base) | Energy (base) | Community (base) | Notes |
|---|---|---|---|---|
| Phoenix, AZ | 78 | 42 | 48 | Severe water stress |
| Ashburn, VA | 35 | 65 | 71 | Grid & community pressure |
| Dallas, TX | 52 | 38 | 44 | Moderate water stress |
| Atlanta, GA | 38 | 41 | 39 | Balanced, solid choice |
| Chicago, IL | 29 | 62 | 55 | Grid congestion |
| Seattle, WA | 22 | 48 | 58 | Good water, some opposition |
| Salt Lake City, UT | 68 | 35 | 32 | Water stress growing |
| Reno, NV | 55 | 33 | 28 | Moderate water risk |
| Columbus, OH | 24 | 28 | 31 | Strong all-round |
| Des Moines, IA | 26 | 29 | 22 | Best overall score |
| San Jose, CA | 61 | 72 | 74 | Expensive and contested |
| Portland, OR | 19 | 44 | 51 | Excellent water |
| Houston, TX | 48 | 36 | 42 | Hurricane risk offsets gains |
| Kansas City, MO | 31 | 27 | 26 | Hidden gem |
| Detroit, MI | 21 | 33 | 38 | Underrated, strong water |
