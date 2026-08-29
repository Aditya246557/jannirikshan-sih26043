"""
Socio-Sphere Integrated Pipeline: GPS Cluster -> Cluster Size -> Priority Prediction
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any, Dict, List, Union

import joblib
import pandas as pd
from geopy.distance import geodesic

MODULE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = MODULE_DIR.parent
DEFAULT_GPS_FILE = PROJECT_DIR / "duplicate_detection" / "complaints_gps.csv"
MODEL_FILE = MODULE_DIR / "priority_classifier.joblib"
RADIUS_METERS = 100.0


def get_default_severity(issue: str) -> int:
    mapping = {
        "pothole": 3,
        "fallen tree": 4,
        "broken street light": 3,
        "garbage": 2,
    }
    return mapping.get(issue.strip().lower(), 2)


def get_default_safety_risk(issue: str) -> int:
    mapping = {
        "pothole": 4,
        "fallen tree": 5,
        "broken street light": 4,
        "garbage": 2,
    }
    return mapping.get(issue.strip().lower(), 2)


def get_default_duration_hours(issue: str) -> float:
    mapping = {
        "pothole": 24.0,
        "fallen tree": 6.0,
        "broken street light": 24.0,
        "garbage": 48.0,
    }
    return mapping.get(issue.strip().lower(), 24.0)


def distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    return geodesic((lat1, lon1), (lat2, lon2)).meters


def build_clusters(df: pd.DataFrame, radius_meters: float = 100.0) -> List[List[int]]:
    visited = set()
    clusters = []

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

                dist = distance_meters(current_lat, current_lon, candidate_lat, candidate_lon)
                if dist <= radius_meters:
                    visited.add(candidate)
                    cluster.append(candidate)
                    queue.append(candidate)

        clusters.append(cluster)

    return clusters


def run_cluster_priority_pipeline(
    data: Union[pd.DataFrame, str, Path],
    radius_meters: float = 100.0,
) -> List[Dict[str, Any]]:
    if isinstance(data, (str, Path)):
        df = pd.read_csv(data)
    else:
        df = data.copy()

    model = joblib.load(MODEL_FILE)
    clusters = build_clusters(df, radius_meters)
    results = []

    for cluster_id, indices in enumerate(clusters, start=1):
        cluster_df = df.loc[indices]
        issue = str(cluster_df["issue_type"].iloc[0])
        cluster_size = len(cluster_df)
        severity = get_default_severity(issue)
        safety_risk = get_default_safety_risk(issue)
        duration_hours = get_default_duration_hours(issue)

        model_input = pd.DataFrame([{
            "issue_type": issue,
            "cluster_size": cluster_size,
            "severity": severity,
            "safety_risk": safety_risk,
            "duration_hours": duration_hours,
        }])

        prediction = model.predict(model_input)[0]
        probabilities = model.predict_proba(model_input)[0]
        prob_map = dict(zip(model.classes_, probabilities))
        confidence = float(prob_map[prediction])

        center_lat = float(cluster_df["latitude"].mean())
        center_lon = float(cluster_df["longitude"].mean())
        complaint_ids = list(cluster_df["id"])

        results.append({
            "cluster_id": cluster_id,
            "issue_type": issue,
            "cluster_size": cluster_size,
            "severity": severity,
            "safety_risk": safety_risk,
            "duration_hours": duration_hours,
            "priority": str(prediction),
            "confidence": round(confidence, 4),
            "confidence_percent": round(confidence * 100, 2),
            "center_latitude": round(center_lat, 6),
            "center_longitude": round(center_lon, 6),
            "complaint_ids": complaint_ids,
        })

    return results


def main():
    parser = argparse.ArgumentParser(description="Socio-Sphere Integrated Cluster -> Priority Pipeline")
    parser.add_argument("--input", default=str(DEFAULT_GPS_FILE), help="GPS complaints CSV")
    parser.add_argument("--radius", type=float, default=100.0, help="Clustering radius in meters")
    args = parser.parse_args()

    print("Socio-Sphere Integrated Cluster -> Priority Pipeline")
    print("=" * 65)
    print(f"Input: {args.input}")

    results = run_cluster_priority_pipeline(args.input, radius_meters=args.radius)

    for r in results:
        print(f"\nCluster #{r['cluster_id']}:")
        print(f"  Issue       : {r['issue_type']}")
        print(f"  Size        : {r['cluster_size']} complaint(s)")
        print(f"  Center      : ({r['center_latitude']}, {r['center_longitude']})")
        print(f"  Priority    : {r['priority']} ({r['confidence_percent']}%)")
        print(f"  IDs         : {r['complaint_ids']}")

    print("\n" + "=" * 65)
    print(f"Processed {len(results)} clusters successfully.")


if __name__ == "__main__":
    main()
