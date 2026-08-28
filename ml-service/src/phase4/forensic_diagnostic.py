"""
forensic_diagnostic.py
Strict observational forensic autopsy of Phase 4.1 (Experiment C).
Enforces immutable chain-of-custody, mandatory ID alignment, strict schema hashing,
and produces unbiased feature-level distributions (Model Space & Business Space).
NO REFITTING ALLOWED. SCORING PARITY ENFORCED.
"""
import os
import json
import joblib
import hashlib
import numpy as np
import pandas as pd

def compute_file_sha256(filepath: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def get_stats(series):
    """Calculates the 5-number summary + mean for a pandas Series, strict JSON compliance (None for NaNs)."""
    s = series.dropna()
    if len(s) == 0:
        return {"min": None, "q25": None, "median": None, "q75": None, "max": None, "mean": None}
    return {
        "min": float(s.min()) if not pd.isna(s.min()) else None,
        "q25": float(s.quantile(0.25)) if not pd.isna(s.quantile(0.25)) else None,
        "median": float(s.median()) if not pd.isna(s.median()) else None,
        "q75": float(s.quantile(0.75)) if not pd.isna(s.quantile(0.75)) else None,
        "max": float(s.max()) if not pd.isna(s.max()) else None,
        "mean": float(s.mean()) if not pd.isna(s.mean()) else None
    }

def run_forensic_analysis():
    print("="*70)
    print("🔬 PHASE 4.1 FORENSIC AUTOPSY: STRICT OBSERVATIONAL ANALYSIS")
    print("="*70)

    # 1. Path Resolution
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    proc_dir = os.path.join(root_dir, "data/processed")
    artifacts_dir = os.path.join(root_dir, "artifacts")
    
    model_path = os.path.join(artifacts_dir, "isolation_forest.joblib")
    schema_path = os.path.join(artifacts_dir, "feature_schema.json")
    thresh_path = os.path.join(artifacts_dir, "threshold.json")
    manifest_path = os.path.join(artifacts_dir, "manifest.json")
    raw_csv_path = os.path.join(root_dir, "data", "raw", "synthetic_projects_v1.0.csv")

    for path, name in [(model_path, "Exp C Model Artifact"), (schema_path, "Feature Schema"), 
                       (thresh_path, "Exp C Threshold"), (manifest_path, "Manifest")]:
        if not os.path.exists(path):
            raise FileNotFoundError(f"CRITICAL PROVENANCE FAILURE: {name} missing at {path}. FAIL CLOSED.")

    # 2. Strict Cryptographic Manifest & Schema Validation
    print("Verifying Cryptographic Chain-of-Custody...")
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)

    if not os.path.exists(raw_csv_path):
        raise FileNotFoundError("CRITICAL PROVENANCE FAILURE: Raw dataset unavailable for hashing. FAIL CLOSED.")
    
    actual_raw_sha256 = compute_file_sha256(raw_csv_path)
    if actual_raw_sha256 != manifest.get("dataset_sha256"):
        raise ValueError(f"CRITICAL PROVENANCE FAILURE: Raw dataset hash mismatch.\nExpected: {manifest.get('dataset_sha256')}\nGot: {actual_raw_sha256}")

    actual_schema_hash = compute_file_sha256(schema_path)
    if actual_schema_hash != manifest.get("feature_schema_hash"):
        raise ValueError(f"CRITICAL PROVENANCE FAILURE: Schema hash mismatch.\nExpected: {manifest.get('feature_schema_hash')}\nGot: {actual_schema_hash}")

    print("✅ Cryptographic Manifest & Provenance Verified.")

    # 3. Load Schema
    with open(schema_path, 'r') as f:
        schema = json.load(f)
    feature_names = schema.get("features", [])
    if not feature_names:
        raise ValueError("CRITICAL: Feature schema is empty. FAIL CLOSED.")

    # 4. Validate Threshold & Experiment C Provenance
    with open(thresh_path, 'r') as f:
        thresh_meta = json.load(f)
    
    threshold_value = thresh_meta.get('threshold_value')
    exp_id = thresh_meta.get('experiment_id', '')
    if threshold_value is None:
        raise ValueError("CRITICAL: Threshold value missing. FAIL CLOSED.")
    if exp_id != "Exp_C":
        raise ValueError(f"CRITICAL PROVENANCE FAILURE: Threshold artifact belongs to '{exp_id}', NOT Experiment C. FAIL CLOSED.")
    
    scoring_method = "negative_decision_function"
    print(f"✅ Exp C Threshold Verified: {threshold_value:.6f} | Scoring Method: {scoring_method}")

    # 5. Load Data & Assert Strict Alignment
    print("Loading test matrices and evaluating strict ID alignment...")
    df_x_test_ml = pd.read_parquet(os.path.join(proc_dir, "X_test_ml.parquet"))
    df_meta = pd.read_parquet(os.path.join(proc_dir, "eval_meta_test.parquet"))
    
    if len(df_x_test_ml) != manifest.get("test_row_count", len(df_meta)):
        raise ValueError("CRITICAL: X_test rows do not match manifest test_row_count. FAIL CLOSED.")
    
    pid_col_x = next((c for c in ['project_id', 'MP_ID', 'mp_id'] if c in df_x_test_ml.columns or df_x_test_ml.index.name == c), None)
    pid_col_meta = next((c for c in ['project_id', 'MP_ID', 'mp_id'] if c in df_meta.columns or df_meta.index.name == c), None)

    # THE FIX: Apply the authorized index equality fallback
    if not pid_col_x or not pid_col_meta:
        if not df_x_test_ml.index.equals(df_meta.index):
            raise ValueError("CRITICAL ALIGNMENT FAILURE: test matrix and metadata indices differ. FAIL CLOSED.")
        print("✅ Strict index equality verified as fallback ID alignment.")
    else:
        s_x = df_x_test_ml.index if df_x_test_ml.index.name == pid_col_x else df_x_test_ml[pid_col_x]
        s_m = df_meta.index if df_meta.index.name == pid_col_meta else df_meta[pid_col_meta]
        
        if len(set(s_x)) != len(s_x):
            raise ValueError("CRITICAL ALIGNMENT FAILURE: Duplicate project_ids found in X_test. FAIL CLOSED.")
        if not s_x.equals(s_m):
            raise ValueError("CRITICAL ALIGNMENT FAILURE: project_ids do not strictly match 1:1 in value and sequence. FAIL CLOSED.")
        print("✅ Strict Project ID 1:1 alignment verified.")

    # 6. Feature Space Alignment Assertions
    missing_feats = set(feature_names) - set(df_x_test_ml.columns)
    if missing_feats:
        raise ValueError(f"CRITICAL FEATURE SCHEMA MISMATCH: X_test is missing columns: {missing_feats}")
    
    X_test_matrix = df_x_test_ml[feature_names].values
    if not np.isfinite(X_test_matrix).all():
        raise ValueError("CRITICAL DATA FAILURE: NaN or Inf detected in X_test_matrix. FAIL CLOSED.")

    business_space_available = False
    bus_features = []
    bus_path = os.path.join(proc_dir, "X_test_engineered.parquet")
    if os.path.exists(bus_path):
        df_x_test_bus = pd.read_parquet(bus_path)
        business_space_available = True
        bus_features = [c for c in df_x_test_bus.columns if c not in [pid_col_x, 'project_id', 'MP_ID', 'mp_id']]
        print(f"✅ Business-space matrix located with {len(bus_features)} raw features.")
    
    # 7. Load Exact Model, Assert Model Architecture, and Score
    print("Loading Frozen Model Artifact & Generating Scores...")
    model = joblib.load(model_path)
    
    if len(feature_names) != getattr(model, 'n_features_in_', len(feature_names)):
        raise ValueError(f"CRITICAL MODEL MISMATCH: Schema has {len(feature_names)} features, but model expects {model.n_features_in_}. FAIL CLOSED.")

    # EXACT EXPERIMENT C SCORING METHOD:
    raw_if_score = model.decision_function(X_test_matrix)
    ml_scores_test = -raw_if_score
    alerts_test = (ml_scores_test >= threshold_value).astype(int)
    
    df_meta['ml_score'] = ml_scores_test
    df_meta['alert'] = alerts_test

    # 8. Define Typologies
    target_typologies = [
        'low_fund_utilization', 'duplicate_work', 'financial_physical_mismatch',
        'project_delay', 'cost_overrun'
    ]
    
    def get_typology_mask(df, t_type):
        if t_type in ['cost_overrun', 'project_delay']:
            return df['anomaly_type'].isin([t_type, 'combined_anomaly'])
        return df['anomaly_type'] == t_type

    # 9. Extract Statistics
    print("Computing feature-level statistics for Normal, TP, and FN groups...")
    csv_rows = []
    report_json = {
        "provenance": {
            "model_path": model_path,
            "threshold_value": threshold_value,
            "scoring_method": scoring_method,
            "experiment_id": exp_id,
            "support_definition": "cost_overrun and project_delay strictly include combined_anomaly per FROZEN_V1_ANOMALY_MAPPING."
        },
        "typologies": {}
    }

    normal_mask = df_meta['is_injected_anomaly'] == 0
    normal_indices = df_meta[normal_mask].index

    for t_type in target_typologies:
        t_mask = get_typology_mask(df_meta, t_type)
        subset = df_meta[t_mask]
        support = len(subset)
        if support == 0: continue
            
        tp_mask = t_mask & (df_meta['is_injected_anomaly'] == 1) & (df_meta['alert'] == 1)
        fn_mask = t_mask & (df_meta['is_injected_anomaly'] == 1) & (df_meta['alert'] == 0)

        tp_indices = df_meta[tp_mask].index
        fn_indices = df_meta[fn_mask].index

        report_json["typologies"][t_type] = {
            "support": support,
            "TP": len(tp_indices),
            "FN": len(fn_indices),
            "recall": float(len(tp_indices) / support) if support > 0 else 0.0,
            "scores": {
                "normal": get_stats(df_meta.loc[normal_indices, 'ml_score']),
                "tp": get_stats(df_meta.loc[tp_indices, 'ml_score']),
                "fn": get_stats(df_meta.loc[fn_indices, 'ml_score'])
            },
            "model_space_features": {},
            "business_space_features": {}
        }

        def process_features(feature_list, df_src, space_label, json_key):
            for feat in feature_list:
                if feat not in df_src.columns: continue
                n_series, tp_series, fn_series = df_src.loc[normal_indices, feat], df_src.loc[tp_indices, feat], df_src.loc[fn_indices, feat]
                
                n_stats, tp_stats, fn_stats = get_stats(n_series), get_stats(tp_series), get_stats(fn_series)

                tp_fn_diff = tp_stats["median"] - fn_stats["median"] if tp_stats["median"] is not None and fn_stats["median"] is not None else None
                fn_n_diff = fn_stats["median"] - n_stats["median"] if fn_stats["median"] is not None and n_stats["median"] is not None else None

                report_json["typologies"][t_type][json_key][feat] = {
                    "normal": n_stats, "tp": tp_stats, "fn": fn_stats,
                    "deltas": {"TP_minus_FN_median": tp_fn_diff, "FN_minus_Normal_median": fn_n_diff}
                }

                csv_rows.append({
                    "typology": t_type, "space": space_label, "feature": feat,
                    "normal_median": n_stats["median"], "tp_median": tp_stats["median"], "fn_median": fn_stats["median"],
                    "TP_minus_FN_median": tp_fn_diff, "FN_minus_Normal_median": fn_n_diff
                })

        process_features(feature_names, df_x_test_ml, "model_space", "model_space_features")
        
        if business_space_available:
            process_features(bus_features, df_x_test_bus, "business_space", "business_space_features")

    # 10. Save Outputs
    json_path = os.path.join(artifacts_dir, "forensic_error_analysis.json")
    csv_path = os.path.join(artifacts_dir, "forensic_feature_comparison.csv")
    
    with open(json_path, 'w') as f:
        json.dump(report_json, f, indent=4)
    pd.DataFrame(csv_rows).to_csv(csv_path, index=False)

    print(f"\n✅ SUCCESS: Forensic reports securely written.")
    print(f"📄 JSON: {json_path}\n📊 CSV: {csv_path}")
    print("="*70)

if __name__ == "__main__":
    run_forensic_analysis()