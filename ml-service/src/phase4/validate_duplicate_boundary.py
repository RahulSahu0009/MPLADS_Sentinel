"""
validate_duplicate_boundary.py
Phase 4.3D Adversarial Validation for Duplicate Engine.
Exhaustively evaluates the selected candidate policy against all possible
administrative block collisions to detect edge cases, FPs, and structural FNs.
"""
import os
import json
import hashlib
import numpy as np
import pandas as pd
from rapidfuzz import fuzz
from tqdm import tqdm
from itertools import combinations

def compute_file_sha256(filepath: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def normalize_text(series: pd.Series) -> pd.Series:
    return series.fillna("").astype(str).str.lower().str.strip().str.replace(r'\s+', ' ', regex=True)

def run_adversarial_validation():
    print("="*70)
    print("🛡️ PHASE 4.3D: ADVERSARIAL BOUNDARY VALIDATION")
    print("="*70)

    # 1. Provenance & Loading
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    artifacts_dir = os.path.join(root_dir, "artifacts")
    raw_csv_path = os.path.join(root_dir, "data", "raw", "synthetic_projects_v1.0.csv")
    manifest_path = os.path.join(artifacts_dir, "manifest.json")

    if not os.path.exists(raw_csv_path) or not os.path.exists(manifest_path):
        raise FileNotFoundError("CRITICAL: Raw dataset missing. FAIL CLOSED.")

    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    dataset_hash = compute_file_sha256(raw_csv_path)
    if dataset_hash != manifest.get("dataset_sha256"):
        raise ValueError("CRITICAL PROVENANCE FAILURE: Dataset hash mismatch. FAIL CLOSED.")
    
    df = pd.read_csv(raw_csv_path)
    df['clean_desc'] = normalize_text(df['project_description'])
    df['dt_start'] = pd.to_datetime(df['start_date'], errors='coerce')
    df['sanctioned_amount'] = pd.to_numeric(df['sanctioned_amount'], errors='coerce')

    # 2. Exhaustive Blocked Pair Generation (Same Constituency + Work Type)
    print("🔄 Generating ALL exhaustive pairs within candidate blocks (constituency + work_type)...")
    
    pairs = []
    # Using constituency and work_type as the absolute minimum blocking to mimic real-world candidate generation
    blocks = df.groupby(['constituency', 'work_type'])
    
    for _, block in tqdm(blocks, desc="Processing Administrative Blocks"):
        if len(block) < 2:
            continue
        
        idx = block.index.to_numpy()
        for i, j in combinations(idx, 2):
            p1, p2 = df.loc[i], df.loc[j]
            
            # Ground truth label
            g1 = str(p1.get('duplicate_group_id', ''))
            g2 = str(p2.get('duplicate_group_id', ''))
            is_duplicate = (g1 == g2) and (g1 not in ('', 'nan', 'none'))
            
            text_sim = fuzz.ratio(p1['clean_desc'], p2['clean_desc']) / 100.0
            
            amt1, amt2 = p1['sanctioned_amount'], p2['sanctioned_amount']
            amt_diff_pct = abs(amt1 - amt2) / max(amt1, amt2, 1) * 100.0 if pd.notna(amt1) and pd.notna(amt2) else 999.0
            
            d1, d2 = p1['dt_start'], p2['dt_start']
            date_gap = abs((d1 - d2).days) if pd.notna(d1) and pd.notna(d2) else 9999.0
            
            pairs.append({
                "is_duplicate": is_duplicate,
                "text_similarity": text_sim,
                "amount_difference_pct": amt_diff_pct,
                "date_gap_days": date_gap,
                "same_location": bool(p1['location_id'] == p2['location_id'])
            })

    df_pairs = pd.DataFrame(pairs)
    total_pos = df_pairs['is_duplicate'].sum()
    total_neg = (~df_pairs['is_duplicate']).sum()
    print(f"✅ Evaluated {len(df_pairs)} total pairs ({total_pos} Positives, {total_neg} Negatives).")

    # 3. Apply Frozen Policy Candidate (Path A - Spatial)
    # text >= 0.95 AND amount_diff <= 2.0 AND date_gap <= 7 AND same_location == True
    pred_path_a = (
        (df_pairs['text_similarity'] >= 0.95) &
        (df_pairs['amount_difference_pct'] <= 2.0) &
        (df_pairs['date_gap_days'] <= 7.0) &
        (df_pairs['same_location'] == True)
    )

    tp = (pred_path_a & df_pairs['is_duplicate']).sum()
    fp = (pred_path_a & ~df_pairs['is_duplicate']).sum()
    fn = (~pred_path_a & df_pairs['is_duplicate']).sum()
    tn = (~pred_path_a & ~df_pairs['is_duplicate']).sum()

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / total_pos if total_pos > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    print("\n" + "="*70)
    print("📊 ADVERSARIAL VALIDATION: FROZEN POLICY CONFUSION MATRIX")
    print("="*70)
    print(f"Policy: same_location AND text >= 0.95 AND amount_diff_pct <= 2.0 AND date_gap_days <= 7")
    print(f"True Positives (TP):  {tp}")
    print(f"False Positives (FP): {fp}  <-- Alert Fatigue Risk")
    print(f"False Negatives (FN): {fn}  <-- Missed Duplicates Risk")
    print(f"True Negatives (TN):  {tn}")
    print("-"*70)
    print(f"Precision: {precision:.4f} | Recall: {recall:.4f} | F1 Score: {f1:.4f}")
    print("="*70)

    # 4. Explicit Edge Case Inspection
    print("\n🔍 INSPECTING BOUNDARY FAILURES & EDGE CASES")
    
    fns = df_pairs[(~pred_path_a) & df_pairs['is_duplicate']]
    if not fns.empty:
        print(f"\n[!] Detected {len(fns)} False Negatives. Analyzing reasons:")
        print(f"   - Failed due to different location: {(~fns['same_location']).sum()} cases")
        print(f"   - Failed due to text sim < 0.95: {(fns['text_similarity'] < 0.95).sum()} cases")
        print(f"   - Failed due to amount diff > 2.0%: {(fns['amount_difference_pct'] > 2.0).sum()} cases")
        print(f"   - Failed due to date gap > 7: {(fns['date_gap_days'] > 7.0).sum()} cases")
    else:
        print("\n[✓] Zero False Negatives detected on Path A ruleset.")

    fps = df_pairs[pred_path_a & (~df_pairs['is_duplicate'])]
    if not fps.empty:
        print(f"\n[!] Detected {len(fps)} False Positives. These are exact-text/spatial normal collisions.")
    else:
        print("\n[✓] Zero False Positives detected on Path A ruleset across entire population block.")

    # 5. Export Frozen Specification Artifact
    spec_artifact = {
        "dataset_sha256": dataset_hash,
        "rule_specification": {
            "path_a_spatial": {
                "same_location": True,
                "text_similarity_min": 0.95,
                "amount_difference_pct_max": 2.0,
                "date_gap_days_max": 7.0
            }
        },
        "validation_metrics": {
            "total_pairs_evaluated": int(len(df_pairs)),
            "tp": int(tp), "fp": int(fp), "fn": int(fn), "tn": int(tn),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4)
        }
    }

    os.makedirs(artifacts_dir, exist_ok=True)
    out_path = os.path.join(artifacts_dir, "duplicate_engine_frozen_spec.json")
    with open(out_path, "w") as f:
        json.dump(spec_artifact, f, indent=4)
    
    print("\n" + "="*70)
    print(f"📄 Operational specification successfully frozen to: {out_path}")
    print("="*70)

if __name__ == "__main__":
    run_adversarial_validation()