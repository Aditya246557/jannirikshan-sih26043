"""
Socio-Sphere Duplicate Detection & GPS Clustering Service
- Pairwise: Semantic (all-MiniLM-L6-v2) + Issue type + Location token match + Location gating
- GPS Clustering: Geodesic radius clustering (100m)
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import pandas as pd
from geopy.distance import geodesic
from sentence_transformers import SentenceTransformer

from .nlp_service import get_embedding_model

TEXT_WEIGHT = 0.50
ISSUE_WEIGHT = 0.25
LOCATION_WEIGHT = 0.25

TEXT_THRESHOLD = 0.54
STRONG_LOCATION_THRESHOLD = 0.75
WEAK_LOCATION_THRESHOLD = 0.50
DIFFERENT_LOCATION_MAX_SCORE = 0.60
DUPLICATE_SCORE_THRESHOLD = 0.70


def normalize_text(value: str) -> str:
    if not value:
        return ""
    value = str(value).lower().strip()
    value = value.replace("_", " ")
    value = re.sub(r"[^a-z0-9\s/&-]", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value


def text_similarity(complaint_a: str, complaint_b: str) -> float:
    if not complaint_a or not complaint_b:
        return 0.0
    model = get_embedding_model()
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
    a = normalize_text(issue_a)
    b = normalize_text(issue_b)
    return 1.0 if a == b else 0.0


def location_match(location_a: str, location_b: str) -> float:
    if not location_a or not location_b:
        return 0.0
    a = normalize_text(location_a)
    b = normalize_text(location_b)
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
    lat_a: Optional[float] = None,
    lon_a: Optional[float] = None,
    lat_b: Optional[float] = None,
    lon_b: Optional[float] = None,
) -> Dict[str, Any]:
    text_score = text_similarity(complaint_a, complaint_b)
    issue_score = issue_match(issue_a, issue_b)

    # GPS Distance check if coordinates are provided
    gps_distance_meters = None
    gps_within_100m = False
    if lat_a is not None and lon_a is not None and lat_b is not None and lon_b is not None:
        try:
            gps_distance_meters = round(geodesic((lat_a, lon_a), (lat_b, lon_b)).meters, 2)
            gps_within_100m = gps_distance_meters <= 100.0
        except Exception:
            pass

    location_score = location_match(location_a, location_b)
    if gps_within_100m:
        location_score = 1.0

    location_status = classify_location(location_score)

    base_score = (
        text_score * TEXT_WEIGHT
        + issue_score * ISSUE_WEIGHT
        + location_score * LOCATION_WEIGHT
    )

    # Location Gating Logic
    if location_status == "DIFFERENT" and not gps_within_100m:
        final_score = min(base_score, DIFFERENT_LOCATION_MAX_SCORE)
        decision_reason = "Locations are clearly different; text similarity alone is insufficient."
    elif location_status == "PARTIAL":
        final_score = base_score
        decision_reason = "Locations partially overlap; stronger text similarity required."
    else:
        final_score = base_score
        decision_reason = "Strong location/GPS match supports duplicate detection."

    is_duplicate = False
    if (
        text_score >= TEXT_THRESHOLD
        and issue_score >= 1.0
        and (location_status == "STRONG" or gps_within_100m)
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
        "gps_distance_meters": gps_distance_meters,
        "gps_within_100m": gps_within_100m,
        "base_score": round(base_score, 4),
        "duplicate_score": round(final_score, 4),
        "duplicate_score_percent": round(final_score * 100, 2),
        "is_duplicate": is_duplicate,
        "decision_reason": decision_reason,
    }


def cluster_complaints(
    data: Union[pd.DataFrame, List[Dict[str, Any]], str, Path],
    radius_meters: float = 100.0,
) -> List[Dict[str, Any]]:
    if isinstance(data, (str, Path)):
        df = pd.read_csv(data)
    elif isinstance(data, list):
        df = pd.DataFrame(data)
    else:
        df = data.copy()

    required_cols = {"id", "issue_type", "latitude", "longitude"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    visited: set[int] = set()
    raw_clusters: List[List[int]] = []

    for index in df.index:
        if index in visited:
            continue

        cluster = [index]
        visited.add(index)
        queue = [index]

        while queue:
            current = queue.pop(0)
            current_issue = str(df.loc[current, "issue_type"]).strip().lower()
            current_lat = float(df.loc[current, "latitude"])
            current_lon = float(df.loc[current, "longitude"])

            for candidate in df.index:
                if candidate in visited:
                    continue

                candidate_issue = str(df.loc[candidate, "issue_type"]).strip().lower()
                if current_issue != candidate_issue:
                    continue

                candidate_lat = float(df.loc[candidate, "latitude"])
                candidate_lon = float(df.loc[candidate, "longitude"])

                dist = geodesic((current_lat, current_lon), (candidate_lat, candidate_lon)).meters
                if dist <= radius_meters:
                    visited.add(candidate)
                    cluster.append(candidate)
                    queue.append(candidate)

        raw_clusters.append(cluster)

    cluster_results: List[Dict[str, Any]] = []

    for cluster_id, indices in enumerate(raw_clusters, start=1):
        cluster_df = df.loc[indices]
        issue = str(cluster_df["issue_type"].iloc[0])
        count = len(cluster_df)
        center_lat = float(cluster_df["latitude"].mean())
        center_lon = float(cluster_df["longitude"].mean())
        complaint_ids = [row["id"] for _, row in cluster_df.iterrows()]

        cluster_results.append({
            "cluster_id": cluster_id,
            "issue_type": issue,
            "cluster_size": count,
            "center_latitude": round(center_lat, 6),
            "center_longitude": round(center_lon, 6),
            "complaint_ids": complaint_ids,
            "complaints": cluster_df.to_dict(orient="records")
        })

    return cluster_results
