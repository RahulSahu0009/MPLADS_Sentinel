"""
calibrate_duplicates.py
Phase 4.3A Forensic Calibration for Duplicate Engine.
Profiles synthetic duplicate groups to discover exact injection signatures
(spatial, textual, financial, temporal) with exact matching and distribution metrics.
"""
import sys
import time
import threading
import os
import json
import hashlib
import numpy as np
import pandas as pd
from difflib import SequenceMatcher

class Spinner:
    def __init__(self, message="Processing..."):
        self.message = message
        self.spinner_chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
        self.stop_running = threading.Event()
        self.thread = None

    def _animate(self):
        idx = 0
        while not self.stop_running.is_set():
            sys.stdout.write(f"\r{self.spinner_chars[idx]} {self.message}")
            sys.stdout.flush()
            idx = (idx + 1) % len(self.spinner_chars)
            time.sleep(0.1)
        sys.stdout.write("\r" + " " * (len(self.message) + 4) + "\r")
        sys.stdout.flush()

    def __enter__(self):
        self.stop_running.clear()
        self.thread = threading.Thread(target=self._animate)
        self.thread.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop_running.set()
        self.thread.join()


def compute_file_sha256(filepath: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def normalize_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    return " ".join(text.lower().strip().split())

def run_duplicate_calibration():
    print("="*70)
    print("🔍 PHASE 4.3A: DUPLICATE ENGINE FORENSIC CALIBRATION")
    print("="*70)

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    artifacts_dir = os.path.join(root_dir, "artifacts")
    raw_csv_path = os.path.join(root_dir, "data", "raw", "synthetic_projects_v1.0.csv")
    manifest_path = os.path.join(artifacts_dir, "manifest.json")

    if not os.path.exists(raw_csv_path) or not os.path.exists(manifest_path):
        raise FileNotFoundError("CRITICAL: Raw dataset or manifest missing. FAIL CLOSED.")

    # Cryptographic validation
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    
    actual_sha = compute_file_sha256(raw_csv_path)
    if actual_sha != manifest.get("dataset_sha256"):
        raise ValueError("CRITICAL PROVENANCE FAILURE: Dataset hash mismatch. FAIL CLOSED.")
    print("✅ Cryptographic Manifest Verified.")

    df_raw = pd.read_csv(raw_csv_path)

    dup_col = next((c for c in ['duplicate_group_id', 'group_id', 'dup_id'] if c in df_raw.columns), None)
    if not dup_col:
        raise KeyError("CRITICAL: Duplicate group identifier column not found in raw dataset.")

    df_dups = df_raw[df_raw[dup_col].notna() & (df_raw[dup_col] != '')].copy()
    print(f"✅ Isolated {len(df_dups)} records belonging to duplicate groups across {df_dups[dup_col].nunique()} distinct groups.")

    group_stats = []
    
    # Wrap heavy groupby and pairwise computation in the Spinner animation
    with Spinner("Analyzing spatial, financial, and textual signatures..."):
        for g_id, group in df_dups.groupby(dup_col):
            if len(group) < 2:
                continue
            
            same_location = group['location_id'].nunique() == 1 if 'location_id' in group.columns else False
            same_work_type = group['work_type'].nunique() == 1 if 'work_type' in group.columns else False
            same_constituency = group['constituency'].nunique() == 1 if 'constituency' in group.columns else False
            
            sanctioned_vals = group['sanctioned_amount'].values if 'sanctioned_amount' in group.columns else []
            exact_amount_match = np.all(sanctioned_vals == sanctioned_vals[0]) if len(sanctioned_vals) > 0 else False
            amount_cv = float(np.std(sanctioned_vals) / np.mean(sanctioned_vals)) if len(sanctioned_vals) > 0 and np.mean(sanctioned_vals) > 0 else 0.0

            descriptions = [normalize_text(d) for d in group['project_description'].tolist()] if 'project_description' in group.columns else []
            text_sims = []
            for i in range(len(descriptions)):
                for j in range(i + 1, len(descriptions)):
                    sim = SequenceMatcher(None, descriptions[i], descriptions[j]).ratio()
                    text_sims.append(sim)
            
            min_sim = float(np.min(text_sims)) if text_sims else 1.0
            median_sim = float(np.median(text_sims)) if text_sims else 1.0
            max_sim = float(np.max(text_sims)) if text_sims else 1.0

            # Temporal Proximity
            date_span_days = 0.0
            if 'start_date' in group.columns:
                start_dates = pd.to_datetime(group['start_date'], errors='coerce')
                if start_dates.notna().sum() > 1:
                    date_span_days = float((start_dates.max() - start_dates.min()).days)

            group_stats.append({
                "group_id": str(g_id),
                "size": len(group),
                "same_location": bool(same_location),
                "same_work_type": bool(same_work_type),
                "same_constituency": bool(same_constituency),
                "exact_amount_match": bool(exact_amount_match),
                "amount_cv": round(amount_cv, 4),
                "min_text_similarity": round(min_sim, 3),
                "median_text_similarity": round(median_sim, 3),
                "max_text_similarity": round(max_sim, 3),
                "date_span_days": date_span_days
            })

    df_stats = pd.DataFrame(group_stats)

    print("\n" + "="*70)
    print("📊 DUPLICATE GROUP SIGNATURE SUMMARY")
    print("="*70)
    print(f"Total Duplicate Groups Analyzed: {len(df_stats)}")
    print(f"Groups sharing exact location_id: {df_stats['same_location'].mean()*100:.1f}%")
    print(f"Groups sharing exact work_type: {df_stats['same_work_type'].mean()*100:.1f}%")
    print(f"Groups sharing constituency: {df_stats['same_constituency'].mean()*100:.1f}%")
    print(f"Groups with exact sanctioned amounts: {df_stats['exact_amount_match'].mean()*100:.1f}%")
    print(f"Text Similarity -> Min Median: {df_stats['min_text_similarity'].median():.3f} | Median Median: {df_stats['median_text_similarity'].median():.3f} | Max Median: {df_stats['max_text_similarity'].median():.3f}")
    print(f"Date Span Days (Median): {df_stats['date_span_days'].median():.1f}")
    print("="*70)

    os.makedirs(artifacts_dir, exist_ok=True)
    calib_out = os.path.join(artifacts_dir, "duplicate_calibration_report.json")
    df_stats.to_json(calib_out, orient="records", indent=4)
    print(f"📄 Duplicate calibration report securely written to: {calib_out}")
    print("="*70)

    
if __name__ == "__main__":
    run_duplicate_calibration()