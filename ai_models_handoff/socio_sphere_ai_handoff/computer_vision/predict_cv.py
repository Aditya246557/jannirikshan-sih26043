"""
Socio-Sphere Computer Vision Civic Defect Detector
Architecture: Custom Ultralytics YOLO (Nano Edge Architecture)
Classes: pothole, garbage, broken_street_light, fallen_tree
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from PIL import Image
from ultralytics import YOLO

MODULE_DIR = Path(__file__).resolve().parent
MODEL_PATH = MODULE_DIR / "weights" / "best.pt"

CLASS_NAMES = {
    0: "pothole",
    1: "garbage",
    2: "broken_street_light",
    3: "fallen_tree",
}

_cv_model: Optional[YOLO] = None


def load_cv_model() -> YOLO:
    global _cv_model
    if _cv_model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Trained CV model missing at: {MODEL_PATH}")
        _cv_model = YOLO(str(MODEL_PATH))
    return _cv_model


def detect_civic_issue(
    image_input: Union[str, Path, Image.Image],
    conf_threshold: float = 0.25,
) -> Dict[str, Any]:
    model = load_cv_model()
    results = model.predict(source=image_input, conf=conf_threshold, verbose=False)

    detections: List[Dict[str, Any]] = []

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
                    "y2": round(y2, 2),
                }
            })

    has_issue = len(detections) > 0
    top_detection = max(detections, key=lambda d: d["confidence"]) if has_issue else None

    return {
        "valid_civic_issue": has_issue,
        "detections_count": len(detections),
        "top_category": top_detection["class_name"] if top_detection else None,
        "top_confidence_percent": top_detection["confidence_percent"] if top_detection else 0.0,
        "detections": detections,
    }


def main():
    parser = argparse.ArgumentParser(description="Socio-Sphere Computer Vision Civic Defect Detector")
    parser.add_argument("--image", required=True, help="Path to complaint image")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold (default 0.25)")
    args = parser.parse_args()

    res = detect_civic_issue(args.image, conf_threshold=args.conf)

    print("\nSocio-Sphere Computer Vision Detection")
    print("=" * 60)
    print(f"Image       : {args.image}")
    print(f"Valid Issue : {res['valid_civic_issue']}")
    print(f"Detections  : {res['detections_count']}")
    if res['top_category']:
        print(f"Top Issue   : {res['top_category']} ({res['top_confidence_percent']}%)")
    print("-" * 60)
    for i, d in enumerate(res['detections'], 1):
        bb = d['bounding_box']
        print(f"  #{i} {d['class_name']}: {d['confidence_percent']}% | Box: [{bb['x1']}, {bb['y1']}, {bb['x2']}, {bb['y2']}]")
    print("=" * 60)


if __name__ == "__main__":
    main()
