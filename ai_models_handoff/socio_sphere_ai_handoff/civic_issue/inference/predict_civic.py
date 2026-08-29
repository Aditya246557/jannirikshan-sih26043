"""
Socio-Sphere Civic Issue Subclassification Module
Standalone classifier for Civic Complaints domain:
Classes: Pothole, Fallen Tree, Broken Street Light, Garbage
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import joblib
from sentence_transformers import SentenceTransformer

MODULE_DIR = Path(__file__).resolve().parent.parent

CIVIC_CLASSIFIER_PATH = MODULE_DIR / "civic_classifier.joblib"
CIVIC_LABEL_ENCODER_PATH = MODULE_DIR / "civic_label_encoder.joblib"

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_encoder: Optional[SentenceTransformer] = None
_civic_clf = None
_civic_encoder = None


def load_civic_models() -> Tuple[SentenceTransformer, Any, Any]:
    global _encoder, _civic_clf, _civic_encoder

    if _encoder is None:
        _encoder = SentenceTransformer(EMBEDDING_MODEL_NAME)

    if _civic_clf is None:
        if not CIVIC_CLASSIFIER_PATH.exists():
            raise FileNotFoundError(f"Civic classifier missing at {CIVIC_CLASSIFIER_PATH}")
        _civic_clf = joblib.load(CIVIC_CLASSIFIER_PATH)

    if _civic_encoder is None:
        if not CIVIC_LABEL_ENCODER_PATH.exists():
            raise FileNotFoundError(f"Civic label encoder missing at {CIVIC_LABEL_ENCODER_PATH}")
        _civic_encoder = joblib.load(CIVIC_LABEL_ENCODER_PATH)

    return _encoder, _civic_clf, _civic_encoder


def predict_civic_issue(text: str) -> Dict[str, Any]:
    encoder, civic_clf, civic_enc = load_civic_models()

    embeddings = encoder.encode([text], normalize_embeddings=True)
    probs = civic_clf.predict_proba(embeddings)[0]
    ranked = probs.argsort()[::-1]
    top_idx = ranked[0]
    top_label = civic_enc.inverse_transform([top_idx])[0]
    top_conf = float(probs[top_idx])

    rankings = []
    for idx in ranked:
        label = civic_enc.inverse_transform([idx])[0]
        rankings.append({
            "issue": str(label),
            "confidence": round(float(probs[idx]), 4),
            "confidence_percent": round(float(probs[idx]) * 100, 2)
        })

    return {
        "text": text,
        "civic_issue": str(top_label),
        "confidence": round(top_conf, 4),
        "confidence_percent": round(top_conf * 100, 2),
        "rankings": rankings
    }


def main():
    parser = argparse.ArgumentParser(description="Socio-Sphere Civic Issue Subclassifier")
    parser.add_argument("--text", required=True, help="Civic complaint text")
    args = parser.parse_args()

    res = predict_civic_issue(args.text)

    print("\nSocio-Sphere Civic Issue Subclassification")
    print("=" * 55)
    print(f"Complaint   : {res['text']}")
    print(f"Civic Issue : {res['civic_issue']} ({res['confidence_percent']}%)")
    print("\nAll Classes:")
    for i, r in enumerate(res['rankings'], 1):
        print(f"  #{i} {r['issue']}: {r['confidence_percent']}%")
    print("=" * 55)


if __name__ == "__main__":
    main()
