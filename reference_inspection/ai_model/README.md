# Adhikar AI - Final Trained 4-Class Civic Detection Model

This package contains the final trained custom deep learning model and AI inference/moderation service for **Adhikar AI (SIH PS 26043)**.

---

## Model Overview & Classes

The model was trained on a civic infrastructure dataset covering 4 core urban issue domains:

| Class ID | Class Name | Target Civic Issue | Category Mapping |
|---|---|---|---|
| 0 | pothole | Road potholes, asphalt cracks, craters | Roads & Infrastructure |
| 1 | garbage | Overflowing trash, open dump sites, debris | Sanitation & Waste |
| 2 | broken_street_light | Damaged poles, broken lamp fixtures | Electrical & Safety |
| 3 | fallen_tree | Fallen trees, uprooted trunks blocking roads | Environment & Emergency |

---

## Training Performance & Benchmark Metrics

- Architecture: Ultralytics YOLO26n / YOLOv8n (nano architecture for ultra-fast edge inference)
- Input Resolution: 640 x 640
- Total Epochs: 20 (Fully completed)
- Mean Average Precision (mAP@50): 82.06%
- Peak Precision: 84.78%
- Recall: 76.02%
- mAP@50-95: 48.57%
- Inference Latency: ~15ms - 40ms per frame on CPU/GPU

---

## Real-Time 2-Stage Guardrail & Moderation System

Included in ai_service/main.py is the 2-stage verification pipeline:
1. Safety & Abuse Filter:
   - Dynamic Flesh-Exposure / Skin-Tone Masking to reject NSFW/explicit content.
   - Person / Selfie Detection filter to reject human portraits and non-civic selfies.
2. Civic Domain Detector (best.pt):
   - Detects civic defects with bounding boxes, confidence, and severity calculation.
   - Returns rejection if no civic issue is found in uploaded evidence.

---

## Quickstart & Inference

### 1. Python Direct Inference
`python
from ultralytics import YOLO

# Load the trained model
model = YOLO("weights/best.pt")

# Predict on an image
results = model.predict(source="test_image.jpg", conf=0.35, imgsz=640)

for r in results:
    for box in r.boxes:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        print(f"Detected: {model.names[cls_id]} with confidence {conf:.2%}")
`

### 2. Run the FastAPI Microservice
`ash
pip install -r requirements.txt
uvicorn ai_service.main:app --host 0.0.0.0 --port 8000
`
- Interactive Swagger UI: http://localhost:8000/docs
- Endpoints:
  - POST /predict (Full detection + bounding boxes)
  - POST /validate-image (Real-time civic & safety verification)
  - GET /health (Model health check)
