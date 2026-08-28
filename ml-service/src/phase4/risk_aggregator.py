"""
risk_aggregator.py
Phase 4.4 Hierarchical Risk Aggregator.
Applies governance floors in strict priority order and returns a unified risk profile.
"""
from typing import Any, Dict, List


def _assign_band(score: float) -> str:
    if score >= 85:
        return "CRITICAL"
    elif score >= 65:
        return "HIGH"
    elif score >= 40:
        return "MEDIUM"
    return "LOW"


def calculate_final_risk(
    ml_normalized_score: float,
    rules_results: List[Dict[str, Any]],
    duplicate_status: str,
) -> Dict[str, Any]:
    """
    Applies governance floors in strict priority order:
      1. Duplicate Detected  -> risk_score = 100 (CRITICAL override)
      2. PROG-01 Triggered   -> risk_score = max(ml_score, 85)
      3. UTIL-01 Triggered   -> risk_score = max(ml_score, 75)
      4. Baseline            -> risk_score = ml_normalized_score
    """
    triggered_rules = {
        r["rule_id"] for r in rules_results if r.get("status") == "TRIGGERED"
    }

    risk_score = float(ml_normalized_score)
    governance_applied = "BASELINE_ML"
    risk_drivers: List[str] = []

    # Priority 1: Duplicate override (absolute ceiling)
    if duplicate_status == "DUPLICATE_DETECTED":
        risk_score = 100.0
        governance_applied = "DUPLICATE_OVERRIDE"
        risk_drivers.append("Duplicate project detected — absolute risk ceiling applied.")

    # Priority 2: PROG-01 floor
    elif "PROG-01" in triggered_rules:
        risk_score = max(risk_score, 85.0)
        governance_applied = "PROG_01_FLOOR"
        risk_drivers.append("PROG-01: Financial progress exceeds physical progress by >20%.")

    # Priority 3: UTIL-01 floor
    elif "UTIL-01" in triggered_rules:
        risk_score = max(risk_score, 75.0)
        governance_applied = "UTIL_01_FLOOR"
        risk_drivers.append("UTIL-01: Fund utilization below lifecycle-adjusted threshold.")

    if not risk_drivers:
        risk_drivers.append("No governance override; score driven by ML anomaly model.")

    risk_score = round(risk_score, 2)

    return {
        "risk_score": risk_score,
        "risk_band": _assign_band(risk_score),
        "aggregation": {
            "ml_input_score": round(float(ml_normalized_score), 2),
            "governance_applied": governance_applied,
            "triggered_rules": list(triggered_rules),
            "duplicate_status": duplicate_status,
        },
        "risk_drivers": risk_drivers,
    }
