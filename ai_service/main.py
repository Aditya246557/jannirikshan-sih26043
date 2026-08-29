"""
SIH26043 - Socio-Sphere Unified AI Microservice
Comprehensive 5-Module AI Intelligence Engine:
1. Module 1: NLP Domain Classification (9 governance domains)
2. Module 2: Civic Issue Subclassification (Pothole, Fallen Tree, Broken Street Light, Garbage)
3. Module 3: Duplicate Detection & GPS Clustering (100m radius geodesic)
4. Module 4: Multi-factor Priority Prediction (LOW, MEDIUM, HIGH, CRITICAL)
5. Module 5: Computer Vision Defect Detection & Safety Moderation (Ultralytics YOLO best.pt)
"""

import io
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

from services.nlp_service import classify_complaint_text
from services.civic_issue_service import predict_civic_issue_text
from services.duplicate_service import calculate_duplicate_score, cluster_complaints
from services.priority_service import predict_priority_score
from services.university_match_service import match_university_for_complaint
from services.vision_service import (
    CLASS_NAMES,
    CIVIC_DETECTION_THRESHOLD,
    CIVIC_MODEL_PATH,
    detect_and_validate_evidence,
    analyze_image_safety,
)

app = FastAPI(
    title="Socio-Sphere Unified AI Intelligence Engine",
    description="Unified deep learning & NLP microservice for domain classification, civic defect localization, deduplication, priority escalation, and visual evidence verification.",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# PYDANTIC SCHEMAS
# ==========================================

class ClassifyRequest(BaseModel):
    text: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None


class CivicIssueRequest(BaseModel):
    text: str


class DuplicateRequest(BaseModel):
    text_a: str
    text_b: str
    issue_a: Optional[str] = ""
    issue_b: Optional[str] = ""
    location_a: Optional[str] = ""
    location_b: Optional[str] = ""
    lat_a: Optional[float] = None
    lon_a: Optional[float] = None
    lat_b: Optional[float] = None
    lon_b: Optional[float] = None


class GpsClusterItem(BaseModel):
    id: Union[str, int]
    issue_type: str
    latitude: float
    longitude: float


class GpsClusterRequest(BaseModel):
    complaints: List[GpsClusterItem]
    radius_meters: Optional[float] = 100.0


class PriorityRequest(BaseModel):
    issue_type: str
    cluster_size: Optional[int] = 1
    severity: Optional[int] = None
    safety_risk: Optional[int] = None
    duration_hours: Optional[float] = None


class AnalyzeComplaintRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    affected_people: Optional[int] = 50
    user_severity: Optional[str] = "MEDIUM"


# ==========================================
# SYSTEM & HEALTH ENDPOINTS
# ==========================================

@app.get("/")
def root():
    return {
        "service": "Socio-Sphere Unified AI Intelligence Engine",
        "status": "running",
        "version": "3.0.0",
        "modules": [
            "Module 1: NLP Domain Classification (9 domains)",
            "Module 2: Civic Issue Subclassification (4 classes)",
            "Module 3: Duplicate Detection + GPS Clustering (100m)",
            "Module 4: Multi-Factor Priority Prediction (LOW/MED/HIGH/CRITICAL)",
            "Module 5: Computer Vision Defect Detection (YOLO best.pt)"
        ],
        "supported_vision_classes": list(CLASS_NAMES.values()),
        "weights": str(CIVIC_MODEL_PATH),
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
        "vision_model": "civic-4class-yolo",
        "nlp_model": "all-MiniLM-L6-v2 + LogisticRegression",
        "priority_model": "tabular-randomforest-pipeline",
        "duplicate_engine": "hybrid-semantic-geodesic-100m",
        "classes": list(CLASS_NAMES.values()),
        "mAP50": 0.8206,
        "version": "3.0.0"
    }


# ==========================================
# MODULE 1: NLP DOMAIN CLASSIFICATION
# ==========================================

@app.post("/classify")
@app.post("/api/ai/classify")
def classify_domain(req: ClassifyRequest):
    combined_text = req.text
    if not combined_text:
        parts = [p for p in [req.title, req.description] if p and p.strip()]
        combined_text = " - ".join(parts) if parts else ""

    result = classify_complaint_text(combined_text)
    return {
        "success": True,
        "data": result
    }


# ==========================================
# MODULE 2: CIVIC ISSUE SUBCLASSIFICATION
# ==========================================

@app.post("/civic-issue")
@app.post("/api/ai/civic-issue")
def classify_civic_issue(req: CivicIssueRequest):
    result = predict_civic_issue_text(req.text)
    return {
        "success": True,
        "data": result
    }


# ==========================================
# MODULE 3: DUPLICATE DETECTION & GPS CLUSTERING
# ==========================================

@app.post("/duplicate")
@app.post("/api/ai/duplicate")
def check_duplicate(req: DuplicateRequest):
    result = calculate_duplicate_score(
        complaint_a=req.text_a,
        complaint_b=req.text_b,
        issue_a=req.issue_a or "",
        issue_b=req.issue_b or "",
        location_a=req.location_a or "",
        location_b=req.location_b or "",
        lat_a=req.lat_a,
        lon_a=req.lon_a,
        lat_b=req.lat_b,
        lon_b=req.lon_b,
    )
    return {
        "success": True,
        "data": result
    }


@app.post("/cluster")
@app.post("/api/ai/cluster")
def cluster_gps_complaints(req: GpsClusterRequest):
    dict_list = [item.model_dump() for item in req.complaints]
    clusters = cluster_complaints(dict_list, radius_meters=req.radius_meters or 100.0)
    return {
        "success": True,
        "total_clusters": len(clusters),
        "radius_meters": req.radius_meters or 100.0,
        "clusters": clusters
    }


# ==========================================
# MODULE 4: PRIORITY PREDICTION
# ==========================================

@app.post("/priority")
@app.post("/api/ai/priority")
def predict_priority(req: PriorityRequest):
    result = predict_priority_score(
        issue_type=req.issue_type,
        cluster_size=req.cluster_size or 1,
        severity=req.severity,
        safety_risk=req.safety_risk,
        duration_hours=req.duration_hours,
    )
    return {
        "success": True,
        "data": result
    }


# ==========================================
# UNIFIED COMPLAINT ANALYSIS ENDPOINT
# ==========================================

@app.post("/analyze-complaint")
@app.post("/api/ai/analyze-complaint")
def analyze_complaint(req: AnalyzeComplaintRequest):
    text = " - ".join([p for p in [req.title, req.description] if p and p.strip()])
    nlp_res = classify_complaint_text(text)

    domain = nlp_res["domain"]
    civic_issue = nlp_res["civic_issue"] or ("Pothole" if domain == "Civic Complaints" else None)

    # Calculate Priority
    priority_res = None
    if civic_issue:
        priority_res = predict_priority_score(
            issue_type=civic_issue,
            cluster_size=1,
            severity=None,
            safety_risk=None,
            duration_hours=24.0
        )

    return {
        "success": True,
        "text": text,
        "domain_analysis": nlp_res,
        "priority_analysis": priority_res,
    }


# ==========================================
# MODULE 5: COMPUTER VISION EVIDENCE VALIDATION
# (Maintains 100% backward compatibility)
# ==========================================

@app.post("/predict")
@app.post("/validate-image")
@app.post("/api/ai/vision")
async def predict_and_validate(
    file: UploadFile = File(...)
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files (JPG, PNG, WebP) are allowed."
        )

    try:
        contents = await file.read()
        try:
            image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            return {
                "success": True,
                "valid": False,
                "stage": "SAFETY_FILTER",
                "error_type": "INVALID_IMAGE",
                "status": "REJECTED",
                "message": "The uploaded file is not a valid or readable image format. Please capture a clear photograph.",
                "detected_class": None,
                "detected_confidence": None,
                "category": None,
                "recommended_department": None,
                "filename": file.filename,
                "detections_count": 0,
                "detections": []
            }

        return detect_and_validate_evidence(image, filename=file.filename or "evidence.jpg")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Image inference failed: {str(e)}"
        )


