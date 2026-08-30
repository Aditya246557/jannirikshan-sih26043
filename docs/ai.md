# AI Intelligence Engine Architecture — FastAPI & PyTorch

## 1. Overview
The JanNirikshan AI Microservice is a high-performance Python 3.11 service running on FastAPI and Uvicorn.

## 2. Models & Weights
- **YOLOv8 Weights**: Stored at `ai_service/weights/best.pt` (5.38 MB).
- **Supported Detection Classes**:
  1. `pothole` (Roads & Infrastructure / PWD)
  2. `garbage` (Sanitation & Waste / Municipal Waste)
  3. `broken_street_light` (Electrical & Public Lighting / Electricity Board)
  4. `fallen_tree` (Environment & Emergency Clearance / Urban Forestry)
- **NLP Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors).
- **Classifiers**: Scikit-Learn `joblib` pipelines for 9-domain classification and 4-tier tabular priority prediction (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).

## 3. Core Services
```
ai_service/services/
├── vision_service.py         # Ultralytics YOLOv8 inference & multi-stage safety filters
├── nlp_service.py            # SentenceTransformer domain classification
├── civic_issue_service.py    # Civic defect subclassification
├── duplicate_service.py      # Semantic cosine similarity & 100m geodesic clustering
├── priority_service.py       # Tabular multi-factor priority estimation
└── university_match_service.py # Hybrid AI university recommendation engine
```
