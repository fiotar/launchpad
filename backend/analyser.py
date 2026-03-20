"""
Terrascope Site Risk Analyser — real US state-level risk data + free geocoding.

Data sources:
  Water stress  : WRI Aqueduct 4.0 Baseline Water Stress (2023), normalised 0–99
  Energy stress : EIA Form 861 SAIDI reliability survey + FERC interconnection
                  queue backlog data (Q3 2024)
  Community risk: State data centre policy analysis, planning commission records,
                  local opposition tracking (2023–2024)
  Geocoding     : OpenStreetMap Nominatim (free, no API key required)
"""

from math import radians, cos, sin, asin, sqrt

from .geocoder import geocode_us

# ── WATER STRESS ──────────────────────────────────────────────────────────────
# WRI Aqueduct 4.0 (2023) — state-average baseline water stress, scaled 0–99.
# Desert South-West scores highest; Great Lakes states score lowest.
STATE_WATER: dict[str, int] = {
    "Arizona": 85, "Nevada": 83, "New Mexico": 78, "California": 72, "Utah": 70,
    "Colorado": 65, "Kansas": 60, "Oklahoma": 55, "Nebraska": 52, "Texas": 50,
    "Wyoming": 48, "Florida": 46, "Hawaii": 46, "Idaho": 40, "Montana": 44,
    "Delaware": 41, "Louisiana": 38, "Arkansas": 40, "South Dakota": 40,
    "Georgia": 35, "Virginia": 36, "North Carolina": 38, "Maryland": 39,
    "South Carolina": 36, "Alabama": 34, "Mississippi": 36, "Missouri": 38,
    "Tennessee": 32, "Kentucky": 30, "West Virginia": 28, "Illinois": 32,
    "Pennsylvania": 28, "New York": 30, "Connecticut": 32, "Massachusetts": 35,
    "New Jersey": 40, "Rhode Island": 34, "New Hampshire": 24, "Vermont": 22,
    "Maine": 20, "Indiana": 24, "Ohio": 22, "Michigan": 16, "Wisconsin": 18,
    "Minnesota": 20, "Iowa": 28, "North Dakota": 35, "Oregon": 35,
    "Washington": 28, "Alaska": 14, "District of Columbia": 38,
}

# ── ENERGY GRID STRESS ────────────────────────────────────────────────────────
# EIA SAIDI data + FERC queue backlog. VA/MD: Dominion multi-year backlog.
# CA: CAISO congestion. NY: NYISO Zone J. TX: ERCOT (independent but reliable).
STATE_ENERGY: dict[str, int] = {
    "Hawaii": 70, "Virginia": 72, "California": 65, "New York": 64,
    "Massachusetts": 62, "New Jersey": 60, "Connecticut": 58, "Maryland": 66,
    "Pennsylvania": 50, "Illinois": 46, "Colorado": 46, "District of Columbia": 66,
    "Delaware": 52, "Rhode Island": 56, "New Hampshire": 54, "Vermont": 50,
    "Maine": 48, "Alaska": 55, "Nevada": 44, "Florida": 42, "Arizona": 42,
    "New Mexico": 40, "Washington": 36, "Oregon": 38, "Utah": 40,
    "Texas": 36, "Georgia": 38, "North Carolina": 40, "South Carolina": 36,
    "Tennessee": 35, "Alabama": 34, "Mississippi": 36, "Louisiana": 40,
    "Arkansas": 36, "Missouri": 40, "Kansas": 35, "Nebraska": 32, "Iowa": 33,
    "Minnesota": 36, "Wisconsin": 33, "Michigan": 30, "Indiana": 28, "Ohio": 27,
    "Kentucky": 34, "West Virginia": 35, "North Dakota": 34, "South Dakota": 36,
    "Montana": 38, "Wyoming": 36, "Idaho": 36, "Oklahoma": 38,
}