# ==========================================
# COMPLAINT DETAIL TEMPLATES
# (Maintains 100% backward compatibility)
# ==========================================

GENERATED_DETAILS_TEMPLATES = {
    "pothole": {
        "titles": [
            "Large Pothole Causing Road Safety Hazard",
            "Severe Road Surface Crater and Asphalt Degradation",
            "Hazardous Pothole Cluster Affecting Vehicular Traffic"
        ],
        "descriptions": [
            "The photograph shows a pothole affecting the road surface{loc}. The damaged asphalt creates a safety hazard for vehicles, motorcyclists, and pedestrians. The affected roadway section should be inspected and repaired to restore safe and durable road access.",
            "Visible evidence confirms significant asphalt breakdown and road crater formation{loc}. The damaged pavement impairs traffic flow and increases collision risks. Structural resurfacing and road base stabilization are required.",
            "The civic evidence indicates road surface deterioration with open pothole depression{loc}. The condition poses risk of vehicle tire damage and rider instability, requiring immediate municipal patching."
        ],
        "outcomes": [
            "Inspect and repair the damaged road section using an appropriate road-repair method, restore a safe and durable road surface, and verify the repaired section for traffic safety.",
            "Deploy automated or manual cold-mix polymer patching, level road depression, and seal road seams to prevent water penetration.",
            "Conduct sub-base structural testing, apply asphalt compaction, and restore smooth vehicular transit."
        ]
    },
    "garbage": {
        "titles": [
            "Uncollected Garbage Accumulation in Residential Area",
            "Solid Waste Dump Causing Sanitation Hazard",
            "Overflowing Waste Accumulation Requiring Immediate Clearance"
        ],
        "descriptions": [
            "The photograph shows an accumulation of uncollected solid waste and scattered refuse{loc}. The unattended garbage pile creates hygiene risks, foul odor, and potential pest infestation affecting local residents and passersby. The site requires mechanical waste removal, surface disinfection, and scheduled municipal bin placement to prevent recurrence.",
            "Civic survey confirms accumulated municipal solid waste and littering{loc}. The refuse accumulation degrades local environmental hygiene and blocks public pathways. Rapid sanitation cleanup is necessary.",
            "Visible waste disposal backlog causing unsanitary conditions{loc}. The pile requires immediate clearance by municipal waste management teams followed by area sanitation."
        ],
        "outcomes": [
            "Remove the accumulated waste, clean and sanitize the affected area, and establish appropriate waste collection measures to prevent recurrence.",
            "Conduct comprehensive waste evacuation, sanitize surrounding ground, and install designated collection bins.",
            "Clear municipal waste buildup, execute area disinfection, and enforce scheduled waste pickup cycles."
        ]
    },
    "broken_street_light": {
        "titles": [
            "Non-Functional Streetlight Creating Night-Time Safety Risk",
            "Damaged Street Lighting Luminaire and Dark Corridor Hazard",
            "Faulty Public Streetlight Requiring Electrical Maintenance"
        ],
        "descriptions": [
            "The photograph shows a non-functional or structurally damaged streetlight fixture{loc}. The lack of adequate public illumination after dark reduces visibility and poses safety risks for pedestrians and motorists. The electrical fixture, wiring circuit, and LED luminaire require technical inspection and component replacement to ensure consistent night-time lighting.",
            "Photographic evidence indicates damaged or defective public lighting pole{loc}. The resulting dark corridor elevates safety concerns for nocturnal commuters and residents. Technical repair of the luminaire is required.",
            "The civic infrastructure survey confirms a broken streetlight assembly{loc}. Defective wiring or shattered fixture prevents illumination, requiring electrical maintenance and component replacement."
        ],
        "outcomes": [
            "Inspect and restore the faulty streetlight system, verify safe electrical operation, and ensure adequate illumination of the affected public area.",
            "Replace damaged LED luminaire, test line voltage circuitry, and verify nocturnal illumination levels.",
            "Restore power supply to pole, replace defective casing, and validate night-time lighting coverage for public safety."
        ]
    },
    "fallen_tree": {
        "titles": [
            "Fallen Tree Blocking Roadway and Pedestrian Access",
            "Uprooted Tree Obstructing Public Pathway",
            "Fallen Tree and Branch Hazard Requiring Emergency Clearance"
        ],
        "descriptions": [
            "The photograph shows a fallen tree or heavy branch obstructing the public thoroughfare{loc}. The obstruction impedes vehicular movement and poses potential hazards to overhead utility cables and nearby infrastructure. Emergency clearance crews must section the timber, remove debris, and clear the pathway to restore normal public access.",
            "Civic evidence verifies tree collapse across public access pathway{loc}. The fallen trunk restricts traffic passage and creates safety risks for surrounding infrastructure. Rapid mechanical timber clearing is required.",
            "The survey photo reveals heavy fallen timber blocking public transit route{loc}. Urgent urban forestry intervention is needed to remove trunk sections and clear the roadway."
        ],
        "outcomes": [
            "Safely clear the fallen tree from the affected public pathway or road, restore safe access, and assess the surrounding area for remaining hazards.",
            "Deploy emergency forestry clearing crews to saw timber, transport debris, and reopen blocked transit routes.",
            "Section and evacuate tree obstruction, inspect adjacent trees for root stability, and restore full roadway access."
        ]
    }
}


