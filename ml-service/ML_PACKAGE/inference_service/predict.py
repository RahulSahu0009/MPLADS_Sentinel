"""
predict.py
Phase 4.5 Production Inference Engine.
Loads real artifacts from production_bundle, verifies MANIFEST.json on init,
and orchestrates the full ML + Rules + Duplicate + Aggregation pipeline.
Preprocessing uses pure numpy from frozen stats — no sklearn version dependency.
"""
import datetime
import hashlib
import json
import os
import sys
from typing import Any, Dict, List

import joblib
import numpy as np

# Resolve src/ so phase4 modules are importable
_SRC = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../src"))
if _SRC not in sys.path:
    sys.path.insert(0, _SRC)

from phase4.duplicate_engine import DuplicateEngine, DuplicateStatus
from phase4.risk_aggregator import calculate_final_risk
from phase4.rules import DeterministicEngine


class IntegrityError(RuntimeError):
    """Raised when a bundle file fails its SHA-256 check."""


class InferenceConfigurationError(RuntimeError):
    """Raised when required artifacts or config keys are missing."""


def _sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


class ProductionInference:
    def __init__(self, bundle_dir: str):
        self.bundle_dir = os.path.abspath(bundle_dir)
        self._verify_manifest()
        self._load_artifacts()

    # ------------------------------------------------------------------
    # Startup: manifest integrity check (fail-closed)
    # ------------------------------------------------------------------
    def _verify_manifest(self):
        manifest_path = os.path.join(self.bundle_dir, "MANIFEST.json")
        if not os.path.exists(manifest_path):
            raise IntegrityError(f"MANIFEST.json not found in {self.bundle_dir}")

        with open(manifest_path) as f:
            manifest = json.load(f)

        for rel_path, meta in manifest.get("files", {}).items():
            abs_path = os.path.join(self.bundle_dir, rel_path.replace("/", os.sep))
            if not os.path.exists(abs_path):
                raise IntegrityError(f"Bundle file missing: {rel_path}")
            actual = _sha256(abs_path)
            if actual != meta["sha256"]:
                raise IntegrityError(
                    f"SHA-256 mismatch for {rel_path}: "
                    f"expected={meta['sha256']} actual={actual}"
                )
        self._manifest = manifest

    # ------------------------------------------------------------------
    # Load artifacts after integrity is confirmed
    # ------------------------------------------------------------------
    def _load_artifacts(self):
        def _path(*parts):
            p = os.path.join(self.bundle_dir, *parts)
            if not os.path.exists(p):
                raise InferenceConfigurationError(f"Required artifact missing: {p}")
            return p

        # IsolationForest — direct sklearn object
        self.model = joblib.load(_path("model", "isolation_forest.joblib"))

        # Frozen preprocessing stats (pure numpy — no sklearn version dependency)
        with open(_path("preprocessing", "preprocessing_stats.json")) as f:
            pp = json.load(f)

        self._numeric_features: List[str] = pp["numeric_features"]
        self._imputer_fill: np.ndarray = np.array(pp["imputer_statistics"])
        self._scaler_mean: np.ndarray = np.array(pp["scaler_mean"])
        self._scaler_scale: np.ndarray = np.array(pp["scaler_scale"])
        self._encoder_categories: List[List[str]] = pp["encoder_categories"]
        self._categorical_features: List[str] = pp["categorical_features"]

        # Threshold
        with open(_path("scoring", "threshold.json")) as f:
            threshold_cfg = json.load(f)
        self.threshold = threshold_cfg.get(
            "threshold_value", threshold_cfg.get("exact_threshold")
        )
        if self.threshold is None:
            raise InferenceConfigurationError("threshold.json missing 'threshold_value'")

        # Validate feature schema exists (provenance check)
        _path("schemas", "feature_schema.json")

    # ------------------------------------------------------------------
    # Feature extraction: pure numpy pipeline
    # ------------------------------------------------------------------
    def _extract_features(self, project: Dict[str, Any]) -> np.ndarray:
        """
        Phase 3.1 pipeline replicated in pure numpy:
          1. Build 11 numeric features -> median impute -> standard scale
          2. Build 2 categorical features -> OHE (drop='if_binary' style)
          3. Concatenate -> 20-feature vector
        """
        sanctioned = float(project.get("sanctioned_amount") or 0)
        expenditure = float(project.get("expenditure") or 0)
        physical_pct = float(project.get("physical_progress_pct") or 0)
        age_days = float(project.get("project_age_days") or 0)
        expected_dur = float(project.get("expected_duration_days") or 1) or 1.0
        elapsed_dur = float(project.get("elapsed_duration_days") or 0)
        num_payments = float(project.get("num_payments") or 1) or 1.0
        total_alloc = float(project.get("total_mp_allocation") or sanctioned) or sanctioned or 1.0
        total_exp = float(project.get("total_mp_expenditure") or expenditure) or expenditure or 1.0
        peer_cost = float(project.get("peer_median_cost") or sanctioned) or sanctioned or 1.0

        fin_pct = (expenditure / sanctioned * 100.0) if sanctioned > 0 else 0.0

        numeric_vals = [
            fin_pct - physical_pct,                          # cost_deviation_pct
            physical_pct - fin_pct,                          # physical_financial_gap
            expenditure / num_payments,                      # avg_exp_per_payment
            sanctioned / total_alloc * 100.0,                # project_share_of_allocation
            expenditure / total_exp * 100.0,                 # project_exp_share_of_alloc
            age_days,                                        # project_age_days
            expected_dur,                                    # expected_duration_days
            elapsed_dur,                                     # elapsed_duration_days
            elapsed_dur / expected_dur,                      # schedule_progress_ratio
            max(0.0, elapsed_dur - expected_dur),            # days_overdue
            sanctioned / peer_cost,                          # cost_vs_peer_ratio
        ]

        # Impute NaN/inf with median fill values, then standard scale
        X_num = np.array(numeric_vals, dtype=np.float64)
        nan_mask = ~np.isfinite(X_num)
        X_num[nan_mask] = self._imputer_fill[nan_mask]
        X_num = (X_num - self._scaler_mean) / self._scaler_scale

        # OHE for categorical features
        ohe_cols = []
        cat_vals = [
            str(project.get("work_type", "")).lower().replace(" ", "_"),
            str(project.get("status", "")).lower().replace(" ", "_"),
        ]
        for val, categories in zip(cat_vals, self._encoder_categories):
            ohe_cols.extend([1.0 if val == cat else 0.0 for cat in categories])

        X_cat = np.array(ohe_cols, dtype=np.float64)
        return np.concatenate([X_num, X_cat]).reshape(1, -1)

    # ------------------------------------------------------------------
    # ML score normalization: raw IF score -> 0-100
    # ------------------------------------------------------------------
    def _normalize_score(self, raw_score: float) -> float:
        # IsolationForest.score_samples: more negative = more anomalous
        # Map [-0.5, 0.5] -> [100, 0] linearly
        SCORE_MIN, SCORE_MAX = -0.5, 0.5
        clamped = max(SCORE_MIN, min(SCORE_MAX, raw_score))
        return round((SCORE_MAX - clamped) / (SCORE_MAX - SCORE_MIN) * 100.0, 4)

    # ------------------------------------------------------------------
    # Main analyze() entry point
    # ------------------------------------------------------------------
    def analyze(
        self,
        project: Dict[str, Any],
        candidate_peers: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        project_id = project.get("project_id", "UNKNOWN")
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # 1. Feature extraction + ML score
        features = self._extract_features(project)
        raw_score = float(self.model.score_samples(features)[0])
        ml_score = self._normalize_score(raw_score)
        ml_payload = {
            "raw_score": raw_score,
            "normalized_score": ml_score,
            "threshold": self.threshold,
            "status": "ANOMALY" if raw_score < self.threshold else "NORMAL",
        }

        # 2. Deterministic rules
        prog_result = DeterministicEngine.evaluate_prog_01(project)
        util_result = DeterministicEngine.evaluate_util_01(project)
        rules_payload = [
            {
                "rule_id": prog_result.rule_id,
                "status": prog_result.status.value,
                "severity": prog_result.severity,
                "reason_code": prog_result.reason_code,
                "details": prog_result.details,
            },
            {
                "rule_id": util_result.rule_id,
                "status": util_result.status.value,
                "severity": util_result.severity,
                "reason_code": util_result.reason_code,
                "details": util_result.details,
            },
        ]

        # 3. Duplicate detection (metadata-blind: no duplicate_group_id used)
        duplicate_payload: Dict[str, Any] = {"status": DuplicateStatus.NO_MATCH.value}
        for peer in candidate_peers:
            if peer.get("project_id") == project_id:
                continue
            dup = DuplicateEngine.evaluate_pair(project, peer)
            if dup.status == DuplicateStatus.DUPLICATE_DETECTED:
                duplicate_payload = {
                    "status": dup.status.value,
                    "matched_project_id": peer.get("project_id", "UNKNOWN"),
                    "pathway": dup.reason_code,
                    "details": dup.details,
                }
                break

        # 4. Risk aggregation
        agg = calculate_final_risk(
            ml_normalized_score=ml_score,
            rules_results=rules_payload,
            duplicate_status=duplicate_payload["status"],
        )

        return {
            "project_id": project_id,
            "risk_score": agg["risk_score"],
            "risk_band": agg["risk_band"],
            "assessment_timestamp": timestamp,
            "aggregation": agg["aggregation"],
            "engines": {
                "isolation_forest": ml_payload,
                "rules": rules_payload,
                "duplicate": duplicate_payload,
            },
            "risk_drivers": agg["risk_drivers"],
        }
