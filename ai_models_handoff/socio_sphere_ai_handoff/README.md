# Socio-Sphere AI Engine — Model Handoff Package

This package contains the **5 implemented, trained, and verified AI modules** powering the **Socio-Sphere** intelligent civic grievance redressal and urban infrastructure monitoring platform.

---

## Table of Contents

1. [Package Overview](#1-package-overview)
2. [End-to-End AI Architecture & Pipeline](#2-end-to-end-ai-architecture--pipeline)
3. [Environment & Installation](#3-environment--installation)
4. [Module 1 — NLP Complaint Classification (Domain)](#4-module-1--nlp-complaint-classification-domain)
5. [Module 2 — Civic Issue Subclassification](#5-module-2--civic-issue-subclassification)
6. [Module 3 — Duplicate Detection & GPS Clustering](#6-module-3--duplicate-detection--gps-clustering)
7. [Module 4 — Priority Prediction & Escalation](#7-module-4--priority-prediction--escalation)
8. [Module 5 — Computer Vision Evidence Verification](#8-module-5--computer-vision-evidence-verification)
9. [Summary of Model Files & Paths](#9-summary-of-model-files--paths)
10. [Known Limitations & Future Roadmap](#10-known-limitations--future-roadmap)

---

## 1. Package Overview

```
socio_sphere_ai_handoff/
├── README.md                           # Master documentation
├── BACKEND_INTEGRATION.md              # Backend developer integration contract
├── requirements.txt                    # Exact production dependencies
├── model_manifest.json                 # Machine-readable metadata & schemas
│
├── nlp/                                # MODULE 1: Level-1 Domain Classifier
│   ├── complaint_classifier.joblib     # Trained Logistic Regression classifier (9 classes)
│   ├── label_encoder.joblib            # Label encoder for 9 domains
│   ├── metrics.json                    # Validation/test metrics
│   └── predict.py                      # Hierarchical CLI & Python API predictor
│
├── civic_issue/                        # MODULE 2: Level-2 Civic Subclassifier
│   ├── civic_classifier.joblib         # Trained Logistic Regression classifier (4 classes)
│   ├── civic_label_encoder.joblib      # Label encoder for 4 civic subcategories
│   ├── civic_metrics.json              # Benchmark metrics
│   └── inference/
│       └── predict_civic.py            # Standalone Level-2 civic issue predictor
│
├── duplicate_detection/                # MODULE 3: Duplicate Detection + GPS Clustering
│   ├── duplicate_detector.py           # Hybrid pairwise duplicate detector (text + issue + location)
│   ├── gps_cluster.py                  # Geodesic radius clustering engine (100m)
│   ├── complaints_gps.csv              # Sample GPS complaints dataset
│   ├── threshold_results.csv           # Empirical threshold calibration data
│   └── hybrid_evaluation.csv           # Evaluation benchmarks
│
├── priority/                           # MODULE 4: Priority Prediction
│   ├── priority_classifier.joblib      # Multi-factor priority model (LOW, MEDIUM, HIGH, CRITICAL)
│   ├── priority_metrics.json           # Baseline accuracy and risk features
│   ├── predict_priority.py             # Standalone priority predictor
│   └── cluster_priority.py             # Integrated Cluster -> Size -> Priority pipeline
│
└── computer_vision/                    # MODULE 5: Computer Vision Defect Detection
    ├── weights/
    │   └── best.pt                     # Custom trained Ultralytics YOLO model (4 civic classes)
    ├── data.yaml                       # YOLO class configuration
    ├── predict_cv.py                   # Direct Python & CLI image defect detector
    ├── ai_service/
    │   └── main.py                     # FastAPI microservice with 2-stage safety guardrails
    └── test_images/                    # Real civic sample photos for immediate verification
        ├── 20240305_191715_jpg.rf.0ffb9be35b1bef3501ab2f94d112f61d.jpg
        ├── fallen-tree-blocking-road.webp
        ├── img-334_jpg.rf.1c955ec59c8752c12a526ce03f4250ca.jpg
        └── street-lamp.webp
```

---

## 2. End-to-End AI Architecture & Pipeline

Socio-Sphere executes a synchronized multi-stage intelligence workflow:

```
Citizen Complaint (Text & GPS)
            │
            ▼
┌───────────────────────────────────────┐
│ Module 1: NLP Domain Classification   │ ──► [9 Governance Domains]
└───────────────────────────────────────┘
            │
    (If "Civic Complaints")
            ▼
┌───────────────────────────────────────┐
│ Module 2: Civic Issue Classification  │ ──► [Pothole | Fallen Tree | Streetlight | Garbage]
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ Module 3: Duplicate Detection & GPS   │ ──► [Pairs: Duplicate Check]
│           Clustering (100m Radius)    │ ──► [Bundles: Grouped into physical clusters]
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ Module 4: Priority Prediction         │ ──► [Calculates Urgency: LOW / MED / HIGH / CRITICAL]
│ (Inputs: Cluster Size, Risk, Elapsed) │
└───────────────────────────────────────┘

[Independent Track: Visual Evidence]
Uploaded Image Evidence ──► Module 5: Computer Vision (YOLO + Guardrails) ──► Validated Civic Defect
```

---

## 3. Environment & Installation

### Requirements
- **Python Version**: `3.10`, `3.11`, or `3.12` (Python 3.11 64-bit recommended)
- **OS**: Windows, Linux, or macOS

### Setup Virtual Environment
```bash
# Create virtual environment
python -m venv .venv

# Activate on Windows PowerShell
.venv\Scripts\Activate.ps1

# Activate on Linux/macOS
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 4. Module 1 — NLP Complaint Classification (Domain)

Classifies free-form citizen complaints in English or Hinglish into one of 9 governance departments.

- **Model Artifacts**:
  - `nlp/complaint_classifier.joblib` (Logistic Regression, 384-dimensional embeddings)
  - `nlp/label_encoder.joblib`
  - Embedding Model: `sentence-transformers/all-MiniLM-L6-v2`
- **Supported Categories (9)**:
  1. `Accessibility`
  2. `Agriculture`
  3. `Civic Complaints`
  4. `Education`
  5. `Environment`
  6. `Healthcare`
  7. `Infrastructure`
  8. `Sanitation`
  9. `Water`

### CLI Usage:
```bash
python nlp/predict.py --text "Main road par bahut bada pothole hai"
```

### Python API:
```python
from nlp.predict import classify_complaint

result = classify_complaint("Main road par bahut bada pothole hai")
print(result["domain"])              # "Civic Complaints"
print(result["domain_confidence"])   # 0.5466 (54.66%)
```

---

## 5. Module 2 — Civic Issue Subclassification

When a complaint is routed to **Civic Complaints**, this module detects the exact urban defect.

- **Model Artifacts**:
  - `civic_issue/civic_classifier.joblib`
  - `civic_issue/civic_label_encoder.joblib`
- **Supported Issues (4)**:
  1. `Pothole`
  2. `Fallen Tree`
  3. `Broken Street Light`
  4. `Garbage`

### CLI Usage:
```bash
python civic_issue/inference/predict_civic.py --text "Toofan mein ped gir kar road block ho gaya"
```

### Python API:
```python
from civic_issue.inference.predict_civic import predict_civic_issue

result = predict_civic_issue("Hamari gali ki street lights raat mein nahi jalti")
print(result["civic_issue"])  # "Broken Street Light"
print(result["confidence"])   # 0.575 (57.5%)
```

---

## 6. Module 3 — Duplicate Detection & GPS Clustering

Solves complaint duplication and ticket spam by combining semantic similarity, issue matching, location token Jaccard similarity with location gating, and geographic radius clustering.

- **Location Gating**: Even if two complaints share identical wording, if their locations are different, the system **rejects** duplicate merging.
- **GPS Clustering Radius**: 100 meters using Geodesic distance on `(latitude, longitude)`.

### Pairwise Duplicate Detection:
```bash
python duplicate_detection/duplicate_detector.py \\
    --text-a "Main road par bada pothole hai" \\
    --text-b "Main road par dangerous gaddha hai" \\
    --issue-a "Pothole" --issue-b "Pothole" \\
    --location-a "Main Road" --location-b "Main Road"
```

### Python API:
```python
from duplicate_detection.duplicate_detector import calculate_duplicate_score

res = calculate_duplicate_score(
    complaint_a="Main road par bada pothole hai",
    complaint_b="Main road par dangerous gaddha hai",
    issue_a="Pothole",
    issue_b="Pothole",
    location_a="Main Road",
    location_b="Main Road"
)
print(res["is_duplicate"])     # True
print(res["duplicate_score"])  # 0.8896 (88.96%)
```

### GPS Batch Clustering:
```bash
python duplicate_detection/gps_cluster.py --input duplicate_detection/complaints_gps.csv --radius 100.0
```

---

## 7. Module 4 — Priority Prediction & Escalation

Predicts urgency level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) using civic issue attributes and dynamic cluster aggregation.

- **Model Artifact**: `priority/priority_classifier.joblib`
- **Features Used**:
  - `issue_type` (e.g. `Pothole`, `Fallen Tree`, `Broken Street Light`, `Garbage`)
  - `cluster_size` (Integer count of bundled complaints from GPS cluster)
  - `severity` (1 to 5 scale)
  - `safety_risk` (1 to 5 scale)
  - `duration_hours` (Elapsed time since first report)

### CLI Usage:
```bash
# Example: High-risk road hazard with 10 complaints
python priority/predict_priority.py --issue "Pothole" --cluster-size 10 --severity 3 --safety-risk 5 --duration-hours 24
# Output: CRITICAL (79.0%)
```

### Integrated Pipeline (GPS Cluster -> Priority):
```bash
python priority/cluster_priority.py --input duplicate_detection/complaints_gps.csv
```

---

## 8. Module 5 — Computer Vision Evidence Verification

Detects and localizes civic infrastructure defects in uploaded complaint photos using custom-trained Ultralytics YOLO26n/YOLOv8n weights (`best.pt`, mAP@50 = 82.06%).

- **Model Weights**: `computer_vision/weights/best.pt`
- **Classes (4)**: `pothole`, `garbage`, `broken_street_light`, `fallen_tree`

### Python Direct Inference:
```bash
python computer_vision/predict_cv.py --image computer_vision/test_images/fallen-tree-blocking-road.webp
```

### 2-Stage FastAPI Vision Microservice:
Includes built-in image quality and content safety guardrails:
1. Rejects blank/corrupted images (`img_np.std() < 12.0`).
2. Rejects excessive flesh/skin tone (> 42%) to block inappropriate content.
3. Detects bounding boxes, confidence, and flags non-civic uploads.

```bash
# Start FastAPI service
uvicorn computer_vision.ai_service.main:app --host 0.0.0.0 --port 8000 --reload
```
- Swagger API Docs: `http://localhost:8000/docs`
- Endpoint: `POST /validate-image`

---

## 9. Summary of Model Files & Paths

| Module | Model File / Weights | Algorithm / Framework |
|---|---|---|
| Module 1: NLP Domain | `nlp/complaint_classifier.joblib` | Logistic Regression on `all-MiniLM-L6-v2` |
| Module 2: Civic Issue | `civic_issue/civic_classifier.joblib` | Logistic Regression on `all-MiniLM-L6-v2` |
| Module 3: Duplicates | `sentence-transformers/all-MiniLM-L6-v2` | Cosine similarity + Location gating + Geodesic |
| Module 4: Priority | `priority/priority_classifier.joblib` | Multi-feature risk tabular model |
| Module 5: Vision | `computer_vision/weights/best.pt` | Ultralytics YOLO 4-class detector |

---

## 10. Known Limitations & Future Roadmap

1. **Priority Model Baseline**: The current priority classifier is trained on a small synthetic benchmark dataset (n=30). It accurately codifies the rule-weight logic for SIH prototypes, but should be updated with empirical municipal SLA turnaround logs for production.
2. **Text Location Matching**: The standalone duplicate detector uses token-overlap Jaccard similarity for text location strings. In production, always pair it with the GPS Geodesic clustering engine (`gps_cluster.py`) for sub-100m physical clustering.
3. **Computer Vision Lighting**: YOLO detection performs best in daylight or lighted environments; extreme darkness or heavy motion blur may reduce confidence.
