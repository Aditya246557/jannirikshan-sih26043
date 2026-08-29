"""
Socio-Sphere GPS Complaint Clustering
Groups complaints when:
1. Issue type is the same
2. Geographic distance is within configured radius (default 100m)
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any, Dict, List, Union

import pandas as pd
from geopy.distance import geodesic

MODULE_DIR = Path(__file__).resolve().parent
DEFAULT_GPS_FILE = MODULE_DIR / "complaints_gps.csv"


def distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    return geodesic((lat1, lon1), (lat2, lon2)).meters


def build_clusters(df: pd.DataFrame, radius_meters: float = 100.0) -> List[List[int]]:
    visited: set[int] = set()
    clusters: List[List[int]] = []

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

    raw_clusters = build_clusters(df, radius_meters)
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


def main() -> None:
    parser = argparse.ArgumentParser(description="Socio-Sphere GPS Complaint Clustering")
    parser.add_argument("--input", default=str(DEFAULT_GPS_FILE), help="Path to input CSV with GPS complaints")
    parser.add_argument("--radius", type=float, default=100.0, help="Clustering radius in meters (default 100.0)")
    parser.add_argument("--output", help="Optional output CSV path")
    args = parser.parse_args()

    print(f"Loading GPS complaints from: {args.input}")
    clusters = cluster_complaints(args.input, radius_meters=args.radius)

    print("\nSocio-Sphere GPS Clustering Results")
    print("=" * 60)
    print(f"Total Clusters Formed: {len(clusters)} (Radius: {args.radius}m)")
    print("-" * 60)
    for c in clusters:
        print(f"Cluster #{c['cluster_id']} | Issue: {c['issue_type']} | Size: {c['cluster_size']} | Center: ({c['center_latitude']}, {c['center_longitude']}) | IDs: {c['complaint_ids']}")
    print("=" * 60)

    if args.output:
        rows = []
        for c in clusters:
            for item in c["complaints"]:
                rows.append({
                    "cluster_id": c["cluster_id"],
                    "cluster_size": c["cluster_size"],
                    "cluster_center_lat": c["center_latitude"],
                    "cluster_center_lon": c["center_longitude"],
                    **item
                })
        pd.DataFrame(rows).to_csv(args.output, index=False)
        print(f"Results saved to: {args.output}")


if __name__ == "__main__":
    main()
