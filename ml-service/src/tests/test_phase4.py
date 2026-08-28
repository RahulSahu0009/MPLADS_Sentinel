import numpy as np
import pandas as pd
import pytest
import json
import hashlib
import os

from phase4.thresholding import ThresholdManager
from phase4.rules import RuleEngine, GROUND_TRUTH_COLS
from phase4.run_experiments import preflight_manifest_audit
from phase4.evaluation import Evaluator

# 1. Parameterized GT Firewall Test
@pytest.mark.parametrize("forbidden_col", list(GROUND_TRUTH_COLS))
def test_ground_truth_firewall(forbidden_col):
    engine = RuleEngine({})
    df = pd.DataFrame({'project_id': [1], forbidden_col: [1]})
    with pytest.raises(ValueError, match="FATAL: Ground truth columns detected"):
        engine._assert_no_ground_truth(df)

# 2. Rule Engine Input Contract
def test_rule_engine_missing_columns():
    engine = RuleEngine({})
    df_obs = pd.DataFrame({'project_id': [1]}) # Missing expenditure, etc.
    df_snap = pd.DataFrame({'mp_id': ['M1'], 'mp_cumulative_expenditure': [0], 'allocated_amount': [1e7], 'snapshot_date': ['2026-08-24']})
    with pytest.raises(ValueError, match="RULE INPUT CONTRACT VIOLATION: Missing observable columns"):
        engine.evaluate(df_obs, df_snap)

# 3. Rule Engine MP Snapshot Metadata Validation
def test_rule_engine_snapshot_metadata():
    engine = RuleEngine({'reference_date': '2026-08-24'})
    df_obs = pd.DataFrame({'project_id': [1], 'expenditure': [0], 'sanctioned_amount': [1e5], 'payment_count': [0], 'days_overdue': [0], 'physical_progress_pct': [0], 'mp_id': ['M1']})
    
    # Missing snapshot_date
    df_snap1 = pd.DataFrame({'mp_id': ['M1'], 'mp_cumulative_expenditure': [0], 'allocated_amount': [1e7]})
    with pytest.raises(ValueError, match="Missing snapshot columns"):
        engine.evaluate(df_obs, df_snap1)
        
    # Mismatched snapshot_date
    df_snap2 = pd.DataFrame({'mp_id': ['M1'], 'mp_cumulative_expenditure': [0], 'allocated_amount': [1e7], 'snapshot_date': ['2025-01-01']})
    with pytest.raises(ValueError, match="snapshot_date does not match operational reference_date"):
        engine.evaluate(df_obs, df_snap2)

# 4. Threshold Inference Validation
def test_threshold_manager_validation():
    mgr = ThresholdManager()
    with pytest.raises(ValueError, match="strictly between 0 and 1"):
        mgr.fit(np.array([10, 20]), alpha=1.5, experiment_id="test")
        
    mgr.fit(np.array([10, 20, 30, 40]), 0.5, "test")
    with pytest.raises(ValueError, match="non-finite"):
        mgr.predict_alerts(np.array([10.0, np.nan, 20.0]))
    with pytest.raises(ValueError, match="empty"):
        mgr.predict_alerts(np.array([]))

# 5. Manifest Preflight Audit with Raw Hash Checking
def test_manifest_raw_dataset_hash(tmp_path):
    manifest_path = tmp_path / "manifest.json"
    raw_csv_path = tmp_path / "dummy_raw.csv"
    
    # Create dummy raw file
    raw_csv_path.write_text("dummy_data")
    import hashlib
    actual_hash = hashlib.sha256(b"dummy_data").hexdigest()
    
    valid_manifest = {
        "dataset_sha256": actual_hash, "dataset_version": "1.0", "pipeline_version": "1.0", "feature_schema_hash": "123",
        "train_row_count": 2, "test_row_count": 2, "train_mp_count": 1, "test_mp_count": 1, 
        "mp_overlap": 0, "random_seed": 42, "reference_date": "2026-08-24"
    }
    
    with open(manifest_path, 'w') as f:
        json.dump(valid_manifest, f)
        
    df_train = pd.DataFrame({'mp_id': ['M1', 'M1']})
    df_test = pd.DataFrame({'mp_id': ['M2', 'M2']})
    
    # Pass: Correct hash
    preflight_manifest_audit(str(manifest_path), df_train, df_test, str(raw_csv_path))
    
    # Fail: Modified raw file
    raw_csv_path.write_text("modified_data")
    with pytest.raises(ValueError, match="Raw dataset SHA256 mismatch"):
        preflight_manifest_audit(str(manifest_path), df_train, df_test, str(raw_csv_path))

# 6. B Diagnostic vs Operational Threshold Integrity
def test_b_diagnostic_vs_operational():
    mgr = ThresholdManager()
    scores = np.linspace(0, 100, 1000) 
    mgr.fit_oracle_clean(scores, 0.10, "B", "operational")
    op_thresh = mgr.threshold_value
    mgr.fit_oracle_clean(scores, 0.01, "B", "diagnostic")
    diag_thresh = mgr.threshold_value
    assert diag_thresh > op_thresh

# 7. Model Score Direction
def test_model_score_direction():
    from phase4.model import AnomalyDetectorIF
    X_train = np.random.RandomState(42).normal(0, 1, (100, 1))
    X_test = np.array([[0.0], [1000.0]])
    det = AnomalyDetectorIF(random_state=42).fit(X_train)
    if_score, ml_score = det.predict_scores(X_test)
    np.testing.assert_allclose(ml_score, -if_score)
    assert ml_score[1] > ml_score[0]

# 8. P@K Tiny Array Handling
def test_pak_tiny_array():
    y_true = np.array([1, 0])
    ml_scores = np.array([0.9, 0.1])
    metrics = Evaluator.compute_metrics(y_true, ml_scores, np.array([1, 0]), [1])
    assert metrics['Precision@1%'] == 1.0