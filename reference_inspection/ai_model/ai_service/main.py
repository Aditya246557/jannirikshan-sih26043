from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import numpy as np
import io


app = FastAPI(
    title="Adhikar AI Service",
    description="AI-powered civic issue detection and automated content moderation service",
    version="2.0.0"
)

# Enable CORS for local development & frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Paths to models
BASE_DIR = Path(__file__).resolve().parent.parent
CIVIC_MODEL_PATH = Path(r"D:\new-ai-model\runs\detect\adhikar-final-4class\weights\best.pt")
SAFETY_MODEL_PATH = BASE_DIR / "yolov8n.pt"

if not CIVIC_MODEL_PATH.exists():
    raise FileNotFoundError(f"Civic Model not found at: {CIVIC_MODEL_PATH}")

# Load models on startup
civic_model = YOLO(str(CIVIC_MODEL_PATH))
safety_model = YOLO(str(SAFETY_MODEL_PATH)) if SAFETY_MODEL_PATH.exists() else None

CLASS_NAMES = {
    0: "pothole",
    1: "garbage",
    2: "broken_street_light",
    3: "fallen_tree"
}


def analyze_image_safety(image: Image.Image, img_width: int, img_height: int):
    """
    Guardrail checks:
    1. Blank / solid color check
    2. Nudity / excessive skin-tone check
    3. Person / selfie dominance check
    """
    img_np = np.array(image.convert("RGB"))

    # 1. Check for blank or corrupted image
    if img_np.std() < 12.0:
        return {
            "safe": False,
            "rejection_reason": "BLANK_OR_CORRUPTED_IMAGE",
            "message": "The uploaded photo appears blank, solid black/white, or corrupted. Please upload a clear photo."
        }

    # 2. Rule-based skin tone analysis (RGB color bounds)
    r, g, b = img_np[:, :, 0], img_np[:, :, 1], img_np[:, :, 2]
    skin_mask = (
        (r > 95) & (g > 40) & (b > 20) &
        ((r.astype(int) - np.minimum(g, b).astype(int)) > 15) &
        (np.abs(r.astype(int) - g.astype(int)) > 15) &
        (r > g) & (r > b)
    )
    skin_percent = (np.sum(skin_mask) / skin_mask.size) * 100.0

    # High flesh tone ratio (> 42%) indicates potential nudity or full-screen close-up portrait
    if skin_percent > 42.0:
        return {
            "safe": False,
            "rejection_reason": "INAPPROPRIATE_OR_EXCESSIVE_SKIN",
            "message": "⚠️ Image flagged: High skin tone or inappropriate content detected. Please upload an image of the civic issue only."
        }

    # 3. Person / Face / Selfie dominance check using safety base model
    if safety_model is not None:
        try:
            safety_results = safety_model.predict(source=image, conf=0.45, verbose=False)
            total_img_area = img_width * img_height

            for result in safety_results:
                if result.boxes is None:
                    continue
                for box in result.boxes:
                    cls_id = int(box.cls[0].item())
                    # COCO class 0 is 'person'
                    if cls_id == 0:
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        box_area = (x2 - x1) * (y2 - y1)
                        area_ratio = box_area / total_img_area if total_img_area > 0 else 0

                        # If a person occupies > 35% of the frame, it's a selfie or portrait
                        if area_ratio > 0.35:
                            return {
                                "safe": False,
                                "rejection_reason": "SELFIE_OR_PERSON_DETECTED",
                                "message": "⚠️ Selfie or human portrait detected. Please photograph the physical civic issue directly (pothole, garbage, etc.)."
                            }
        except Exception as err:
            # Non-fatal safety check fallback
            pass

    return {
        "safe": True,
        "skin_percent": round(float(skin_percent), 2)
    }


@app.get("/")
def root():
    return {
        "service": "Adhikar AI Service",
        "status": "running",
        "model": "adhikar-final-4class",
        "safety_filter_enabled": True
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
        "safety_filter_active": True,
        "classes": list(CLASS_NAMES.values())
    }


@app.post("/predict")
@app.post("/validate-image")
async def predict_and_validate(file: UploadFile = File(...)):
    # Check file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files (JPG, PNG, WebP) are allowed."
        )

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        width, height = image.size

        # ----------------------------------------------------
        # Stage 1: Safety & Moderation Filter
        # ----------------------------------------------------
        safety_check = analyze_image_safety(image, width, height)
        if not safety_check["safe"]:
            return {
                "success": False,
                "valid": False,
                "status": "REJECTED",
                "rejection_reason": safety_check["rejection_reason"],
                "message": safety_check["message"],
                "filename": file.filename,
                "detections_count": 0,
                "detections": []
            }

        # ----------------------------------------------------
        # Stage 2: Civic Issue YOLO Detection
        # ----------------------------------------------------
        results = civic_model.predict(
            source=image,
            conf=0.25,
            verbose=False
        )

        detections = []

        for result in results:
            if result.boxes is None:
                continue

            for box in result.boxes:
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append({
                    "class_id": class_id,
                    "class_name": CLASS_NAMES.get(class_id, f"class_{class_id}"),
                    "confidence": round(confidence, 4),
                    "confidence_percent": round(confidence * 100, 2),
                    "bounding_box": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2)
                    }
                })

        # ----------------------------------------------------
        # Stage 3: Civic Domain Presence Verification
        # ----------------------------------------------------
        if len(detections) == 0:
            return {
                "success": True,
                "valid": False,
                "status": "REJECTED_NO_CIVIC_ISSUE",
                "rejection_reason": "NO_CIVIC_ISSUE_DETECTED",
                "message": "⚠️ No recognized civic issue (pothole, garbage, streetlight, fallen tree) detected in this photo. Please upload a clear photo of the issue.",
                "filename": file.filename,
                "detections_count": 0,
                "detections": []
            }

        # Successful civic detection
        top_detection = max(detections, key=lambda d: d["confidence"])
        top_name = top_detection["class_name"].replace("_", " ").title()
        top_conf = top_detection["confidence_percent"]

        return {
            "success": True,
            "valid": True,
            "status": "VALID_CIVIC_ISSUE",
            "detected_category": top_detection["class_name"],
            "detected_confidence": top_conf,
            "message": f"✅ Verified Civic Evidence: {top_name} detected ({top_conf}% confidence).",
            "filename": file.filename,
            "detections_count": len(detections),
            "detections": detections
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Image validation failed: {str(e)}"
        )