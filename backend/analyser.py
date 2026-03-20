"""
Terrascope Site Risk Analyser — mock dataset and scoring logic.
"""

# Base risk scores per US city (water, energy, community) — all out of 99.
# Lower = safer. Based on real regional constraints.
DATASET: dict[str, dict] = {
    "Phoenix, AZ": {
        "water": 78, "energy": 42, "community": 48,
        "flags": {
            "water": "Severe water stress — Colorado River allocation constraints limit cooling capacity",
            "community": None,
            "energy": None,
        },
    },
    "Ashburn, VA": {
        "water": 35, "energy": 65, "community": 71,
        "flags": {
            "energy": "Grid interconnection queue in Northern Virginia is among the longest in the US",
            "community": "High local opposition — data centre moratorium proposals active in Loudoun County",
            "water": None,
        },
    },
    "Dallas, TX": {
        "water": 52, "energy": 38, "community": 44,
        "flags": {
            "water": "Moderate water stress — drought conditions affect North Texas reservoirs",
            "community": None,
            "energy": None,
        },
    },
    "Atlanta, GA": {
        "water": 38, "energy": 41, "community": 39,
        "flags": {"water": None, "energy": None, "community": None},
    },
    "Chicago, IL": {
        "water": 29, "energy": 62, "community": 55,
        "flags": {
            "energy": "Grid congestion in PJM territory — interconnection delays common",
            "community": None,
            "water": None,
        },
    },
    "Seattle, WA": {
        "water": 22, "energy": 48, "community": 58,
        "flags": {
            "community": "Growing local opposition to data centre water usage",
            "water": None,
            "energy": None,
        },
    },
    "Salt Lake City, UT": {
        "water": 68, "energy": 35, "community": 32,
        "flags": {
            "water": "Water stress increasing — Great Salt Lake watershed under pressure",
            "community": None,
            "energy": None,
        },
    },
    "Reno, NV": {
        "water": 55, "energy": 33, "community": 28,
        "flags": {
            "water": "Moderate water risk — high-desert location, limited surface water",
            "community": None,
            "energy": None,
        },
    },
    "Columbus, OH": {
        "water": 24, "energy": 28, "community": 31,
        "flags": {"water": None, "energy": None, "community": None},
    },
    "Des Moines, IA": {
        "water": 26, "energy": 29, "community": 22,
        "flags": {"water": None, "energy": None, "community": None},
    },
    "San Jose, CA": {
        "water": 61, "energy": 72, "community": 74,
        "flags": {
            "water": "California drought conditions — water allocation restrictions in effect",
            "energy": "PG&E grid capacity severely constrained — multi-year interconnection queues",
            "community": "Strong local opposition — multiple permit challenges in Santa Clara County",
        },
    },
    "Portland, OR": {
        "water": 19, "energy": 44, "community": 51,
        "flags": {
            "community": "Community opposition growing — local ordinances under review",
            "water": None,
            "energy": None,
        },
    },
    "Houston, TX": {
        "water": 48, "energy": 36, "community": 42,
        "flags": {
            "water": "Hurricane-season flooding risk can disrupt water supply reliability",
            "community": None,
            "energy": None,
        },
    },
    "Kansas City, MO": {
        "water": 31, "energy": 27, "community": 26,
        "flags": {"water": None, "energy": None, "community": None},
    },
    "Detroit, MI": {
        "water": 21, "energy": 33, "community": 38,
        "flags": {"water": None, "energy": None, "community": None},
    },
}

# Size modifiers: added to water and energy scores (larger = more demand)
SIZE_MODIFIERS = {
    "small": {"water": 0, "energy": 0},
    "medium": {"water": 8, "energy": 8},
    "large": {"water": 18, "energy": 18},
}

# Reasons why an alternative is better (used when suggesting replacements)
ALTERNATIVE_REASONS = {
    "Columbus, OH": "Abundant freshwater access and unconstrained grid capacity in PJM territory",
    "Des Moines, IA": "Excellent water supply, strong grid capacity, and minimal community opposition",
    "Kansas City, MO": "Low water stress, affordable grid access, and business-friendly regulatory environment",
    "Detroit, MI": "Great Lakes water access and underutilised grid infrastructure",
    "Atlanta, GA": "Balanced risk profile with strong infrastructure and developer-friendly permitting",
    "Portland, OR": "Exceptional water availability from Columbia River watershed",
    "Reno, NV": "Strong grid access and renewable energy availability offset moderate water risk",
    "Houston, TX": "Well-developed power infrastructure and favourable permitting environment",
}


def _get_verdict(scores: dict[str, int]) -> str:
    high_count = sum(1 for v in scores.values() if v >= 60)
    if high_count >= 2:
        return "HIGH RISK"
    if high_count == 1:
        return "PROCEED WITH CAUTION"
    return "SAFE TO BUILD"


def _get_flags(city_data: dict, scores: dict[str, int]) -> list[str]:
    flags = []
    for dim in ("water", "energy", "community"):
        if scores[dim] >= 60 and city_data["flags"].get(dim):
            flags.append(city_data["flags"][dim])
    return flags


def analyse_site(location: str, size: str) -> dict:
    """
    Return risk analysis for a given US location and data centre size.
    Raises KeyError if the location is not in the dataset.
    """
    # Case-insensitive lookup
    key = next(
        (k for k in DATASET if k.lower() == location.lower()),
        None,
    )
    if key is None:
        raise KeyError(f"Location '{location}' not found in dataset")

    city_data = DATASET[key]
    modifier = SIZE_MODIFIERS[size]

    scores = {
        "water": min(99, city_data["water"] + modifier["water"]),
        "energy": min(99, city_data["energy"] + modifier["energy"]),
        "community": city_data["community"],
    }

    verdict = _get_verdict(scores)
    flags = _get_flags(city_data, scores)

    # Build alternatives for non-safe verdicts
    alternatives = []
    if verdict != "SAFE TO BUILD":
        # Score all cities (excluding the queried one) with the same size modifier
        candidates = []
        for candidate_key, candidate_data in DATASET.items():
            if candidate_key.lower() == key.lower():
                continue
            c_scores = {
                "water": min(99, candidate_data["water"] + modifier["water"]),
                "energy": min(99, candidate_data["energy"] + modifier["energy"]),
                "community": candidate_data["community"],
            }
            c_verdict = _get_verdict(c_scores)
            if c_verdict == "SAFE TO BUILD":
                avg = sum(c_scores.values()) / 3
                candidates.append((avg, candidate_key, c_scores, c_verdict))

        candidates.sort(key=lambda x: x[0])
        for avg, c_key, c_scores, c_verdict in candidates[:3]:
            alternatives.append({
                "location": c_key,
                "scores": c_scores,
                "verdict": c_verdict,
                "reason": ALTERNATIVE_REASONS.get(
                    c_key, "Lower overall risk profile across all three dimensions"
                ),
            })

    return {
        "location": key,
        "size": size,
        "scores": scores,
        "verdict": verdict,
        "flags": flags,
        "alternatives": alternatives,
    }
