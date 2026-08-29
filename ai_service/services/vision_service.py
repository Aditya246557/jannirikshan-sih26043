"""
Socio-Sphere Computer Vision & Safety Verification Service
- Safety Guardrail (blank / corrupted / dark / overexposed / inappropriate skin tone > 42% filter)
- YOLO Civic Defect Detection (pothole, garbage, broken_street_light, fallen_tree)
"""

from __future__ import annotations

import io
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import numpy as np
from PIL import Image
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent.parent
CIVIC_MODEL_PATH = BASE_DIR / "weights" / "best.pt"

if not CIVIC_MODEL_PATH.exists():
    raise FileNotFoundError(f"Civic Model weights not found at: {CIVIC_MODEL_PATH}")

_cv_model: Optional[YOLO] = None

CIVIC_DETECTION_THRESHOLD = 0.25

CLASS_NAMES = {
    0: "pothole",
    1: "garbage",
    2: "broken_street_light",
    3: "fallen_tree"
}

CATEGORY_MAPPING = {
    "pothole": "Roads & Infrastructure",
    "garbage": "Sanitation & Waste",
    "broken_street_light": "Electrical & Public Lighting",
    "fallen_tree": "Environment & Emergency Clearance"
}

DEPARTMENT_MAPPING = {
    "pothole": "Public Works Department (PWD)",
    "garbage": "Municipal Solid Waste Management",
    "broken_street_light": "State Electricity Board / Lighting Division",
    "fallen_tree": "Urban Forestry & Disaster Relief Unit"
}


def load_vision_model() -> YOLO:
    global _cv_model
    if _cv_model is None:
        _cv_model = YOLO(str(CIVIC_MODEL_PATH))
    return _cv_model


def analyze_image_safety(image: Image.Image) -> Dict[str, Any]:
    """
    STAGE 1: IMAGE SAFETY & RELEVANCE FILTER
    - Rejects blank, solid color, pitch dark, overexposed, or corrupted images.
    - Rejects inappropriate / NSFW excessive flesh tone (> 42.0%).
    """
    img_np = np.array(image.convert("RGB"))
    std = float(img_np.std())
    mean = float(img_np.mean())

    # 1. Blank or corrupted image check
    if std < 12.0:
        return {
            "safe": False,
            "stage": "SAFETY_FILTER",
            "error_type": "BLANK_OR_CORRUPTED_IMAGE",
            "message": "The uploaded photo appears blank, solid color, or corrupted. Please upload a clear photo of the civic issue."
        }

    # 2. Solid black or pitch dark check
    if mean < 10.0:
        return {
            "safe": False,
            "stage": "SAFETY_FILTER",
            "error_type": "PITCH_DARK_IMAGE",
            "message": "The uploaded photo is pitch black or completely dark. Please capture an adequately lit photograph."
        }

    # 3. Solid white or overexposed check
    if mean > 245.0:
        return {
            "safe": False,
            "stage": "SAFETY_FILTER",
            "error_type": "OVEREXPOSED_IMAGE",
            "message": "The uploaded photo is overexposed or solid white. Please capture a clear photograph."
        }

    # 4. Rule-based skin tone analysis
    r, g, b = img_np[:, :, 0], img_np[:, :, 1], img_np[:, :, 2]
    skin_mask = (
        (r > 95) & (g > 40) & (b > 20) &
        ((r.astype(int) - np.minimum(g, b).astype(int)) > 15) &
        (np.abs(r.astype(int) - g.astype(int)) > 15) &
        (r > g) & (r > b)
    )
    skin_percent = float((np.sum(skin_mask) / skin_mask.size) * 100.0)

    if skin_percent > 42.0:
        return {
            "safe": False,
            "stage": "SAFETY_FILTER",
            "error_type": "INAPPROPRIATE_OR_EXCESSIVE_SKIN",
            "message": "⚠️ Image flagged: High skin tone or inappropriate content detected. Please upload an image of the civic issue only."
        }

    return {
        "safe": True,
        "skin_percent": round(skin_percent, 2)
    }


