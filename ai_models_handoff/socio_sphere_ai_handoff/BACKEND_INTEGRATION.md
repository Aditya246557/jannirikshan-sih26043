# Socio-Sphere AI — Backend Integration Contract

This document provides complete technical specifications for backend developers (Node.js, Express, FastAPI, Django, Go, Spring Boot, etc.) integrating the 5 Socio-Sphere AI modules.

---

## Table of Contents
1. [Integration Strategies](#1-integration-strategies)
2. [Module 1 — NLP Domain Classification](#2-module-1--nlp-domain-classification)
3. [Module 2 — Civic Issue Subclassification](#3-module-2--civic-issue-subclassification)
4. [Module 3 — Duplicate Detection & GPS Clustering](#4-module-3--duplicate-detection--gps-clustering)
5. [Module 4 — Priority Prediction & Escalation](#5-module-4--priority-prediction--escalation)
6. [Module 5 — Computer Vision & Evidence Validation](#6-module-5--computer-vision--evidence-validation)
7. [End-to-End Complaint Lifecycle Flowchart](#7-end-to-end-complaint-lifecycle-flowchart)

---

## 1. Integration Strategies

Backend developers have two primary integration options:

### Option A: Python Direct Import (Fastest for Python / FastAPI / Django Backends)
Place the `socio_sphere_ai_handoff` directory in your backend workspace and import functions directly:
```python
from nlp.predict import classify_complaint
from duplicate_detection.duplicate_detector import calculate_duplicate_score
from duplicate_detection.gps_cluster import cluster_complaints
from priority.predict_priority import predict_priority
from computer_vision.predict_cv import detect_civic_issue
```

### Option B: Microservice / HTTP Subprocess (For Node.js, Express, Go, Java)
1. Run the FastAPI Vision service: `uvicorn computer_vision.ai_service.main:app --port 8000`
2. Call CLI scripts via `child_process.execFile` or wrap the Python modules in lightweight REST endpoints.

---

## 2. Module 1 — NLP Domain Classification

### Contract Specification
- **Function**: `nlp.predict.classify_complaint(text: str) -> dict`
- **CLI**: `python nlp/predict.py --text "<string>"`
- **Model Path**: `nlp/complaint_classifier.joblib`

### Input Payload (JSON)
```json
{
  "text": "Main road par bahut bada pothole hai"
}
```

### Output Response (JSON)
```json
{
  "text": "Main road par bahut bada pothole hai",
  "domain": "Civic Complaints",
  "domain_confidence": 0.5466,
  "domain_confidence_percent": 54.66,
  "domain_rankings": [
    { "category": "Civic Complaints", "confidence": 0.5466, "confidence_percent": 54.66 },
    { "category": "Infrastructure", "confidence": 0.2118, "confidence_percent": 21.18 },
    { "category": "Sanitation", "confidence": 0.0682, "confidence_percent": 6.82 }
  ],
  "civic_issue": "Pothole",
  "civic_confidence": 0.5448,
  "civic_confidence_percent": 54.48,
  "civic_rankings": [
    { "issue": "Pothole", "confidence": 0.5448, "confidence_percent": 54.48 },
    { "issue": "Fallen Tree", "confidence": 0.1917, "confidence_percent": 19.17 }
  ]
}
```

---

## 3. Module 2 — Civic Issue Subclassification

### Contract Specification
- **Function**: `civic_issue.inference.predict_civic.predict_civic_issue(text: str) -> dict`
- **CLI**: `python civic_issue/inference/predict_civic.py --text "<string>"`
- **Model Path**: `civic_issue/civic_classifier.joblib`

### Input Payload (JSON)
```json
{
  "text": "Toofan mein ped gir kar road block ho gaya"
}
```

### Output Response (JSON)
```json
{
  "text": "Toofan mein ped gir kar road block ho gaya",
  "civic_issue": "Fallen Tree",
  "confidence": 0.4431,
  "confidence_percent": 44.31,
  "rankings": [
    { "issue": "Fallen Tree", "confidence": 0.4431, "confidence_percent": 44.31 },
    { "issue": "Pothole", "confidence": 0.2810, "confidence_percent": 28.10 },
    { "issue": "Broken Street Light", "confidence": 0.1412, "confidence_percent": 14.12 },
    { "issue": "Garbage", "confidence": 0.1347, "confidence_percent": 13.47 }
  ]
}
```

---

## 4. Module 3 — Duplicate Detection & GPS Clustering

### A. Pairwise Duplicate Detection

- **Function**: `duplicate_detection.duplicate_detector.calculate_duplicate_score(...) -> dict`
- **CLI**: `python duplicate_detection/duplicate_detector.py --text-a "..." --text-b "..." --issue-a "..." --issue-b "..." --location-a "..." --location-b "..."`

#### Input Payload (JSON)
```json
{
  "text_a": "Main road par bada pothole hai",
  "text_b": "Main road par dangerous gaddha hai",
  "issue_a": "Pothole",
  "issue_b": "Pothole",
  "location_a": "Main Road",
  "location_b": "Main Road"
}
```

#### Output Response (JSON)
```json
{
  "text_similarity": 0.8896,
  "issue_match": 1.0,
  "location_match": 1.0,
  "location_status": "STRONG",
  "base_score": 0.8896,
  "duplicate_score": 0.8896,
  "duplicate_score_percent": 88.96,
  "is_duplicate": true,
  "decision_reason": "Strong location match supports duplicate detection."
}
```

### B. GPS Batch Clustering

- **Function**: `duplicate_detection.gps_cluster.cluster_complaints(data, radius_meters=100.0) -> list[dict]`
- **CLI**: `python duplicate_detection/gps_cluster.py --input complaints.csv --radius 100.0`

#### Input Payload (JSON Array)
```json
[
  { "id": "CMP_101", "issue_type": "Pothole", "latitude": 28.6139, "longitude": 77.2090 },
  { "id": "CMP_102", "issue_type": "Pothole", "latitude": 28.6141, "longitude": 77.2092 },
  { "id": "CMP_103", "issue_type": "Garbage", "latitude": 28.6140, "longitude": 77.2091 }
]
```

#### Output Response (JSON Array)
```json
[
  {
    "cluster_id": 1,
    "issue_type": "Pothole",
    "cluster_size": 2,
    "center_latitude": 28.6140,
    "center_longitude": 77.2091,
    "complaint_ids": ["CMP_101", "CMP_102"]
  },
  {
    "cluster_id": 2,
    "issue_type": "Garbage",
    "cluster_size": 1,
    "center_latitude": 28.6140,
    "center_longitude": 77.2091,
    "complaint_ids": ["CMP_103"]
  }
]
```

---

## 5. Module 4 — Priority Prediction & Escalation

### Contract Specification
- **Function**: `priority.predict_priority.predict_priority(...) -> dict`
- **CLI**: `python priority/predict_priority.py --issue "Pothole" --cluster-size 5 --severity 3 --safety-risk 4 --duration-hours 12`
- **Model Path**: `priority/priority_classifier.joblib`

### Input Payload (JSON)
```json
{
  "issue_type": "Pothole",
  "cluster_size": 5,
  "severity": 3,
  "safety_risk": 4,
  "duration_hours": 12.0
}
```

### Output Response (JSON)
```json
{
  "issue_type": "Pothole",
  "cluster_size": 5,
  "severity": 3,
  "safety_risk": 4,
  "duration_hours": 12.0,
  "priority": "HIGH",
  "confidence": 0.80,
  "confidence_percent": 80.0,
  "probability_distribution": {
    "HIGH": 0.80,
    "CRITICAL": 0.15,
    "MEDIUM": 0.05,
    "LOW": 0.00
  }
}
```

---

## 6. Module 5 — Computer Vision & Evidence Validation

### A. Python Direct API
- **Function**: `computer_vision.predict_cv.detect_civic_issue(image_path_or_bytes, conf_threshold=0.25) -> dict`
- **Model Path**: `computer_vision/weights/best.pt`

### B. FastAPI Endpoint: `POST /validate-image`
- **URL**: `http://localhost:8000/validate-image`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (Binary Image: JPG/PNG/WebP)

#### Output Response (JSON)
```json
{
  "success": true,
  "valid": true,
  "status": "VALID_CIVIC_ISSUE",
  "detected_category": "fallen_tree",
  "detected_confidence": 86.02,
  "message": "✅ Verified Civic Evidence: Fallen Tree detected (86.02% confidence).",
  "filename": "fallen-tree-blocking-road.webp",
  "detections_count": 1,
  "detections": [
    {
      "class_id": 3,
      "class_name": "fallen_tree",
      "confidence": 0.8602,
      "confidence_percent": 86.02,
      "bounding_box": {
        "x1": 45.2,
        "y1": 120.4,
        "x2": 580.8,
        "y2": 430.1
      }
    }
  ]
}
```

#### Rejection Response Example (If inappropriate or non-civic):
```json
{
  "success": false,
  "valid": false,
  "status": "REJECTED",
  "rejection_reason": "INAPPROPRIATE_OR_EXCESSIVE_SKIN",
  "message": "⚠️ Image flagged: High skin tone or inappropriate content detected. Please upload an image of the civic issue only.",
  "filename": "selfie.jpg",
  "detections_count": 0,
  "detections": []
}
```

---

## 7. End-to-End Complaint Lifecycle Flowchart

```
Citizen Submits Complaint (Text, GPS, Photo)
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
[Visual Verification]    [Text Classification]
Module 5: YOLO Guardrail  Module 1: Domain Classifier
       │                         │
  Is Valid Image?        Is "Civic Complaints"?
   ├── No ─► Reject        ├── No  ─► Route to Domain Dept
   └── Yes ─► Continue     └── Yes ─► Module 2: Civic Issue
                                       │
                                       ▼
                             [Duplicate & Cluster]
                             Module 3: GPS Geodesic DBSCAN (100m)
                                       │
                               Extract Cluster Size
                                       │
                                       ▼
                             [Priority Escalation]
                             Module 4: Risk Model
                                       │
                             Urgency Assigned:
                        [LOW / MEDIUM / HIGH / CRITICAL]
                                       │
                                       ▼
                             Municipal Action Portal
```
