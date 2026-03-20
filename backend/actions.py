"""
Terrascope Action Generator — produces professional action documents from risk reasoning.

Primary: Uses Claude API (claude-haiku) when ANTHROPIC_API_KEY is set.
Fallback: Returns polished templated content when key is absent.
"""

import json
import os

# ── Fallback templates ─────────────────────────────────────────────────────────

_TEMPLATES = {
    "water": {
        "title": "Hydrological Risk Assessment & Water Strategy",
        "document_type": "Technical Strategy Document",
        "sections": [
            {
                "heading": "Site Water Demand Analysis",
                "content": (
                    "A {size}-scale data centre at {location} will require an estimated "
                    "{water_demand} of process water annually for cooling operations under "
                    "standard air-cooled configurations. Given the elevated baseline water "
                    "stress score of {score}/99 for this region, demand modelling must account "
                    "for seasonal variation and projected population growth competing for the "
                    "same watershed resources."
                ),
            },
            {
                "heading": "10-Year Hydrological Projection",
                "content": (
                    "Commission a 10-year forward-looking hydrological study from a licensed "
                    "hydrogeologist covering the site's watershed catchment area. The study "
                    "should model three scenarios — baseline continuation, moderate drought, "
                    "and IPCC RCP 8.5 — and quantify available water allocations in each. "
                    "Outputs must include a monthly availability curve and a stress threshold "
                    "trigger plan."
                ),
            },
            {
                "heading": "Water Efficiency Measures",
                "content": (
                    "Adopt closed-loop dry-side cooling (air-side economisers) as the primary "
                    "architecture to eliminate potable water consumption in ambient conditions "
                    "below 18°C. For periods requiring wet cooling, target a Water Usage "
                    "Effectiveness (WUE) below 0.4 L/kWh — consistent with Microsoft's 2023 "
                    "sustainability benchmark. Install sub-metering at all cooling tower inlets "
                    "to enable real-time consumption reporting."
                ),
            },
            {
                "heading": "Permitting & Regulatory Pathway",
                "content": (
                    "File a Water Right Application with the relevant State Engineer's Office "
                    "minimum 18 months before groundbreaking. Engage the local water authority "
                    "early to negotiate an industrial water supply agreement with guaranteed "
                    "allocation floors and drought curtailment protocols. Retain copies of all "
                    "NPDES permits and file annual water use reports as required under the "
                    "Clean Water Act."
                ),
            },
            {
                "heading": "Contingency & Alternative Sources",
                "content": (
                    "Identify at least two alternative water supply sources (recycled municipal "
                    "water, on-site rainwater harvesting, or deep aquifer access) that can "
                    "serve as a backup during drought-curtailment events. Engage a water broker "
                    "to explore Water Transfer Agreements with agricultural users in the county, "
                    "a mechanism increasingly used by hyperscalers in high-stress western states."
                ),
            },
        ],
    },
    "energy": {
        "title": "Grid Integration & Energy Resilience Plan",
        "document_type": "Infrastructure Strategy Document",
        "sections": [
            {
                "heading": "Interconnection Queue Assessment",
                "content": (
                    "Submit a formal Interconnection Feasibility Study request to the relevant "
                    "ISO/RTO (e.g. PJM, MISO, CAISO, ERCOT) covering {location}. "
                    "The current regional queue backlog for large loads (>50 MW) averages "
                    "36–48 months in constrained markets — factor this into your project "
                    "timeline. Request a cluster study to identify shared upgrade costs with "
                    "other queued projects and explore whether a co-development agreement "
                    "could reduce your individual network upgrade liability."
                ),
            },
            {
                "heading": "Substation & Transmission Upgrade Plan",
                "content": (
                    "Commission a transmission adequacy study from a NERC-certified power "
                    "engineer to identify the nearest available substation capacity at 115 kV "
                    "or above within 5 miles of the site. For a {size}-scale facility, plan "
                    "for a dedicated 230 kV substation with N+1 redundancy on all high-side "
                    "breakers. Budget for potential network upgrade contributions — typically "
                    "$5–25M in constrained markets — and reflect this in project pro forma "
                    "modelling."
                ),
            },
            {
                "heading": "Renewable Energy Procurement Strategy",
                "content": (
                    "Execute a long-term Power Purchase Agreement (PPA) with a utility-scale "
                    "solar or wind developer in the same balancing authority area. A 15–20 year "
                    "PPA at a fixed strike price of $25–35/MWh provides both cost certainty "
                    "and enables a credible 24/7 carbon-free energy (CFE) matching claim. "
                    "Alternatively, explore Virtual PPAs with an hourly matching attestation "
                    "mechanism, which avoid direct transmission constraints."
                ),
            },
            {
                "heading": "On-site Resilience & Backup Generation",
                "content": (
                    "Install a minimum of 2N redundant on-site generation capacity using "
                    "natural gas turbines or large-format battery storage (4-hour BESS) to "
                    "maintain Tier III operational continuity during grid curtailment events. "
                    "Register the facility as a demand response asset with the local utility "
                    "to access curtailment incentives and reduce peak demand charges — "
                    "typically $8–15/kW-month in high-congestion zones."
                ),
            },
        ],
    },
    "community": {
        "title": "Community Benefits Agreement Framework",
        "document_type": "Legal & Engagement Framework",
        "sections": [
            {
                "heading": "Employment & Skills Commitments",
                "content": (
                    "Commit to a minimum of 150 permanent, full-time operational roles at "
                    "{location}, with a local hiring preference clause requiring that at least "
                    "60% of roles are filled by residents within the county. Partner with "
                    "community colleges and vocational training providers to establish a "
                    "pre-employment Data Centre Technician pathway, fully funded by the "
                    "developer, with a minimum of 40 funded places per year during construction "
                    "and 20 per year during operations."
                ),
            },
            {
                "heading": "Infrastructure & Community Contributions",
                "content": (
                    "Establish a Community Infrastructure Fund with an annual contribution of "
                    "$500,000 — indexed to CPI — for the first 20 years of operations. Fund "
                    "allocation to be determined by a Community Liaison Committee with "
                    "representation from local government, school boards, and resident "
                    "associations. Priority spending areas should include school STEM "
                    "infrastructure, road and drainage upgrades adjacent to the site, and "
                    "local broadband improvement."
                ),
            },
            {
                "heading": "Noise, Traffic & Environmental Protections",
                "content": (
                    "Commit to noise limits not exceeding 45 dB(A) at the nearest residential "
                    "boundary (night-time) and 55 dB(A) during daytime operations, verified "
                    "by independent acoustic monitoring quarterly. Develop a Construction "
                    "Traffic Management Plan approved by the county highways authority, "
                    "including HGV routing restrictions during school drop-off and collection "
                    "hours, and a ring-fenced fund for road surface reinstatement."
                ),
            },
            {
                "heading": "Community Liaison & Dispute Resolution",
                "content": (
                    "Establish a permanent Community Liaison Group (CLG) meeting quarterly, "
                    "with a dedicated community relations officer employed by the developer. "
                    "All CLG meetings to be publicly minuted and posted within 14 days. "
                    "Create an independent dispute resolution mechanism — staffed by a jointly "
                    "appointed mediator — to handle complaints within 28 days, with binding "
                    "arbitration available as a final escalation route."
                ),
            },
            {
                "heading": "Heat & Energy Reuse Opportunities",
                "content": (
                    "Conduct a feasibility study within 12 months of planning approval into "
                    "waste heat recovery from server cooling infrastructure. In suitable "
                    "locations, excess heat at 40–60°C can supply district heating networks, "
                    "agricultural greenhouses, or aquaculture facilities — directly benefiting "
                    "the local community and improving the site's overall energy efficiency "
                    "rating. Share study outputs with the local authority and offer to co-fund "
                    "any viable heat network connection."
                ),
            },
        ],
    },
}

