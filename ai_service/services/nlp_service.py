"""
Socio-Sphere NLP Complaint Classification Service
Hierarchical Classifier:
- Level 1: Domain Classification (9 governance domains)
- Level 2: Civic Issue Subclassification (when Domain == "Civic Complaints")
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import joblib
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).resolve().parent.parent

DOMAIN_CLASSIFIER_PATH = BASE_DIR / "models" / "nlp" / "complaint_classifier.joblib"
DOMAIN_LABEL_ENCODER_PATH = BASE_DIR / "models" / "nlp" / "label_encoder.joblib"

CIVIC_CLASSIFIER_PATH = BASE_DIR / "models" / "civic_issue" / "civic_classifier.joblib"
CIVIC_LABEL_ENCODER_PATH = BASE_DIR / "models" / "civic_issue" / "civic_label_encoder.joblib"

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CIVIC_DOMAIN_KEY = "Civic Complaints"

_encoder: Optional[SentenceTransformer] = None
_domain_clf = None
_domain_encoder = None
_civic_clf = None
_civic_encoder = None


def get_embedding_model() -> SentenceTransformer:
    global _encoder
    if _encoder is None:
        _encoder = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _encoder


def load_nlp_models() -> Tuple[SentenceTransformer, Any, Any, Any, Any]:
    global _encoder, _domain_clf, _domain_encoder, _civic_clf, _civic_encoder

    encoder = get_embedding_model()

    if _domain_clf is None:
        if not DOMAIN_CLASSIFIER_PATH.exists():
            raise FileNotFoundError(f"Domain classifier missing at {DOMAIN_CLASSIFIER_PATH}")
        _domain_clf = joblib.load(DOMAIN_CLASSIFIER_PATH)

    if _domain_encoder is None:
        if not DOMAIN_LABEL_ENCODER_PATH.exists():
            raise FileNotFoundError(f"Domain label encoder missing at {DOMAIN_LABEL_ENCODER_PATH}")
        _domain_encoder = joblib.load(DOMAIN_LABEL_ENCODER_PATH)

    if _civic_clf is None and CIVIC_CLASSIFIER_PATH.exists():
        _civic_clf = joblib.load(CIVIC_CLASSIFIER_PATH)

    if _civic_encoder is None and CIVIC_LABEL_ENCODER_PATH.exists():
        _civic_encoder = joblib.load(CIVIC_LABEL_ENCODER_PATH)

    return encoder, _domain_clf, _domain_encoder, _civic_clf, _civic_encoder


def classify_complaint_text(text: str) -> Dict[str, Any]:
    if not text or not text.strip():
        return {
            "text": "",
            "domain": "Civic Complaints",
            "domain_confidence": 0.5,
            "domain_confidence_percent": 50.0,
            "domain_rankings": [],
            "civic_issue": None,
            "civic_confidence": None,
            "civic_confidence_percent": None,
            "civic_rankings": []
        }

    encoder, domain_clf, domain_enc, civic_clf, civic_enc = load_nlp_models()

    embeddings = encoder.encode([text], normalize_embeddings=True)

    # Level 1: Domain Classification
    domain_probs = domain_clf.predict_proba(embeddings)[0]
    domain_ranked = domain_probs.argsort()[::-1]
    top_domain_idx = domain_ranked[0]
    top_domain = domain_enc.inverse_transform([top_domain_idx])[0]
    top_domain_conf = float(domain_probs[top_domain_idx])

    domain_ranks = []
    for idx in domain_ranked:
        label = domain_enc.inverse_transform([idx])[0]
        domain_ranks.append({
            "category": str(label),
            "confidence": round(float(domain_probs[idx]), 4),
            "confidence_percent": round(float(domain_probs[idx]) * 100, 2)
        })

    result: Dict[str, Any] = {
        "text": text,
        "domain": str(top_domain),
        "domain_confidence": round(top_domain_conf, 4),
        "domain_confidence_percent": round(top_domain_conf * 100, 2),
        "domain_rankings": domain_ranks[:3],
        "civic_issue": None,
        "civic_confidence": None,
        "civic_confidence_percent": None,
        "civic_rankings": []
    }

    # Level 2: Civic Issue Subclassification
    if top_domain == CIVIC_DOMAIN_KEY and civic_clf is not None and civic_enc is not None:
        civic_probs = civic_clf.predict_proba(embeddings)[0]
        civic_ranked = civic_probs.argsort()[::-1]
        top_civic_idx = civic_ranked[0]
        top_civic = civic_enc.inverse_transform([top_civic_idx])[0]
        top_civic_conf = float(civic_probs[top_civic_idx])

        civic_ranks = []
        for idx in civic_ranked:
            label = civic_enc.inverse_transform([idx])[0]
            civic_ranks.append({
                "issue": str(label),
                "confidence": round(float(civic_probs[idx]), 4),
                "confidence_percent": round(float(civic_probs[idx]) * 100, 2)
            })

        result["civic_issue"] = str(top_civic)
        result["civic_confidence"] = round(top_civic_conf, 4)
        result["civic_confidence_percent"] = round(top_civic_conf * 100, 2)
        result["civic_rankings"] = civic_ranks

    return result
