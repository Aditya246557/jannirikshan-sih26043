"""
Socio-Sphere AI University Matching Engine
Semantic matching between crowdsourced civic defect requirements and university research capabilities.
Candidate Pool:
1. IIT Bombay (ID 1): Structural Mechanics, Advanced Geopolymer Cold-Mix Materials, Clean Energy, Water Treatment
2. IIT Madras (ID 2): Transportation & Pavement Engineering, Road Safety & Traffic Sensors, Desalination, Robotics
3. IIT (BHU) Varanasi (ID 3): Smart Agriculture, Solid Waste Treatment, Environmental Biotech, River Ecosystems
4. BITS Pilani (ID 4): Electrical & Public Lighting, Embedded Sensors, Autonomous Drones, Urban Drainage, Renewable Energy
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional
import numpy as np

from services.nlp_service import get_embedding_model

UNIVERSITY_PROFILES = [
    {
        "id": 1,
        "name": "IIT Bombay",
        "code": "IITB-01",
        "state": "Maharashtra",
        "city": "Mumbai",
        "specializations": [
            "Structural Mechanics",
            "Geopolymer Cold-Mix Materials",
            "Clean Energy & Solar Tech",
            "Water Systems & Nano-Filtration",
            "Embedded IoT Sensing"
        ],
        "keywords": [
            "geopolymer", "structural", "asphalt composite", "nano-filtration", "water",
            "solar", "clean energy", "iot sensing", "materials science"
        ],
        "domain_affinity": {
            "Water Management": 0.95,
            "Clean Energy": 0.92,
            "Roads & Infrastructure": 0.78,
            "Smart Agriculture": 0.65,
            "Environment & Emergency Clearance": 0.70,
            "Sanitation & Waste": 0.68,
            "Electrical & Public Lighting": 0.72,
        },
        "civic_issue_affinity": {
            "pothole": 0.76,
            "broken_street_light": 0.75,
            "garbage": 0.65,
            "fallen_tree": 0.72
        },
        "capacity_available": 14,
        "rating": 4.9
    },
    {
        "id": 2,
        "name": "IIT Madras",
        "code": "IITM-02",
        "state": "Tamil Nadu",
        "city": "Chennai",
        "specializations": [
            "Transportation & Pavement Engineering",
            "Road Safety & Traffic Sensors",
            "Highway Cold-Mix Patching",
            "Desalination & Coastal Infrastructure",
            "Autonomous Field Robotics"
        ],
        "keywords": [
            "pavement", "road", "pothole", "highway", "traffic", "transportation",
            "asphalt degradation", "crater", "road safety", "roadway", "desalination", "robotics"
        ],
        "domain_affinity": {
            "Roads & Infrastructure": 0.98,
            "Roads & Transport": 0.98,
            "Environment & Emergency Clearance": 0.82,
            "Water Management": 0.85,
            "Clean Energy": 0.70,
            "Sanitation & Waste": 0.65,
            "Electrical & Public Lighting": 0.68,
        },
        "civic_issue_affinity": {
            "pothole": 0.98,
            "broken_street_light": 0.68,
            "garbage": 0.62,
            "fallen_tree": 0.84
        },
        "capacity_available": 19,
        "rating": 4.9
    },
    {
        "id": 3,
        "name": "IIT (BHU) Varanasi",
        "code": "IITBHU-03",
        "state": "Uttar Pradesh",
        "city": "Varanasi",
        "specializations": [
            "Smart Agriculture",
            "Solid Waste Treatment & Bio-Digestion",
            "Environmental Biotechnology",
            "Urban Sanitation & River Ecosystems"
        ],
        "keywords": [
            "garbage", "waste", "solid waste", "sanitation", "bio-digestion", "agriculture",
            "crop", "river", "effluent", "environmental biotech", "landfill", "refuse"
        ],
        "domain_affinity": {
            "Sanitation & Waste": 0.98,
            "Smart Agriculture": 0.95,
            "Environment & Emergency Clearance": 0.88,
            "Water Management": 0.80,
            "Roads & Infrastructure": 0.65,
            "Electrical & Public Lighting": 0.60,
        },
        "civic_issue_affinity": {
            "garbage": 0.98,
            "fallen_tree": 0.86,
            "pothole": 0.64,
            "broken_street_light": 0.60
        },
        "capacity_available": 11,
        "rating": 4.85
    },
    {
        "id": 4,
        "name": "BITS Pilani",
        "code": "BITS-04",
        "state": "Rajasthan",
        "city": "Pilani",
        "specializations": [
            "Electrical & Public Lighting Grids",
            "Embedded Mesh Sensors",
            "Autonomous Drone Survey",
            "Urban Drainage & Micro-Hydro",
            "Smart Power Distribution"
        ],
        "keywords": [
            "streetlight", "street light", "lighting", "electricity", "luminaire",
            "dark corridor", "power grid", "drone", "embedded mesh", "sensor", "drainage"
        ],
        "domain_affinity": {
            "Electrical & Public Lighting": 0.98,
            "Clean Energy": 0.94,
            "Environment & Emergency Clearance": 0.85,
            "Roads & Infrastructure": 0.72,
            "Water Management": 0.70,
            "Sanitation & Waste": 0.65,
        },
        "civic_issue_affinity": {
            "broken_street_light": 0.98,
            "fallen_tree": 0.84,
            "pothole": 0.70,
            "garbage": 0.62
        },
        "capacity_available": 10,
        "rating": 4.88
    }
]


def match_university_for_complaint(
    title: str = "",
    description: str = "",
    category: str = "",
    civic_issue: Optional[str] = None,
    priority: str = "MEDIUM",
    state: Optional[str] = None,
    district: Optional[str] = None
) -> Dict[str, Any]:
    """
    Ranks the 4 demo universities using multi-modal embedding similarity,
    domain affinity, civic defect specialization, and location proximity.
    """
    text_content = f"{title} {description} {category} {civic_issue or ''}".strip().lower()
    civic_key = (civic_issue or "").lower().replace(" ", "_")

    model = get_embedding_model()
    text_emb = model.encode([text_content], normalize_embeddings=True)[0]

    ranked_candidates = []

    for univ in UNIVERSITY_PROFILES:
        # 1. Semantic Embedding Similarity (40%)
        univ_desc = f"{univ['name']} {univ['state']} " + " ".join(univ['specializations']) + " " + " ".join(univ['keywords'])
        univ_emb = model.encode([univ_desc], normalize_embeddings=True)[0]
        cos_sim = float(np.dot(text_emb, univ_emb))
        sim_score = max(0.0, min(1.0, (cos_sim + 1.0) / 2.0))

        # 2. Domain & Civic Defect Match (35%)
        dom_score = univ["domain_affinity"].get(category, 0.65)
        if civic_key and civic_key in univ["civic_issue_affinity"]:
            civic_score = univ["civic_issue_affinity"][civic_key]
            specialization_score = (dom_score * 0.4) + (civic_score * 0.6)
        else:
            specialization_score = dom_score

        # Keyword boost
        kw_hits = sum(1 for kw in univ["keywords"] if kw in text_content)
        kw_boost = min(0.15, kw_hits * 0.04)

        # 3. Location Proximity (15%)
        loc_score = 0.5
        if state and state.strip().lower() == univ["state"].lower():
            loc_score = 1.0
        elif district and district.strip().lower() == univ["city"].lower():
            loc_score = 1.0

        # 4. Institutional Rating & Capacity (10%)
        cap_score = min(1.0, univ["capacity_available"] / 20.0)
        inst_score = (univ["rating"] / 5.0 * 0.7) + (cap_score * 0.3)

        # Weighted final score (0 - 100)
        final_weight = (
            (sim_score * 0.35) +
            (specialization_score * 0.35) +
            (kw_boost * 0.10) +
            (loc_score * 0.10) +
            (inst_score * 0.10)
        )
        final_score_pct = round(max(55.0, min(97.0, final_weight * 100.0)), 1)

        # Generate reasons
        reasons = []
        if specialization_score >= 0.85:
            reasons.append(f"Primary Research Specialization in {category}")
        if civic_key and univ["civic_issue_affinity"].get(civic_key, 0) >= 0.85:
            reasons.append(f"Dedicated R&D Laboratory for {civic_issue or 'Civic Defects'}")
        if loc_score == 1.0:
            reasons.append(f"Regional State Proximity ({univ['state']})")
        reasons.append(f"Available Research Capacity ({univ['capacity_available']} slots open)")

        ranked_candidates.append({
            "universityId": univ["id"],
            "name": univ["name"],
            "universityName": univ["name"],
            "code": univ["code"],
            "state": univ["state"],
            "matchScore": int(round(final_score_pct)),
            "matchScorePercent": final_score_pct,
            "confidence": round(final_score_pct / 100.0, 4),
            "confidencePercent": final_score_pct,
            "specializations": univ["specializations"],
            "matchReasons": reasons
        })

    # Sort candidates by matchScore descending
    ranked_candidates.sort(key=lambda c: c["matchScore"], reverse=True)

    top1 = ranked_candidates[0]
    top_reasons_str = " • ".join(top1["matchReasons"][:3])
    decision_reason = f"Strong capability match for {category}: {top_reasons_str}"

    return {
        "bestUniversityId": top1["universityId"],
        "bestUniversityName": top1["name"],
        "matchScore": top1["matchScore"],
        "confidence": top1["confidence"],
        "confidencePercent": top1["confidencePercent"],
        "reason": decision_reason,
        "rankedCandidates": ranked_candidates
    }