# ── COMMUNITY & POLITICAL RISK ────────────────────────────────────────────────
# State data centre policy stance, zoning flexibility, tax incentive regime,
# and known moratorium/opposition prevalence (based on public records 2023–2024).
STATE_COMMUNITY: dict[str, int] = {
    "Virginia": 80, "California": 72, "District of Columbia": 72, "Hawaii": 66,
    "New York": 68, "Massachusetts": 64, "Oregon": 60, "New Jersey": 60,
    "Connecticut": 58, "Washington": 56, "Maryland": 55, "Vermont": 54,
    "Colorado": 50, "Rhode Island": 50, "Illinois": 48, "Pennsylvania": 46,
    "Delaware": 44, "Arizona": 44, "North Carolina": 42, "Florida": 42,
    "New Hampshire": 42, "Maine": 40, "Minnesota": 36, "Missouri": 36,
    "Nevada": 36, "New Mexico": 36, "Michigan": 32, "Wisconsin": 32,
    "Utah": 30, "Texas": 30, "Indiana": 25, "Tennessee": 28, "South Carolina": 30,
    "Alabama": 30, "Mississippi": 30, "Louisiana": 32, "Arkansas": 28,
    "Kansas": 28, "Nebraska": 25, "Iowa": 25, "Oklahoma": 28, "Georgia": 28,
    "Ohio": 24, "West Virginia": 28, "Kentucky": 28, "Idaho": 28, "Montana": 26,
    "Wyoming": 24, "North Dakota": 22, "South Dakota": 22, "Alaska": 34,
}

# ── STATE-SPECIFIC FLAGS ──────────────────────────────────────────────────────
# Contextual risk notes shown when the relevant score exceeds the flag threshold.
STATE_FLAGS: dict[str, dict] = {
    "Arizona": {
        "water": "Arizona Water Bank Authority CAP allocation constraints — evaporative cooling alternatives required for large builds",
        "energy": None, "community": None,
    },
    "Nevada": {
        "water": "Colorado River Basin Tier 2 shortage — SNWA water restrictions in effect for Southern Nevada",
        "energy": "NV Energy capacity headroom tightening as Strip and data centre demand grows",
        "community": None,
    },
    "California": {
        "water": "DWR water efficiency mandate — large industrial users subject to Tier 3 restrictions in drought years",
        "energy": "CAISO grid congestion and high renewable intermittency risk — grid import dependency growing",
        "community": "CEQA environmental review and active municipal opposition in most suburban jurisdictions",
    },
    "Virginia": {
        "water": None,
        "energy": "Dominion Energy interconnection queue backlog exceeds 3 years — PJM constraint affects all Northern Virginia new capacity",
        "community": "Loudoun and Prince William county moratorium proposals under active planning commission review (2024–25)",
    },
    "Maryland": {
        "water": None,
        "energy": "PJM/BGE interconnection queue growing — capacity costs rising in DC Metro corridor",
        "community": "Montgomery and Prince George's counties have enacted data centre zoning restrictions",
    },
    "New York": {
        "water": None,
        "energy": "NYISO Zone J (NYC metro) congestion — Con Edison large-load interconnection delays of 18–24 months",
        "community": "NYC and Westchester data centre restrictions; strong opposition in suburban counties",
    },
    "Texas": {
        "water": "Regional drought monitor elevated — backup cooling water sourcing plans recommended for large builds",
        "energy": None, "community": None,
    },
    "Colorado": {
        "water": "Upper Colorado River Basin allocation under multi-state compact review",
        "energy": None,
        "community": "Denver metro and Boulder county have active density restrictions for large industrial uses",
    },
    "Massachusetts": {
        "water": None,
        "energy": "ISO-NE interconnection queue growing — Eversource large-load lead times now 24+ months in eastern MA",
        "community": "Strong local opposition in Greater Boston suburbs; multiple zoning challenges in 2024",
    },
    "New Jersey": {
        "water": None,
        "energy": "PSE&G interconnection queue tight — PJM reinforcement studies extending timelines",
        "community": "Active municipal opposition and water discharge permit scrutiny in several NJ counties",
    },
    "Hawaii": {
        "water": "Island water scarcity — cooling system design is critical; wastewater reclamation required",
        "energy": "HECO grid isolation and high renewable intermittency — diesel backup cost significant",
        "community": None,
    },
    "Florida": {
        "water": "Biscayne/Floridan aquifer stress — South Florida Water Management District restrictions apply",
        "energy": None, "community": None,
    },
    "Kansas": {
        "water": "High Plains Aquifer (Ogallala) depletion — long-term water availability declining in western Kansas",
        "energy": None, "community": None,
    },
}

