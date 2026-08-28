"""
build_bundle.py
Phase 4.5A Artifact Bundler.
Copies all required production artifacts into ML_PACKAGE/production_bundle
and generates an immutable MANIFEST.json with SHA-256 hashes.
"""
import hashlib
import json
import os
import shutil
from datetime import datetime


def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def build_production_bundle():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    src = os.path.join(root_dir, "artifacts")
    bundle_dir = os.path.join(root_dir, "ML_PACKAGE", "production_bundle")

    # Clean and recreate bundle directory
    if os.path.exists(bundle_dir):
        shutil.rmtree(bundle_dir)
    for sub in ("model", "preprocessing", "scoring", "rules", "duplicate", "schemas"):
        os.makedirs(os.path.join(bundle_dir, sub))

    # Artifact map: source -> destination (relative to bundle_dir)
    artifact_map = {
        os.path.join(src, "isolation_forest.joblib"):
            os.path.join(bundle_dir, "model", "isolation_forest.joblib"),
        os.path.join(src, "experiment_c", "scaler.joblib"):
            os.path.join(bundle_dir, "preprocessing", "scaler.joblib"),
        os.path.join(src, "experiment_c", "imputer.joblib"):
            os.path.join(bundle_dir, "preprocessing", "imputer.joblib"),
        os.path.join(src, "experiment_c", "ohe_encoder.joblib"):
            os.path.join(bundle_dir, "preprocessing", "encoder.joblib"),
        os.path.join(src, "threshold.json"):
            os.path.join(bundle_dir, "scoring", "threshold.json"),
        os.path.join(src, "utilization_calibration_report.json"):
            os.path.join(bundle_dir, "rules", "utilization_calibration_report.json"),
        os.path.join(src, "duplicate_engine_frozen_spec.json"):
            os.path.join(bundle_dir, "duplicate", "duplicate_engine_frozen_spec.json"),
        os.path.join(src, "feature_schema.json"):
            os.path.join(bundle_dir, "schemas", "feature_schema.json"),
        os.path.join(src, "preprocessing_stats.json"):
            os.path.join(bundle_dir, "preprocessing", "preprocessing_stats.json"),
    }

    for src_path, dst_path in artifact_map.items():
        if not os.path.exists(src_path):
            raise FileNotFoundError(f"CRITICAL: Required artifact missing: {src_path}")
        shutil.copy2(src_path, dst_path)
        print(f"  Copied: {os.path.relpath(src_path, root_dir)} -> {os.path.relpath(dst_path, root_dir)}")

    # Build MANIFEST.json by hashing every copied file
    manifest_files: dict = {}
    for dirpath, _, filenames in os.walk(bundle_dir):
        for fname in sorted(filenames):
            fpath = os.path.join(dirpath, fname)
            rel = os.path.relpath(fpath, bundle_dir).replace("\\", "/")
            manifest_files[rel] = {
                "sha256": compute_sha256(fpath),
                "size_bytes": os.path.getsize(fpath),
            }

    manifest = {
        "bundle_version": "1.0.0",
        "pipeline_version": "1.0.0",
        "experiment": "C",
        "dataset_sha256": "229a64e31fb0f3c28be001309e3a5b878a41fa8fb9b0d50b333396de9f620d65",
        "creation_timestamp": datetime.utcnow().isoformat() + "Z",
        "files": manifest_files,
    }

    manifest_path = os.path.join(bundle_dir, "MANIFEST.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nBundle created at: {bundle_dir}")
    print(f"MANIFEST.json contains {len(manifest_files)} file entries.")


if __name__ == "__main__":
    build_production_bundle()
