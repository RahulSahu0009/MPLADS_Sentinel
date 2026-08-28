"""
predict.py
Unified Production Inference API Contract for the MERN Backend.
Orchestrates frozen ML artifacts, Rule Engine, Duplicate Engine, and Risk Aggregator.
"""
import datetime
from typing import Dict, Any, List

# Importing frozen components (Assuming standard imports from your project structure)
# from phase3.feature_transformer import FeatureTransformer
# from phase4.isolation_forest import MLAnomalyDetector
# from phase4.rule_engine import DeterministicRuleEngine
from phase4.duplicate_engine import DuplicateEngine, DuplicateStatus
from phase4.risk_aggregator import calculate_final_risk

def analyze_project_risk(target_project: Dict[str, Any], candidate_peers: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Master inference pipeline. 
    Accepts raw JSON from MERN, returns unified Risk Profile JSON.
    """
    project_id = target_project.get("project_id", "UNKNOWN")
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"

    # ---------------------------------------------------------
    # 1. DQ & Feature Transformation (Phase 3.1)
    # ---------------------------------------------------------
    # In production, this loads scaler.joblib & encoder.joblib
    # transformed_features = FeatureTransformer.transform(target_project)
    
    # ---------------------------------------------------------
    # 2. ML Anomaly Detection (Phase 4.1)
    # ---------------------------------------------------------
    # ml_result = MLAnomalyDetector.predict(transformed_features)
    # Mocking frozen deterministic ML normalization for API contract purposes
    ml_base_score = 45.5  # Placeholder for actual deterministic ML score output
    ml_payload = {
        "status": "NORMAL" if ml_base_score < 75 else "ANOMALY",
        "normalized_score": ml_base_score
    }

    # ---------------------------------------------------------
    # 3. Deterministic Business Rules (Phase 4.2)
    # ---------------------------------------------------------
    # rules_output = DeterministicRuleEngine.evaluate(target_project)
    # Mocking rule output
    rules_payload = [
        {"rule_id": "PROG-01", "status": "TRIGGERED", "severity": "CRITICAL", "detail": "Financial progress > Physical progress"}
    ]

    # ---------------------------------------------------------
    # 4. Duplicate Detection (Phase 4.3)
    # ---------------------------------------------------------
    duplicate_payload = {"status": DuplicateStatus.NO_MATCH.value}
    
    # Evaluate against all provided peers in the administrative block
    for peer in candidate_peers:
        if peer.get("project_id") == project_id:
            continue
        
        dup_res = DuplicateEngine.evaluate_pair(target_project, peer)
        if dup_res.status == DuplicateStatus.DUPLICATE_DETECTED:
            duplicate_payload = {
                "status": dup_res.status.value,
                "matched_project_id": peer.get("project_id", "UNKNOWN"),
                "pathway": dup_res.reason_code,
                "details": dup_res.details
            }
            break  # Fast fail on first confirmed collision

    # ---------------------------------------------------------
    # 5. Risk Aggregation (Phase 4.4)
    # ---------------------------------------------------------
    agg_result = calculate_final_risk(
        ml_normalized_score=ml_payload["normalized_score"],
        rules_results=rules_payload,
        duplicate_status=duplicate_payload["status"]
    )

    # ---------------------------------------------------------
    # 6. Unified JSON Response Contract
    # ---------------------------------------------------------
    return {
        "project_id": project_id,
        "risk_score": agg_result["risk_score"],
        "risk_band": agg_result["risk_band"],
        "assessment_timestamp": timestamp,
        "aggregation": agg_result["aggregation"],
        "engines": {
            "isolation_forest": ml_payload,
            "rules": rules_payload,
            "duplicate": duplicate_payload
        },
        "risk_drivers": agg_result["risk_drivers"]
    }