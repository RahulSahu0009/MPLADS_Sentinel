"""
calibrate_duplicate_rules.py
Phase 4.3C Joint Boundary Calibration for Duplicate Engine.
Performs a grid search over text similarity, financial delta, temporal gap,
and spatial routing pathways, with precision-first governance ranking and zero-FP checks.
"""
import os
import json
import pandas as pd
import numpy as np

def run_joint_calibration():
    print("="*70)
    print("🎯 PHASE 4.3C: JOINT BOUNDARY GRID-SEARCH CALIBRATION")
    print("="*70)

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    report_path = os.path.join(root_dir, "artifacts", "duplicate_pair_discrimination_report.json")

    if not os.path.exists(report_path):
        raise FileNotFoundError("CRITICAL: Pairwise discrimination report missing. Run Phase 4.3B first. FAIL CLOSED.")

    df = pd.read_json(report_path)
    
    is_pos = df['pair_type'] == 'POSITIVE'
    total_pos = is_pos.sum()
    total_neg = (~is_pos).sum()

    print(f"Loaded {len(df)} total pairs ({total_pos} POSITIVE, {total_neg} HARD_NEGATIVE).")

    # Expanded grid search parameters capturing the exact boundary
    text_thresholds = [0.95, 0.98, 1.0]
    amount_thresholds = [1.5, 2.0, 5.0, 10.0]
    date_thresholds = [2.0, 3.0, 5.0, 7.0, 10.0]

    results = []

    for t_thresh in text_thresholds:
        for a_thresh in amount_thresholds:
            for d_thresh in date_thresholds:
                
                core_match = (
                    (df['text_similarity'] >= t_thresh) &
                    (df['amount_difference_pct'] <= a_thresh) &
                    (df['date_gap_days'] <= d_thresh)
                )

                # Path A: Spatial duplicate (same_location = True)
                pred_spatial = core_match & df['same_location']
                
                # Path B: Dual Pathway (Spatial OR Non-Spatial)
                pred_dual = core_match

                for mode_name, pred in [("Spatial_Path_A", pred_spatial), ("Dual_Path_A_and_B", pred_dual)]:
                    tp = (pred & is_pos).sum()
                    fp = (pred & ~is_pos).sum()
                    fn = (~pred & is_pos).sum()
                    tn = (~pred & ~is_pos).sum()

                    recall = tp / total_pos if total_pos > 0 else 0.0
                    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
                    fpr = fp / total_neg if total_neg > 0 else 0.0
                    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

                    results.append({
                        "mode": mode_name,
                        "text_sim_min": t_thresh,
                        "amount_diff_max": a_thresh,
                        "date_gap_max": d_thresh,
                        "recall": round(recall, 4),
                        "precision": round(precision, 4),
                        "fpr": round(fpr, 4),
                        "f1_score": round(f1, 4),
                        "tp": int(tp),
                        "fp": int(fp),
                        "fn": int(fn)
                    })

    df_res = pd.DataFrame(results).sort_values(by="f1_score", ascending=False)

    print("\n" + "="*70)
    print("📊 TOP F1-OPTIMAL CANDIDATES")
    print("="*70)
    print(df_res.head(10).to_string(index=False))
    print("="*70)

    # Precision-first governance ranking
    df_res["precision_recall_balance"] = (
        0.6 * df_res["precision"] +
        0.4 * df_res["recall"]
    )
    print("\n" + "="*70)
    print("🏛️ PRECISION-FIRST GOVERNANCE CANDIDATES")
    print("="*70)
    print(
        df_res
        .sort_values(
            by=["precision", "recall", "f1_score"],
            ascending=False
        )
        .head(10)
        .to_string(index=False)
    )
    print("="*70)

    # Zero-false-positive candidates
    zero_fp = df_res[df_res["fp"] == 0].sort_values(
        by=["recall", "f1_score"],
        ascending=False
    )
    print("\n" + "="*70)
    print("🛡️ ZERO-FALSE-POSITIVE CANDIDATES")
    print("="*70)
    if not zero_fp.empty:
        print(zero_fp.head(10).to_string(index=False))
    else:
        print("No zero-FP candidates found in current grid.")
    print("="*70)

    artifacts_dir = os.path.join(root_dir, "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)
    out_path = os.path.join(artifacts_dir, "duplicate_threshold_calibration_report.json")
    df_res.to_json(out_path, orient="records", indent=4)
    print(f"📄 Threshold calibration report securely written to: {out_path}")
    print("="*70)

if __name__ == "__main__":
    run_joint_calibration()