_SIZE_WATER = {"small": "2.5 million gallons", "medium": "12 million gallons", "large": "35 million gallons"}


def _render_template(template: dict, location: str, size: str, score: int) -> dict:
    """Fill placeholders in template sections."""
    filled = {
        "title": template["title"],
        "document_type": template["document_type"],
        "sections": [],
    }
    for section in template["sections"]:
        content = section["content"].format(
            location=location,
            size=size,
            score=score,
            water_demand=_SIZE_WATER.get(size, "12 million gallons"),
        )
        filled["sections"].append({"heading": section["heading"], "content": content})
    return filled


async def _claude_generate(location: str, dimension: str, size: str, score: int, mitigation: str) -> dict | None:
    """Call Claude API if ANTHROPIC_API_KEY is available. Returns None on any failure."""
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return None
    try:
        import anthropic  # lazy import — only needed when key is present

        dim_labels = {
            "water":     "Water & Cooling Risk",
            "energy":    "Energy Grid Risk",
            "community": "Community & Political Risk",
        }
        doc_types = {
            "water":     "Hydrological Risk Assessment & Water Strategy",
            "energy":    "Grid Integration & Energy Resilience Plan",
            "community": "Community Benefits Agreement Framework",
        }

        prompt = f"""You are Terrascope's AI document generator. Produce a professional action document for a data centre developer.

Site: {location}
Data Centre Size: {size}
Risk Dimension: {dim_labels.get(dimension, dimension)}
Risk Score: {score}/99
Recommended Mitigation: {mitigation}

Respond ONLY with valid JSON in exactly this format — no markdown, no explanation:
{{
  "title": "{doc_types.get(dimension, 'Action Plan')}",
  "document_type": "Professional Action Document",
  "sections": [
    {{"heading": "Section Title", "content": "2-3 sentences of specific, actionable, professional content tailored to {location} and this risk type."}},
    {{"heading": "Section Title", "content": "..."}},
    {{"heading": "Section Title", "content": "..."}},
    {{"heading": "Section Title", "content": "..."}}
  ]
}}

Be specific to {location}, use real industry terminology, include concrete numbers/timelines, and make it genuinely useful to a data centre developer."""

        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1200,
            messages=[{"role": "user", "content": prompt}],
        )
        return json.loads(message.content[0].text)
    except Exception:
        return None


async def generate_action_document(
    location: str,
    dimension: str,
    size: str,
    score: int,
    mitigation: str,
) -> dict:
    """
    Generate an action document for the given risk dimension.
    Tries Claude API first; falls back to polished templates.
    """
    result = await _claude_generate(location, dimension, size, score, mitigation)
    if result:
        return result

    template = _TEMPLATES.get(dimension, _TEMPLATES["community"])
    return _render_template(template, location, size, score)
