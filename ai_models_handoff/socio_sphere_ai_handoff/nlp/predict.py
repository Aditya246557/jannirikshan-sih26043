"""
Socio-Sphere NLP Complaint Classification Module
Hierarchical Classifier:
- Level 1: Domain Classification (9 categories)
- Level 2: Civic Issue Subclassification (when Domain == "Civic Complaints")
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import joblib
from sentence_transformers import SentenceTransformer

MODULE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = MODULE_DIR.parent

DOMAIN_CLASSIFIER_PATH = MODULE_DIR / "complaint_classifier.joblib"
DOMAIN_LABEL_ENCODER_PATH = MODULE_DIR / "label_encoder.joblib"

CIVIC_CLASSIFIER_PATH = PROJECT_DIR / "civic_issue" / "civic_classifier.joblib"
CIVIC_LABEL_ENCODER_PATH = PROJECT_DIR / "civic_issue" / "civic_label_encoder.joblib"

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CIVIC_DOMAIN_KEY = "Civic Complaints"

_encoder: Optional[SentenceTransformer] = None
_domain_clf = None
_domain_encoder = None
_civic_clf = None
_civic_encoder = None


def load_models() -> Tuple[SentenceTransformer, Any, Any, Any, Any]:
    global _encoder, _domain_clf, _domain_encoder, _civic_clf, _civic_encoder

    if _encoder is None:
        _encoder = SentenceTransformer(EMBEDDING_MODEL_NAME)

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

    return _encoder, _domain_clf, _domain_encoder, _civic_clf, _civic_encoder


def classify_complaint(text: str) -> Dict[str, Any]:
    encoder, domain_clf, domain_enc, civic_clf, civic_enc = load_models()

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


def main():
    parser = argparse.ArgumentParser(description="Socio-Sphere NLP Complaint Classifier")
    parser.add_argument("--text", required=True, help="Citizen complaint text")
    args = parser.parse_args()

    res = classify_complaint(args.text)

    print("\nSocio-Sphere NLP Classification")
    print("=" * 55)
    print(f"Complaint   : {res['text']}")
    print(f"Domain      : {res['domain']} ({res['domain_confidence_percent']}%)")
    print("\nTop 3 Domains:")
    for i, r in enumerate(res['domain_rankings'], 1):
        print(f"  #{i} {r['category']}: {r['confidence_percent']}%")
    if res["civic_issue"]:
        print(f"\nCivic Issue : {res['civic_issue']} ({res['civic_confidence_percent']}%)")
        print("Top Civic Issues:")
        for i, r in enumerate(res['civic_rankings'], 1):
            print(f"  #{i} {r['issue']}: {r['confidence_percent']}%")
    else:
        print("\nCivic Issue : Not applicable (Domain is not Civic Complaints)")
    print("=" * 55)


if __name__ == "__main__":
    main()
