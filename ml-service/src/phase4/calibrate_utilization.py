"""
calibrate_utilization.py
Phase 4.2A Calibration Script for UTIL-01.
Observational analysis of normal training project lifecycle progress vs. fund utilization.
Zero leakage: Calibrated strictly on normal training records using proven metadata and raw financials.
"""
import os
import json
import hashlib
import numpy as np
import pandas as pd

def compute_file_sha256(filepath: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def run_calibration():
    print("="*70)
    print("📈 PHASE 4.2A: UTIL-01 LIFECYCLE vs. UTILIZATION CALIBRATION (TRAIN SET)")
    print("="*70)

    # 1. Path Resolution
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    proc_dir = os.path.join(root_dir, "data", "processed")
    artifacts_dir = os.path.join(root_dir, "artifacts")
    raw_csv_path = os.path.join(root_dir, "data", "raw", "synthetic_projects_v1.0.csv")
    manifest_path = os.path.join(artifacts_dir, "manifest.json")

    train_meta_path = os.path.join(proc_dir, "eval_meta_train.parquet")
    train_ml_path = os.path.join(proc_dir, "X_train_ml.parquet")

    for path, name in [
        (train_meta_path, "Train Metadata"), 
        (train_ml_path, "Train ML Matrix"), 
        (raw_csv_path, "Raw Dataset"), 
        (manifest_path, "Manifest")
    ]:
        if not os.path.exists(path):
            raise FileNotFoundError(f"CRITICAL PROVENANCE FAILURE: {name} missing at {path}. FAIL CLOSED.")

    # 2. Cryptographic Verification
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    actual_raw_sha256 = compute_file_sha256(raw_csv_path)
    if actual_raw_sha256 != manifest.get("dataset_sha256"):
        raise ValueError("CRITICAL PROVENANCE FAILURE: Raw dataset hash mismatch during calibration. FAIL CLOSED.")
    print("✅ Cryptographic Manifest Verified.")

    # 3. Load Datasets and Features
    df_meta_train = pd.read_parquet(train_meta_path)
    df_ml_train = pd.read_parquet(train_ml_path)
    df_raw = pd.read_csv(raw_csv_path)

    # 4. Strict 1:1 ID alignment
    pid_col_meta = next((c for c in ['project_id', 'MP_ID', 'mp_id'] if c in df_meta_train.columns or df_meta_train.index.name == c), None)
    pid_col_raw = next((c for c in ['project_id', 'MP_ID', 'mp_id'] if c in df_raw.columns), None)

    if not pid_col_meta or not pid_col_raw:
        raise ValueError("CRITICAL: project_id column not found for strict alignment. FAIL CLOSED.")

    # Combine metadata and ML features
    df_train_combined = pd.concat([df_meta_train, df_ml_train], axis=1)

    # Merge with raw financials
    df_train_full = pd.merge(
        df_train_combined,
        df_raw,
        left_on=df_meta_train.index.name if df_meta_train.index.name else pid_col_meta,
        right_on=pid_col_raw,
        how='inner',
        suffixes=('_meta', '_raw')
    )

    # 5. STRICTLY FILTER FOR NORMAL TRAINING RECORDS ONLY (Zero anomaly leakage)
    anomaly_col = next((c for c in ['is_injected_anomaly_meta', 'is_injected_anomaly_raw', 'is_injected_anomaly', 'anomaly'] if c in df_train_full.columns), None)
    if not anomaly_col:
        raise KeyError(f"CRITICAL: Anomaly indicator column not found in calibration dataframe. Available columns: {list(df_train_full.columns)}")

    normal_train = df_train_full[df_train_full[anomaly_col] == 0].copy()
    print(f"✅ Filtered normal training calibration population ({len(normal_train)} projects) using column '{anomaly_col}'.")

    # 6. Compute Lifecycle Progress (L) and Utilization (U)
    required_fields = ['expenditure', 'sanctioned_amount', 'elapsed_duration_days', 'expected_duration_days']
    for field in required_fields:
        if field not in normal_train.columns:
            raise KeyError(f"Required field '{field}' missing from calibration dataframe.")

    normal_train['lifecycle_progress'] = normal_train['elapsed_duration_days'] / normal_train['expected_duration_days'].replace(0, np.nan)
    normal_train['utilization_pct'] = (normal_train['expenditure'] / normal_train['sanctioned_amount'].replace(0, np.nan)) * 100.0

    # Clean NaNs/Infs
    normal_train = normal_train.dropna(subset=['lifecycle_progress', 'utilization_pct'])
    normal_train = normal_train[np.isfinite(normal_train['lifecycle_progress']) & np.isfinite(normal_train['utilization_pct'])]

    # 7. Define Lifecycle Milestone Buckets for Analysis
    bins = [-np.inf, 0.10, 0.25, 0.50, 0.75, 0.90, 1.00, np.inf]
    labels = ["<10%", "10%-25%", "25%-50%", "50%-75%", "75%-90%", "90%-100%", "100%+"]
    
    normal_train['lifecycle_bucket'] = pd.cut(normal_train['lifecycle_progress'], bins=bins, labels=labels)

    print("\n" + "="*75)
    print("📊 EMPIRICAL UTILIZATION DISTRIBUTION BY LIFECYCLE (NORMAL TRAIN SET)")
    print("="*75)
    print(f"{'Lifecycle Bucket':<15} | {'Count':<6} | {'Min':<6} | {'Q25':<6} | {'Median':<6} | {'Q75':<6} | {'Max':<6} | {'IQR':<6}")
    print("-" * 75)

    calibration_results = {}

    for label in labels:
        subset = normal_train[normal_train['lifecycle_bucket'] == label]['utilization_pct']
        count = len(subset)
        if count == 0:
            print(f"{label:<15} | {0:<6} | {'N/A':<6}")
            continue
        
        min_v = subset.min()
        q25 = subset.quantile(0.25)
        median = subset.median()
        q75 = subset.quantile(0.75)
        max_v = subset.max()
        iqr = q75 - q25

        calibration_results[label] = {
            "count": int(count),
            "min": float(min_v),
            "q25": float(q25),
            "median": float(median),
            "q75": float(q75),
            "max": float(max_v),
            "iqr": float(iqr)
        }

        print(f"{label:<15} | {count:<6} | {min_v:6.1f} | {q25:6.1f} | {median:6.1f} | {q75:6.1f} | {max_v:6.1f} | {iqr:6.1f}")

    print("="*75)

    # 8. Monotonicity check
    medians = [calibration_results[l]["median"] for l in labels if l in calibration_results and calibration_results[l]["count"] > 0]
    is_monotonic = all(medians[i] <= medians[i+1] for i in range(len(medians)-1))
    
    print(f"\n🔍 Monotonicity Check: Median utilization increases monotonically across lifecycle: {'🟢 PASSED' if is_monotonic else '🟡 NON-MONOTONIC'}")

    # Save calibration report securely into artifacts
    calib_output_path = os.path.join(artifacts_dir, "utilization_calibration_report.json")
    with open(calib_output_path, 'w') as f:
        json.dump(calibration_results, f, indent=4)
    print(f"📄 Calibration report securely written to: {calib_output_path}")
    print("="*70)

if __name__ == "__main__":
    run_calibration()