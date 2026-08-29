"""
Socio-Sphere Priority Prediction Module
Predicts complaint/cluster resolution urgency:
Classes: LOW, MEDIUM, HIGH, CRITICAL

Features:
- issue_type: str (e.g., Pothole, Fallen Tree, Broken Street Light, Garbage)
- cluster_size: int (number of bundled citizen complaints)
- severity: int (1 to 5)
- safety_risk: int (1 to 5)
- duration_hours: float (unresolved elapsed time)
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import pandas as pd

MODULE_DIR = Path(__file__).resolve().parent
MODEL_FILE = MODULE_DIR / "priority_classifier.joblib"

_priority_model = None


def load_priority_model():
    global _priority_model
    if _priority_model is None:
        if not MODEL_FILE.exists():
            raise FileNotFoundError(f"Priority model missing at {MODEL_FILE}")
        _priority_model = joblib.load(MODEL_FILE)
    return _priority_model


def predict_priority(
    issue_type: str,
    cluster_size: int,
    severity: int,
    safety_risk: int,
    duration_hours: float,
) -> Dict[str, Any]:
    model = load_priority_model()

    input_df = pd.DataFrame([{
        "issue_type": issue_type,
        "cluster_size": int(cluster_size),
        "severity": int(severity),
        "safety_risk": int(safety_risk),
        "duration_hours": float(duration_hours),
    }])

    prediction = model.predict(input_df)[0]
    probabilities = model.predict_proba(input_df)[0]
    classes = model.classes_

    prob_map = {
        str(cls): round(float(prob), 4)
        for cls, prob in zip(classes, probabilities)
    }

    confidence = prob_map[str(prediction)]

    return {
        "issue_type": issue_type,
        "cluster_size": cluster_size,
        "severity": severity,
        "safety_risk": safety_risk,
        "duration_hours": duration_hours,
        "priority": str(prediction),
        "confidence": confidence,
        "confidence_percent": round(confidence * 100, 2),
        "probability_distribution": prob_map,
    }


def main():
    parser = argparse.ArgumentParser(description="Socio-Sphere Priority Prediction")
    parser.add_argument("--issue", required=True, help="Issue type (e.g. Pothole, Garbage, Fallen Tree)")
    parser.add_argument("--cluster-size", type=int, required=True, help="Number of grouped complaints")
    parser.add_argument("--severity", type=int, required=True, choices=[1, 2, 3, 4, 5], help="Severity (1-5)")
    parser.add_argument("--safety-risk", type=int, required=True, choices=[1, 2, 3, 4, 5], help="Safety risk (1-5)")
    parser.add_argument("--duration-hours", type=float, required=True, help="Unresolved elapsed hours")

    args = parser.parse_args()

    res = predict_priority(
        issue_type=args.issue,
        cluster_size=args.cluster_size,
        severity=args.severity,
        safety_risk=args.safety_risk,
        duration_hours=args.duration_hours,
    )

    print("\nSocio-Sphere Priority Prediction")
    print("=" * 55)
    print(f"Issue         : {res['issue_type']}")
    print(f"Cluster Size  : {res['cluster_size']}")
    print(f"Severity      : {res['severity']}/5")
    print(f"Safety Risk   : {res['safety_risk']}/5")
    print(f"Duration      : {res['duration_hours']} hours")
    print("-" * 55)
    print(f"Priority      : {res['priority']}")
    print(f"Confidence    : {res['confidence_percent']}%")
    print("\nProbability Distribution:")
    for prio, prob in sorted(res['probability_distribution'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {prio:<10}: {prob * 100:.2f}%")
    print("=" * 55)


if __name__ == "__main__":
    main()