# ==========================================
# UNIVERSITY MATCHING ENGINE
# ==========================================

class UniversityMatchRequest(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    category: Optional[str] = ""
    civic_issue: Optional[str] = None
    priority: Optional[str] = "MEDIUM"
    state: Optional[str] = None
    district: Optional[str] = None


@app.post("/university-match")
@app.post("/api/ai/university-match")
def match_university(req: UniversityMatchRequest):
    result = match_university_for_complaint(
        title=req.title or "",
        description=req.description or "",
        category=req.category or "",
        civic_issue=req.civic_issue,
        priority=req.priority or "MEDIUM",
        state=req.state,
        district=req.district
    )
    return {
        "success": True,
        "data": result
    }


# ==========================================
# MODULE 6: AUTO GENERATE COMPLAINT DETAILS
# ==========================================


@app.post("/generate-complaint-details")
@app.post("/generate-details")
async def generate_complaint_details(
    file: UploadFile = File(...),
    location: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    variation: Optional[int] = Form(0)
):
    validation_res = await predict_and_validate(file)
    if not validation_res.get("valid", False):
        return {
            "success": True,
            "valid": False,
            "stage": validation_res.get("stage", "CIVIC_VERIFICATION"),
            "error_type": validation_res.get("error_type", "NO_CIVIC_ISSUE"),
            "status": validation_res.get("status", "REJECTED"),
            "message": validation_res.get("message", "No recognized civic issue was detected with sufficient confidence. Please upload a clear photograph of the problem."),
            "detected_class": None,
            "detected_confidence": None,
            "category": None,
            "recommended_department": None,
            "details": None
        }

    detected_class = validation_res.get("detected_class")
    confidence = validation_res.get("detected_confidence")
    category = validation_res.get("category")
    department = validation_res.get("recommended_department")

    template = GENERATED_DETAILS_TEMPLATES.get(detected_class, GENERATED_DETAILS_TEMPLATES.get("pothole"))

    loc_str = ""
    if location and isinstance(location, str):
        cleaned_loc = location.strip().strip(",").strip()
        if cleaned_loc and any(c.isalnum() for c in cleaned_loc) and cleaned_loc.lower() not in ["null", "undefined", ","]:
            loc_str = f" in {cleaned_loc}"

    v_idx = (variation or 0) % 3

    title = template["titles"][v_idx]
    desc_template = template["descriptions"][v_idx]
    generated_desc = desc_template.format(loc=loc_str)

    if description and description.strip() and not description.strip().startswith("Pending"):
        generated_desc += f" Additional citizen observation: {description.strip()}"

    outcome = template["outcomes"][v_idx]

    return {
        "success": True,
        "valid": True,
        "stage": "CIVIC_VERIFICATION",
        "status": "VALID_CIVIC_ISSUE",
        "detected_class": detected_class,
        "detected_confidence": confidence,
        "category": category,
        "recommended_department": department,
        "details": {
            "title": title,
            "description": generated_desc,
            "desired_engineering_outcome": outcome
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)