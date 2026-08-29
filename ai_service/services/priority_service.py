"""
Socio-Sphere Priority Prediction Service
Classes: LOW, MEDIUM, HIGH, CRITICAL
Features:
- issue_type: str (e.g., Pothole, Fallen Tree, Broken Street Light, Garbage)
- cluster_size: int (bundled complaints in GPS cluster)
- severity: int (1 to 5)
- safety_risk: int (1 to 5)
- duration_hours: float (elapsed unresolved time)
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_FILE = BASE_DIR / "models" / "priority" / "priority_classifier.joblib"

_priority_model = None


def load_priority_model():
    global _priority_model
    if _priority_model is None:
        if not MODEL_FILE.exists():
            raise FileNotFoundError(f"Priority model missing at {MODEL_FILE}")
        _priority_model = joblib.load(MODEL_FILE)
    return _priority_model


def get_default_severity(issue: str) -> int:
    mapping = {
        "pothole": 3,
        "fallen tree": 4,
        "fallen_tree": 4,
        "broken street light": 3,
        "broken_street_light": 3,
        "garbage": 2,
    }
    return mapping.get(str(issue).strip().lower(), 2)


def get_default_safety_risk(issue: str) -> int:
    mapping = {
        "pothole": 4,
        "fallen tree": 5,
        "fallen_tree": 5,
        "broken street light": 4,
        "broken_street_light": 4,
        "garbage": 2,
    }
    return mapping.get(str(issue).strip().lower(), 2)


def get_default_duration_hours(issue: str) -> float:
    mapping = {
        "pothole": 24.0,
        "fallen tree": 6.0,
        "fallen_tree": 6.0,
        "broken street light": 24.0,
        "broken_street_light": 24.0,
        "garbage": 48.0,
    }
    return mapping.get(str(issue).strip().lower(), 24.0)


def predict_priority_score(
    issue_type: str,
    cluster_size: int = 1,
    severity: Optional[int] = None,
    safety_risk: Optional[int] = None,
    duration_hours: Optional[float] = None,
) -> Dict[str, Any]:
    norm_issue = str(issue_type).strip() if issue_type else "Pothole"
    eff_sev = severity if severity is not None and 1 <= severity <= 5 else get_default_severity(norm_issue)
    eff_risk = safety_risk if safety_risk is not None and 1 <= safety_risk <= 5 else get_default_safety_risk(norm_issue)
    eff_dur = float(duration_hours) if duration_hours is not None and duration_hours >= 0 else get_default_duration_hours(norm_issue)
    eff_cluster = max(1, int(cluster_size)) if cluster_size is not None else 1

    model = load_priority_model()

    input_df = pd.DataFrame([{
        "issue_type": norm_issue,
        "cluster_size": eff_cluster,
        "severity": eff_sev,
        "safety_risk": eff_risk,
        "duration_hours": eff_dur,
    }])

    prediction = model.predict(input_df)[0]
    probabilities = model.predict_proba(input_df)[0]
    classes = model.classes_

    prob_map = {
        str(cls): round(float(prob), 4)
        for cls, prob in zip(classes, probabilities)
    }

    confidence = prob_map.get(str(prediction), 0.5)

    return {
        "issue_type": norm_issue,
        "cluster_size": eff_cluster,
        "severity": eff_sev,
        "safety_risk": eff_risk,
        "duration_hours": eff_dur,
        "priority": str(prediction),
        "confidence": confidence,
        "confidence_percent": round(confidence * 100, 2),
        "probability_distribution": prob_map,
    }