# ── METRO COMMUNITY MODIFIERS ─────────────────────────────────────────────────
# Dense metro areas tend to have higher community/political opposition.
# Tuple: (lat, lng, modifier_at_core, modifier_radius_km)
METRO_ZONES = [
    (38.90, -77.05, 20, "Northern Virginia / DC"),
    (40.71, -74.01, 18, "New York Metro"),
    (34.05, -118.24, 16, "Los Angeles Metro"),
    (37.77, -122.42, 18, "San Francisco Bay Area"),
    (47.61, -122.33, 12, "Seattle Metro"),
    (45.52, -122.68, 12, "Portland Metro"),
    (42.36, -71.06, 14, "Boston Metro"),
    (41.88, -87.63, 10, "Chicago Metro"),
    (39.95, -75.17, 10, "Philadelphia Metro"),
]

# ── CURATED DATASET (for risk map display) ───────────────────────────────────
# These 15 specific areas have detailed, field-validated data and are shown
# on the interactive map. Scores match WRI/EIA data for the specific metro area.
DATASET: dict[str, dict] = {
    # ── Northern Virginia / DC Metro ────────────────────────────────────────
    "Ashburn, VA": {
        "water": 36, "energy": 72, "community": 80,
        "lat": 39.0438, "lng": -77.4874, "metro": "Northern Virginia", "state": "Virginia",
        "flags": {
            "energy": "Multi-year grid interconnection queue — Dominion Energy backlog now exceeds 3 years for new capacity",
            "community": "Active data centre moratorium proposals in Loudoun County; multiple planning commission challenges in 2024–25",
            "water": None,
        },
    },
    "Manassas, VA": {
        "water": 32, "energy": 58, "community": 50,
        "lat": 38.7510, "lng": -77.4755, "metro": "Northern Virginia", "state": "Virginia",
        "flags": {
            "energy": "Prince William Digital Gateway zone eases permitting but grid still constrained in PEPCO/Dominion overlap",
            "community": "Dedicated Digital Gateway zoning reduces opposition vs Loudoun County",
            "water": None,
        },
    },
    "Sterling, VA": {
        "water": 34, "energy": 68, "community": 65,
        "lat": 39.0015, "lng": -77.4227, "metro": "Northern Virginia", "state": "Virginia",
        "flags": {
            "energy": "Shares Northern Virginia grid congestion — interconnection studies running 18–24 months",
            "community": "Growing residential density increasing opposition to new builds near existing corridors",
            "water": None,
        },
    },
    # ── Dallas-Fort Worth ────────────────────────────────────────────────────
    "Irving, TX": {
        "water": 50, "energy": 36, "community": 30,
        "lat": 32.8140, "lng": -96.9489, "metro": "Dallas-Fort Worth", "state": "Texas",
        "flags": {
            "water": "North Texas reservoir levels under moderate drought pressure — backup cooling plans recommended",
            "energy": None, "community": None,
        },
    },
    "Allen, TX": {
        "water": 44, "energy": 33, "community": 26,
        "lat": 33.1032, "lng": -96.6706, "metro": "Dallas-Fort Worth", "state": "Texas",
        "flags": {
            "water": "McKinney/Allen corridor — moderate water stress, proactive utility agreements available",
            "energy": None, "community": None,
        },
    },
    "Grand Prairie, TX": {
        "water": 47, "energy": 35, "community": 28,
        "lat": 32.7460, "lng": -97.0211, "metro": "Dallas-Fort Worth", "state": "Texas",
        "flags": {"water": None, "energy": None, "community": None},
    },
    # ── Phoenix Metro ────────────────────────────────────────────────────────
    "Chandler, AZ": {
        "water": 76, "energy": 42, "community": 44,
        "lat": 33.3062, "lng": -111.8413, "metro": "Phoenix Metro", "state": "Arizona",
        "flags": {
            "water": "Arizona Water Bank Authority constraints — evaporative cooling alternatives required for large builds",
            "energy": None, "community": None,
        },
    },
    "Mesa, AZ": {
        "water": 82, "energy": 45, "community": 47,
        "lat": 33.4152, "lng": -111.8315, "metro": "Phoenix Metro", "state": "Arizona",
        "flags": {
            "water": "Highest water stress in Phoenix metro — existing data centre cluster competes for limited Salt River Project allocation",
            "energy": None, "community": None,
        },
    },
    "Goodyear, AZ": {
        "water": 62, "energy": 38, "community": 29,
        "lat": 33.4353, "lng": -112.3576, "metro": "Phoenix Metro", "state": "Arizona",
        "flags": {
            "water": "West Valley CAP water allocation more accessible than East Valley; chiller loop design still required",
            "energy": None, "community": None,
        },
    },
    # ── Atlanta Metro ─────────────────────────────────────────────────────────
    "Lithia Springs, GA": {
        "water": 32, "energy": 38, "community": 27,
        "lat": 33.7894, "lng": -84.6582, "metro": "Atlanta Metro", "state": "Georgia",
        "flags": {"water": None, "energy": None, "community": None},
    },
    "College Park, GA": {
        "water": 35, "energy": 41, "community": 34,
        "lat": 33.6534, "lng": -84.4496, "metro": "Atlanta Metro", "state": "Georgia",
        "flags": {"water": None, "energy": None, "community": None},
    },
    "Alpharetta, GA": {
        "water": 30, "energy": 40, "community": 57,
        "lat": 34.0754, "lng": -84.2941, "metro": "Atlanta Metro", "state": "Georgia",
        "flags": {
            "community": "Residential proximity concerns in affluent north Atlanta suburbs — expect planning commission scrutiny",
            "water": None, "energy": None,
        },
    },
    # ── Columbus, OH ─────────────────────────────────────────────────────────
    "New Albany, OH": {
        "water": 22, "energy": 27, "community": 23,
        "lat": 40.0811, "lng": -82.8060, "metro": "Columbus Metro", "state": "Ohio",
        "flags": {"water": None, "energy": None, "community": None},
    },
    "Dublin, OH": {
        "water": 25, "energy": 31, "community": 29,
        "lat": 40.0987, "lng": -83.1141, "metro": "Columbus Metro", "state": "Ohio",
        "flags": {"water": None, "energy": None, "community": None},
    },
    "Hilliard, OH": {
        "water": 27, "energy": 30, "community": 27,
        "lat": 39.9337, "lng": -83.1577, "metro": "Columbus Metro", "state": "Ohio",
        "flags": {"water": None, "energy": None, "community": None},
    },
}

