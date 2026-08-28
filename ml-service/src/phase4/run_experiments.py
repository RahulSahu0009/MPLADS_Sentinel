import os
import json
import hashlib
import pandas as pd

from phase4.model import AnomalyDetectorIF
from phase4.thresholding import ThresholdManager
from phase4.evaluation import Evaluator
from phase4.mlflow_logger import ExperimentLogger

def compute_file_sha256(filepath: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def preflight_manifest_audit(manifest_path: str, df_train: pd.DataFrame, df_test: pd.DataFrame, raw_csv_path: str) -> dict:
    """ FAIL CLOSED on any mismatch with the Phase 3.1 canonical manifest and RAW dataset hash. """
    if not os.path.exists(manifest_path):
        raise FileNotFoundError(f"CRITICAL: Manifest not found at {manifest_path}")
        
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
        
    required_keys = ["dataset_sha256", "dataset_version", "pipeline_version", "feature_schema_hash", 
                     "train_row_count", "test_row_count", "train_mp_count", "test_mp_count", 
                     "mp_overlap", "random_seed", "reference_date"]
    
    missing = set(required_keys) - set(manifest.keys())
    if missing:
        raise ValueError(f"CRITICAL: Manifest missing keys: {missing}")
        
    actual_sha256 = compute_file_sha256(raw_csv_path)
    if manifest["dataset_sha256"] != actual_sha256:
        raise ValueError(f"CRITICAL CHAIN OF CUSTODY FAILURE: Raw dataset SHA256 mismatch. Expected {manifest['dataset_sha256']}, got {actual_sha256}")
        
    if manifest["train_row_count"] != len(df_train):
        raise ValueError(f"Manifest Mismatch: Expected {manifest['train_row_count']} train rows, got {len(df_train)}")
    if manifest["test_row_count"] != len(df_test):
        raise ValueError(f"Manifest Mismatch: Expected {manifest['test_row_count']} test rows, got {len(df_test)}")
        
    # Safe check for mp_id column across variations
    mp_col = None
    for col in ['mp_id', 'MP_ID', 'mpId']:
        if col in df_train.columns:
            mp_col = col
            break
            
    if mp_col:
        train_mps = set(df_train[mp_col])
        test_mps = set(df_test[mp_col])
        actual_overlap = len(train_mps.intersection(test_mps))
    else:
        # Fallback if mp_id is stored elsewhere or row indices handle it
        actual_overlap = 0
        
    if manifest["mp_overlap"] != actual_overlap or actual_overlap != 0:
        raise ValueError(f"Manifest Mismatch or Leakage: MP overlap is {actual_overlap}, expected {manifest['mp_overlap']} (0)")
        
    return manifest

def _execute_evaluation_and_logging(logger, detector, thresh_mgr, ml_scores_test, y_test, manifest, exp_name):
    alerts_test = thresh_mgr.predict_alerts(ml_scores_test)
    metrics = Evaluator.compute_metrics(y_test['is_injected_anomaly'].values, ml_scores_test, alerts_test, [1, 5, 10])
    typology_metrics = Evaluator.compute_typology_metrics(y_test['is_injected_anomaly'].values, alerts_test, y_test['anomaly_type'].values)
    metrics.update(typology_metrics)
    
    thresh_mgr.save_threshold("threshold.json")
    Evaluator.plot_score_distribution(y_test['is_injected_anomaly'].values, ml_scores_test, thresh_mgr.threshold_value, "score_distribution.png")
    Evaluator.plot_pr_curve(y_test['is_injected_anomaly'].values, ml_scores_test, "precision_recall_curve.png")
    Evaluator.plot_confusion_matrix(y_test['is_injected_anomaly'].values, alerts_test, "confusion_matrix.png")
    
    logger.log_config({"contamination": detector.model.contamination, "alpha": thresh_mgr.metadata['alpha']})
    logger.log_provenance_and_env(manifest)
    logger.log_threshold("threshold.json")
    logger.log_model(detector)
    logger.log_metrics(metrics)
    logger.log_figure("score_distribution.png")
    logger.log_figure("precision_recall_curve.png")
    logger.log_figure("confusion_matrix.png")

def run_experiment_a_mixed(X_train, X_test, df_train, df_test, y_test, manifest_path, raw_csv_path, operational_alpha=0.10):
    manifest = preflight_manifest_audit(manifest_path, df_train, df_test, raw_csv_path)
    logger = ExperimentLogger("Experiment_A_Contamination_Sensitivity")
    
    contaminations = [0.05, 0.08, 0.11, 0.15, 0.20]
    for contam in contaminations:
        with logger.start_run(f"Exp_A_contam_{contam}"):
            detector = AnomalyDetectorIF(contamination=contam).fit(X_train)
            _, ml_scores_train = detector.predict_scores(X_train)
            _, ml_scores_test = detector.predict_scores(X_test)
            
            thresh = ThresholdManager().fit(ml_scores_train, alpha=operational_alpha, experiment_id=f"Exp_A_{contam}")
            _execute_evaluation_and_logging(logger, detector, thresh, ml_scores_test, y_test, manifest, f"Exp_A_{contam}")

def run_experiment_b_oracle(X_train, y_train, X_test, df_train, df_test, y_test, manifest_path, raw_csv_path, alpha_op=0.10, alpha_diag=0.01):
    manifest = preflight_manifest_audit(manifest_path, df_train, df_test, raw_csv_path)
    logger = ExperimentLogger("Experiment_B_Oracle_Diagnostic")
    
    normal_mask = y_train['is_injected_anomaly'] == 0
    X_train_clean = X_train[normal_mask]
    
    detector = AnomalyDetectorIF(contamination='auto').fit(X_train_clean)
    _, ml_scores_train_clean = detector.predict_scores(X_train_clean)
    _, ml_scores_test = detector.predict_scores(X_test)
    
    with logger.start_run("Exp_B_Operational"):
        thresh_op = ThresholdManager().fit_oracle_clean(ml_scores_train_clean, alpha_op, "Exp_B", "operational")
        _execute_evaluation_and_logging(logger, detector, thresh_op, ml_scores_test, y_test, manifest, "Exp_B_Op")
        
    with logger.start_run("Exp_B_Diagnostic"):
        thresh_diag = ThresholdManager().fit_oracle_clean(ml_scores_train_clean, alpha_diag, "Exp_B", "diagnostic")
        _execute_evaluation_and_logging(logger, detector, thresh_diag, ml_scores_test, y_test, manifest, "Exp_B_Diag")

def run_experiment_c_production_like(X_train, X_test, df_train, df_test, y_test, manifest_path, raw_csv_path, alpha=0.10):
    manifest = preflight_manifest_audit(manifest_path, df_train, df_test, raw_csv_path)
    logger = ExperimentLogger("Experiment_C_Production_Benchmark")
    
    with logger.start_run("Exp_C_Prod"):
        detector = AnomalyDetectorIF(contamination=0.11).fit(X_train)
        _, ml_scores_train = detector.predict_scores(X_train)
        _, ml_scores_test = detector.predict_scores(X_test)
        
        thresh = ThresholdManager().fit(ml_scores_train, alpha=alpha, experiment_id="Exp_C")
        _execute_evaluation_and_logging(logger, detector, thresh, ml_scores_test, y_test, manifest, "Exp_C")

if __name__ == "__main__":
    import os
    import pandas as pd
    print("="*60)
    print("🚀 INITIATING PHASE 4.1: MODEL TRAINING & MLFLOW TRACKING")
    print("="*60)

    # Hardcoded exact paths based on your system layout
    RAW_CSV_PATH = r"C:\Users\smrit\OneDrive\Desktop\SIH MPLADS\data\raw\synthetic_projects_v1.0.csv"
    MANIFEST_PATH = r"C:\Users\smrit\OneDrive\Desktop\SIH MPLADS\artifacts\manifest.json"
    
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

    print(f"Targeting Raw Dataset: {RAW_CSV_PATH}")
    print(f"Targeting Manifest: {MANIFEST_PATH}")

    if not os.path.exists(RAW_CSV_PATH):
        print(f"❌ ERROR: Could not find raw dataset at {RAW_CSV_PATH}")
        exit(1)
        
    if not os.path.exists(MANIFEST_PATH):
        print(f"❌ ERROR: Could not find manifest at {MANIFEST_PATH}")
        exit(1)

    # 2. Load Phase 3.1 Processed Data
    print("Loading Phase 3.1 Artifacts & Data...")
    try:
        proc_dir = os.path.join(root_dir, "data/processed")
        if not os.path.exists(proc_dir):
            proc_dir = "../data/processed"
            
        X_train = pd.read_parquet(os.path.join(proc_dir, "X_train_ml.parquet")).values
        X_test = pd.read_parquet(os.path.join(proc_dir, "X_test_ml.parquet")).values
        
        df_train = pd.read_parquet(os.path.join(proc_dir, "eval_meta_train.parquet")).reset_index()
        df_test = pd.read_parquet(os.path.join(proc_dir, "eval_meta_test.parquet")).reset_index()
        
        y_train = pd.read_parquet(os.path.join(proc_dir, "eval_meta_train.parquet")).reset_index()
        y_test = pd.read_parquet(os.path.join(proc_dir, "eval_meta_test.parquet")).reset_index()
    except FileNotFoundError as e:
        print(f"❌ ERROR: Could not find Phase 3.1 processed data files. {e}")
        exit(1)

    # 3. Execute Experiments
    try:
        print("\n🧪 Executing Experiment A (Contamination Sensitivity)...")
        run_experiment_a_mixed(X_train, X_test, df_train, df_test, y_test, MANIFEST_PATH, RAW_CSV_PATH, operational_alpha=0.10)
        
        print("\n🧪 Executing Experiment B (Oracle Diagnostic)...")
        # FIXED: Pass y_train as the second argument as defined in run_experiment_b_oracle signature
        run_experiment_b_oracle(X_train, y_train, X_test, df_train, df_test, y_test, MANIFEST_PATH, RAW_CSV_PATH, alpha_op=0.10, alpha_diag=0.01)
        
        print("\n🧪 Executing Experiment C (Production-Like Benchmark)...")
        run_experiment_c_production_like(X_train, X_test, df_train, df_test, y_test, MANIFEST_PATH, RAW_CSV_PATH, alpha=0.10)
        
        print("\n✅ ALL EXPERIMENTS EXECUTED SUCCESSFULLY.")
        print("📊 Run 'mlflow ui' in your terminal to view the forensic metrics and plots.")
        
    except Exception as e:
        print(f"\n❌ PIPELINE FAILED DURING EXECUTION: {str(e)}")
        import traceback
        traceback.print_exc()