def detect_and_validate_evidence(
    image: Image.Image,
    filename: str = "evidence.jpg",
    conf_threshold: float = CIVIC_DETECTION_THRESHOLD
) -> Dict[str, Any]:
    start_time = time.time()
    width, height = image.size
    total_area = float(width * height)

    # Stage 1: Safety & Relevance Filter
    safety = analyze_image_safety(image)
    if not safety["safe"]:
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "success": True,
            "valid": False,
            "stage": "SAFETY_FILTER",
            "error_type": safety["error_type"],
            "status": "REJECTED",
            "message": safety["message"],
            "detected_class": None,
            "detected_confidence": None,
            "category": None,
            "recommended_department": None,
            "filename": filename,
            "inference_time_ms": latency_ms,
            "detections_count": 0,
            "detections": []
        }

    # Stage 2: YOLO Detection
    model = load_vision_model()
    results = model.predict(source=image, conf=0.01, imgsz=640, verbose=False)

    detections = []
    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())

            if confidence < conf_threshold:
                continue

            x1, y1, x2, y2 = box.xyxy[0].tolist()
            box_area = (x2 - x1) * (y2 - y1)
            coverage_pct = round((box_area / total_area) * 100.0, 2) if total_area > 0 else 0.0

            class_raw = CLASS_NAMES.get(class_id, f"class_{class_id}")
            class_clean = class_raw.replace("_", " ").title()
            reported_conf = round(confidence * 100.0, 2)

            if coverage_pct > 25.0 or reported_conf > 85.0:
                severity = "CRITICAL" if coverage_pct > 40.0 else "HIGH"
            elif coverage_pct > 10.0 or reported_conf > 70.0:
                severity = "MEDIUM"
            else:
                severity = "LOW"

            detections.append({
                "class_id": class_id,
                "class_name": class_raw,
                "label": class_clean,
                "mapped_category": CATEGORY_MAPPING.get(class_raw, "Civic Infrastructure"),
                "recommended_department": DEPARTMENT_MAPPING.get(class_raw, "Municipal Administration"),
                "confidence": round(confidence, 4),
                "confidence_percent": reported_conf,
                "severity": severity,
                "coverage_percent": coverage_pct,
                "bounding_box": {
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2)
                }
            })

    latency_ms = round((time.time() - start_time) * 1000, 2)

    if len(detections) == 0:
        return {
            "success": True,
            "valid": False,
            "stage": "CIVIC_VERIFICATION",
            "error_type": "NO_CIVIC_ISSUE",
            "status": "NO_SUPPORTED_DEFECT",
            "message": "No recognized civic issue was detected with sufficient confidence. Please upload a clear photograph of the problem.",
            "detected_class": None,
            "detected_confidence": None,
            "category": None,
            "recommended_department": None,
            "filename": filename,
            "inference_time_ms": latency_ms,
            "detections_count": 0,
            "detections": []
        }

    top_detection = max(detections, key=lambda d: d["confidence"])
    top_name = top_detection["label"]
    top_conf = top_detection["confidence_percent"]
    top_cat = top_detection["mapped_category"]
    top_dept = top_detection["recommended_department"]
    top_severity = top_detection["severity"]
    top_class = top_detection["class_name"]

    return {
        "success": True,
        "valid": True,
        "stage": "CIVIC_VERIFICATION",
        "status": "VALID_CIVIC_ISSUE",
        "detected_category": top_cat,
        "category": top_cat,
        "detected_class": top_class,
        "detected_confidence": top_conf,
        "detected_severity": top_severity,
        "recommended_department": top_dept,
        "message": f"✅ Verified Civic Evidence: {top_name} detected ({top_conf}% confidence, Severity: {top_severity}).",
        "filename": filename,
        "inference_time_ms": latency_ms,
        "detections_count": len(detections),
        "detections": detections
    }