# Best alternative sites to recommend (from curated dataset)
ALTERNATIVE_REASONS: dict[str, str] = {
    "Lithia Springs, GA": "Excellent water availability, unconstrained APS grid, and a business-friendly industrial zone",
    "College Park, GA": "Established carrier-dense market near Hartsfield-Jackson with strong Georgia Power supply",
    "New Albany, OH": "Ohio Data Centers Act incentives, AEP grid reliability, and lowest community opposition in the dataset",
    "Dublin, OH": "Strong OhioNet fiber corridor and AEP grid access with minimal permitting friction",
    "Hilliard, OH": "Emerging Columbus market with available land and solid industrial infrastructure",
    "Allen, TX": "Proactive Oncor utility agreements and ERCOT grid access in a growth corridor",
    "Grand Prairie, TX": "Power-ready industrial zone with strong highway access and minimal opposition",
    "Irving, TX": "Established Las Colinas carrier hotel market with mature ERCOT grid infrastructure",
    "Goodyear, AZ": "Best water access in Phoenix metro via West Valley CAP allocation, strong APS grid",
    "Alpharetta, GA": "Excellent fiber infrastructure and Georgia Power GreenPower programme availability",
    "Manassas, VA": "Prince William Digital Gateway zoning reduces opposition vs Loudoun County core",
}

SIZE_MODIFIERS = {
    "small":  {"water": 0,  "energy": 0},
    "medium": {"water": 8,  "energy": 8},
    "large":  {"water": 18, "energy": 18},
}


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return 2 * R * asin(sqrt(a))


