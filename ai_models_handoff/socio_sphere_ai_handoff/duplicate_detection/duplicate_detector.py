"""
Socio-Sphere Hybrid Duplicate Detector
Version 0.2.0

Duplicate detection weights:
    50% semantic text similarity (all-MiniLM-L6-v2)
    25% issue compatibility
    25% location similarity

Location Gating Rule:
    Same issue + high text similarity + clearly different location
    will NOT be classified as duplicate.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

MODULE_DIR = Path(__file__).resolve().parent

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

TEXT_WEIGHT = 0.50
ISSUE_WEIGHT = 0.25
LOCATION_WEIGHT = 0.25

TEXT_THRESHOLD = 0.54
STRONG_LOCATION_THRESHOLD = 0.75
WEAK_LOCATION_THRESHOLD = 0.50
DIFFERENT_LOCATION_MAX_SCORE = 0.60
DUPLICATE_SCORE_THRESHOLD = 0.70

_st_model: Optional[SentenceTransformer] = None


def get_model() -> SentenceTransformer:
    global _st_model
    if _st_model is None:
        _st_model = SentenceTransformer(MODEL_NAME)
    return _st_model


def normalize(value: str) -> str:
    value = str(value).lower().strip()
    value = value.replace("_", " ")
    value = re.sub(r"[^a-z0-9\s/&-]", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value


def text_similarity(complaint_a: str, complaint_b: str) -> float:
    model = get_model()
    embeddings = model.encode(
        [complaint_a, complaint_b],
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    similarity = float(embeddings[0] @ embeddings[1])
    return max(0.0, min(1.0, similarity))


def issue_match(issue_a: str, issue_b: str) -> float:
    if not issue_a or not issue_b:
        return 0.0
    a = normalize(issue_a)
    b = normalize(issue_b)
    return 1.0 if a == b else 0.0


def location_match(location_a: str, location_b: str) -> float:
    if not location_a or not location_b:
        return 0.0
    a = normalize(location_a)
    b = normalize(location_b)
    if a == b:
        return 1.0
    tokens_a = set(a.split())
    tokens_b = set(b.split())
    if not tokens_a or not tokens_b:
        return 0.0
    intersection = tokens_a & tokens_b
    union = tokens_a | tokens_b
    return len(intersection) / len(union)


def classify_location(location_score: float) -> str:
    if location_score >= STRONG_LOCATION_THRESHOLD:
        return "STRONG"
    if location_score >= WEAK_LOCATION_THRESHOLD:
        return "PARTIAL"
    return "DIFFERENT"


def calculate_duplicate_score(
    complaint_a: str,
    complaint_b: str,
    issue_a: str = "",
    issue_b: str = "",
    location_a: str = "",
    location_b: str = "",
) -> Dict[str, Any]:
    text_score = text_similarity(complaint_a, complaint_b)
    issue_score = issue_match(issue_a, issue_b)
    location_score = location_match(location_a, location_b)
    location_status = classify_location(location_score)

    base_score = (
        text_score * TEXT_WEIGHT
        + issue_score * ISSUE_WEIGHT
        + location_score * LOCATION_WEIGHT
    )

    # Location Gating Logic
    if location_status == "DIFFERENT":
        final_score = min(base_score, DIFFERENT_LOCATION_MAX_SCORE)
        decision_reason = "Locations are clearly different; text similarity alone is insufficient."
    elif location_status == "PARTIAL":
        final_score = base_score
        decision_reason = "Locations partially overlap; stronger text similarity required."
    else:
        final_score = base_score
        decision_reason = "Strong location match supports duplicate detection."

    is_duplicate = False
    if (
        text_score >= TEXT_THRESHOLD
        and issue_score >= 1.0
        and location_status == "STRONG"
        and final_score >= DUPLICATE_SCORE_THRESHOLD
    ):
        is_duplicate = True
    elif (
        text_score >= 0.85
        and issue_score >= 1.0
        and location_status == "PARTIAL"
        and final_score >= DUPLICATE_SCORE_THRESHOLD
    ):
        is_duplicate = True

    return {
        "text_similarity": round(text_score, 4),
        "issue_match": round(issue_score, 4),
        "location_match": round(location_score, 4),
        "location_status": location_status,
        "base_score": round(base_score, 4),
        "duplicate_score": round(final_score, 4),
        "duplicate_score_percent": round(final_score * 100, 2),
        "is_duplicate": is_duplicate,
        "decision_reason": decision_reason,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Socio-Sphere Hybrid Duplicate Detector")
    parser.add_argument("--text-a", required=True, help="First complaint text")
    parser.add_argument("--text-b", required=True, help="Second complaint text")
    parser.add_argument("--issue-a", default="", help="Issue type of complaint A")
    parser.add_argument("--issue-b", default="", help="Issue type of complaint B")
    parser.add_argument("--location-a", default="", help="Location of complaint A")
    parser.add_argument("--location-b", default="", help="Location of complaint B")

    args = parser.parse_args()

    res = calculate_duplicate_score(
        complaint_a=args.text_a,
        complaint_b=args.text_b,
        issue_a=args.issue_a,
        issue_b=args.issue_b,
        location_a=args.location_a,
        location_b=args.location_b,
    )

    print("\nSocio-Sphere Hybrid Duplicate Detection")
    print("=" * 60)
    print(f"Complaint A: {args.text_a}")
    print(f"Complaint B: {args.text_b}")
    print(f"Issue A/B  : {args.issue_a} / {args.issue_b}")
    print(f"Location A/B: {args.location_a} / {args.location_b}")
    print("-" * 60)
    print(f"Text Similarity : {res['text_similarity']:.2f}")
    print(f"Issue Match     : {res['issue_match']:.2f}")
    print(f"Location Match  : {res['location_match']:.2f} ({res['location_status']})")
    print(f"Duplicate Score : {res['duplicate_score_percent']:.2f}%")
    print(f"Decision Reason : {res['decision_reason']}")
    print(f"Decision        : {'DUPLICATE / SAME PHYSICAL ISSUE' if res['is_duplicate'] else 'NOT DUPLICATE / SEPARATE ISSUE'}")
    print("=" * 60)


if __name__ == "__main__":
    main()