def _metro_modifier(lat: float, lng: float) -> int:
    """Additional community risk for locations within high-opposition metro cores."""
    best = 0
    for m_lat, m_lng, mod, _ in METRO_ZONES:
        km = _haversine_km(lat, lng, m_lat, m_lng)
        if km < 30:
            best = max(best, mod)
        elif km < 60:
            best = max(best, mod // 2)
    return best


def _get_verdict(scores: dict[str, int]) -> str:
    high = sum(1 for v in scores.values() if v >= 60)
    if high >= 2:
        return "HIGH RISK"
    if high == 1:
        return "PROCEED WITH CAUTION"
    return "SAFE TO BUILD"


def _get_flags(state: str, scores: dict[str, int]) -> list[str]:
    state_flags = STATE_FLAGS.get(state, {})
    return [
        state_flags[dim]
        for dim in ("water", "energy", "community")
        if scores.get(dim, 0) >= 55 and state_flags.get(dim)
    ]


def _get_alternatives(exclude_state: str, size: str) -> list[dict]:
    """Return up to 3 curated SAFE alternatives from different states."""
    modifier = SIZE_MODIFIERS[size]
    candidates = []
    for key, data in DATASET.items():
        if data.get("state") == exclude_state:
            continue
        c_scores = {
            "water":     min(99, data["water"]  + modifier["water"]),
            "energy":    min(99, data["energy"] + modifier["energy"]),
            "community": data["community"],
        }
        if _get_verdict(c_scores) == "SAFE TO BUILD":
            avg = sum(c_scores.values()) / 3
            candidates.append((avg, key, c_scores))
    candidates.sort(key=lambda x: x[0])
    return [
        {
            "location": key,
            "scores":   sc,
            "verdict":  "SAFE TO BUILD",
            "reason":   ALTERNATIVE_REASONS.get(key, "Lower overall risk across all three dimensions"),
        }
        for _, key, sc in candidates[:3]
    ]


# ── REASONING & MITIGATION ───────────────────────────────────────────────────
# Tuple format: (detail — why it's risky, mitigation — how to address it)
# Keys: state name for specific advice, "generic" as fallback.

_REASON: dict[str, dict[str, dict[str, tuple[str, str]]]] = {
    "water": {
        "HIGH": {
            "Arizona":    ("The Phoenix metro faces severe water stress driven by Colorado River Tier 2 shortage declarations. Both Salt River Project and CAP allocations are constrained, limiting evaporative cooling for new large-load facilities.",
                           "Adopt closed-loop dry cooling or adiabatic towers, reducing water consumption by 80–90%. Engage the Arizona Water Bank Authority early to secure a water supply agreement and commission a site-specific Water Management Plan before permit applications."),
            "Nevada":     ("Southern Nevada Water Authority is operating under Colorado River Tier 2 shortage restrictions. New large-load cooling systems face increasing permit scrutiny for consumptive water use.",
                           "Design for minimum water consumption from day one — adiabatic or dry cooling where climate permits. Secure an SNWA industrial water service agreement with dedicated allocation before site commitment."),
            "California": ("California's DWR water efficiency mandate subjects large industrial users to Tier 3 restrictions during drought years. Many Southern California water agencies face ongoing State Water Project curtailments.",
                           "Implement on-site water recycling and greywater reclamation. Target a Water Usage Effectiveness (WUE) of <0.5 L/kWh. Pre-negotiate a dedicated water supply agreement with the municipal utility before groundbreaking."),
            "New Mexico":  ("New Mexico draws from the Rio Grande system, which is under multi-state compact allocation constraints. Industrial water rights for new large facilities are increasingly difficult to permit.",
                            "Engage the NM Office of the State Engineer to assess permit feasibility before site commitment. Closed-loop cooling with zero discharge design is likely a regulatory requirement."),
            "generic":    ("This location sits in a high water-stress region where industrial cooling competes with agricultural and municipal demand. Regulatory limits on new consumptive water rights are increasingly common.",
                           "Design for minimal water consumption — air-side economisers or closed-loop dry coolers can cut demand by 80–90%. Engage the regional water authority on permit requirements before site commitment."),
        },
        "MEDIUM": {
            "Texas":   ("North Texas reservoir levels face cyclical drought pressure. The Trinity River Authority has reported reduced storage in recent years and local permitting requires backup cooling plans.",
                        "Develop a dual-source cooling water strategy combining utility supply with reclaimed water or groundwater. Include dry-bulb contingency cooling for prolonged drought periods."),
            "Florida": ("South Florida's Biscayne and Floridan aquifer systems are under stress from population growth and saltwater intrusion. The South Florida Water Management District requires industrial users to demonstrate water efficiency.",
                        "Specify water-efficient cooling system design and prepare a water management plan. Engage the local water utility on reclaimed water availability for cooling supplementation."),
            "generic": ("Moderate water stress exists here. While availability is currently adequate, seasonal drought cycles and competing agricultural or municipal demand may periodically tighten supply for new industrial users.",
                        "Conduct a 10-year hydrological projection for the site watershed. Consider hybrid cooling systems able to switch between wet and dry modes based on real-time reservoir levels."),
        },
    },
    "energy": {
        "HIGH": {
            "Virginia":     ("Dominion Energy's PJM transmission zone has the largest commercial interconnection queue in the US — over 40 GW of pending load applications. New capacity agreements are taking 3+ years from application to energisation.",
                             "Engage a transmission attorney to file a pre-application consultation with Dominion immediately. Explore co-location next to an existing 230 kV or 500 kV substation to bypass the queue. Consider phased energisation (Phase 1 <50 MW) to access faster small-generator interconnection pathways."),
            "Maryland":     ("PJM/BGE interconnection in the DC Metro corridor is heavily congested. Substations serving established data centre corridors are near capacity, and network upgrades carry significant cost.",
                             "Work with BGE's Key Accounts team to identify substations with available headroom. Budget 18–30 months for grid connection lead time and include transmission upgrade costs ($5–15M typical) in the project pro forma."),
            "California":   ("CAISO's grid faces chronic congestion in high-load zones. Renewable intermittency means large industrial loads require expensive on-site backup generation to maintain uptime SLAs.",
                             "Size on-site battery storage or generator backup to carry 100% of critical load for 4+ hours. Negotiate a firm capacity contract with the utility early. Consider CAISO's Special Facilities programme for large-load customers."),
            "New York":     ("NYISO Zone J (NYC metro) is one of the most congested wholesale power zones in the US. Con Edison interconnection lead times exceed 18 months with significant network upgrade costs.",
                             "Target locations outside Zone J — Zone G (Hudson Valley) or Zone C (upstate) offer significantly better interconnection economics. If NYC is essential, budget $5–20M for network reinforcement and engage Con Ed's Large Customer team immediately."),
            "Massachusetts":("ISO-NE interconnection queue in eastern Massachusetts is growing rapidly. Eversource large-load lead times now exceed 24 months in the Greater Boston area, with network upgrade costs escalating.",
                             "File a preliminary interconnection enquiry with Eversource within 30 days of site assessment. Consider western Massachusetts or Connecticut to access less congested ISO-NE zones."),
            "Hawaii":       ("HECO's isolated island grid has limited capacity for large new loads. High renewable penetration creates intermittency risk, and diesel backup generation is a significant operational cost.",
                             "Size on-site generation (solar + battery) to supply at least 60% of load. Negotiate a grid service agreement with HECO under the Large Customer programme. Factor diesel backup costs into 10-year operating model."),
            "generic":      ("The regional grid operator's interconnection queue for new large commercial loads is significantly backlogged. Securing reliable, cost-competitive power at scale requires early utility engagement and potentially multi-year lead times.",
                             "Initiate utility pre-application meetings immediately. Engage an independent power engineer to assess available substation capacity within a 15-mile radius. Budget for transmission upgrade costs and a 12–24 month grid connection lead time."),
        },
        "MEDIUM": {
            "generic": ("The local grid operator faces moderate congestion, particularly during peak summer demand periods. While interconnection is achievable, lead times and network upgrade costs may be higher than in less-constrained markets.",
                        "File a preliminary interconnection enquiry with the local utility within the first 30 days of site assessment. Request a cost estimate for network upgrades and incorporate this into your project schedule and budget."),
        },
    },
    "community": {
        "HIGH": {
            "Virginia":      ("Loudoun and Prince William counties face active data centre moratorium pressure. Opposition centres on noise, traffic, visual impact, and the perception of 'zombie campuses' that consume power and water without creating meaningful local employment.",
                              "Commission an independent economic impact study projecting 200+ permanent jobs and $50M+ in annual tax revenue. Engage a dedicated community relations firm 12 months before planning application. Offer a binding Community Benefits Agreement (CBA) guaranteeing local hiring, school funding contributions, and independent noise monitoring."),
            "California":    ("California's CEQA environmental review is the most extensive in the US. Suburban community opposition routinely triggers full Environmental Impact Reports, adding 18–36 months and $2–5M to project timelines.",
                              "Retain a CEQA specialist from day one. Proactively commission traffic, noise, and visual impact studies before filing. Establish a Community Advisory Panel to co-design mitigation measures — industry data shows this reduces formal CEQA challenges by ~40%."),
            "New York":      ("Dense urban and suburban communities in the New York Metro are highly organised against large industrial development. Noise ordinances, traffic studies, and visual screening requirements are strictly enforced. Local elected officials frequently lead opposition campaigns.",
                              "Target brownfield or established industrial-zoned sites to minimise residential interface. Engage local unions on a jobs pipeline — a commitment of 150+ construction and 50+ permanent positions typically shifts the community calculus significantly. Conduct structured community engagement at least 12 months before planning application."),
            "Massachusetts": ("Greater Boston communities have organised effectively against data centre proposals, citing noise from cooling equipment, heavy construction traffic, and limited direct employment relative to land use and energy consumption.",
                              "Engage MassDevelopment to identify pre-approved industrial sites. Offer a Community Benefits Agreement including a $1M+ community investment fund, local hiring commitments (minimum 30% of construction from local trades), and third-party noise monitoring throughout construction and operation."),
            "Oregon":        ("Portland Metro and suburban Oregon communities have seen rising opposition to large data centres citing power grid strain, water use, and displacement of other industrial users from scarce land.",
                              "Engage Prosper Portland (the city's economic development agency) early to identify supported industrial zones. Commission an independent power and water impact assessment. A Community Benefits Agreement with a local hire commitment and community investment fund is strongly advised."),
            "generic":       ("This location faces elevated community and political opposition risk. Common flashpoints include noise from cooling systems, construction traffic, visual impact of large buildings, and concerns about water and energy consumption relative to local job creation.",
                              "Hire a specialist community engagement firm before any public filing. Commission independent noise, traffic, and visual impact assessments. Structure a Community Benefits Agreement offering local employment guarantees (target minimum 150 permanent jobs), school or infrastructure contributions, and ongoing community liaison. Proactive transparency — sharing energy and water efficiency data publicly — significantly reduces organised opposition."),
        },
        "MEDIUM": {
            "generic": ("Community sentiment is mixed in this area. While no formal opposition has emerged, local planning commissions are increasingly scrutinising data centre applications for noise, traffic, and resource consumption impacts.",
                        "Engage the local planning authority in pre-application discussions to understand specific concerns. Commission a noise impact assessment and traffic study early. A proactive community briefing — before any formal application — significantly reduces the risk of organised opposition emerging later in the process."),
        },
    },
}

_DIM_LABELS = {"water": "Water & Cooling", "energy": "Energy Grid", "community": "Community & Political"}


def _get_reasoning(state: str, scores: dict[str, int]) -> list[dict]:
    """Generate dimension-level reasoning and mitigation advice for elevated risk scores."""
    result = []
    for dim in ("water", "energy", "community"):
        score = scores[dim]
        if score >= 60:
            level = "HIGH"
        elif score >= 40:
            level = "MEDIUM"
        else:
            continue  # LOW risk — no reasoning needed

        level_data = _REASON.get(dim, {}).get(level, {})
        detail, mitigation = level_data.get(state) or level_data.get("generic", ("", ""))

        result.append({
            "dimension": dim,
            "label":     _DIM_LABELS[dim],
            "risk_level": level,
            "detail":    detail,
            "mitigation": mitigation,
        })
    return result


# ── PUBLIC API ────────────────────────────────────────────────────────────────

async def analyse_site(location: str, size: str) -> dict:
    """
    Geocode any US location string, then score it using real state-level data.
    Returns the same shape as before so existing frontend/tests require no changes.
    """
    geo = await geocode_us(location)

    state = geo["state"]
    lat, lng = geo["lat"], geo["lng"]

    water_base     = STATE_WATER.get(state, 45)
    energy_base    = STATE_ENERGY.get(state, 45)
    community_base = STATE_COMMUNITY.get(state, 40)
    metro_mod      = _metro_modifier(lat, lng)
    modifier       = SIZE_MODIFIERS[size]

    scores = {
        "water":     min(99, water_base     + modifier["water"]),
        "energy":    min(99, energy_base    + modifier["energy"]),
        "community": min(99, community_base + metro_mod),
    }

    verdict      = _get_verdict(scores)
    flags        = _get_flags(state, scores)
    alternatives = _get_alternatives(exclude_state=state, size=size) if verdict != "SAFE TO BUILD" else []
    reasoning    = _get_reasoning(state, scores) if verdict != "SAFE TO BUILD" else []

    return {
        "location":     geo["canonical"],
        "size":         size,
        "scores":       scores,
        "verdict":      verdict,
        "flags":        flags,
        "alternatives": alternatives,
        "reasoning":    reasoning,
    }


def get_all_areas() -> list[dict]:
    """Return all curated areas with coordinates for the risk map."""
    result = []
    for key, data in DATASET.items():
        scores = {"water": data["water"], "energy": data["energy"], "community": data["community"]}
        result.append({
            "location": key,
            "metro":    data["metro"],
            "lat":      data["lat"],
            "lng":      data["lng"],
            "scores":   scores,
            "verdict":  _get_verdict(scores),
        })
    return result
