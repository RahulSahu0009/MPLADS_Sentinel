"""
rules.py
Deterministic Rule Engine for Phase 4.2.
Enforces strict DQ guards, artifact-driven thresholds, fallback hierarchies, and officer explainability.
"""
import os
import json
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, Tuple
import numpy as np

class RuleStatus(Enum):
    PASSED = "PASSED"
    TRIGGERED = "TRIGGERED"
    SUPPRESSED_MOBILIZATION = "SUPPRESSED_MOBILIZATION"
    SUPPRESSED_EARLY_LIFECYCLE = "SUPPRESSED_EARLY_LIFECYCLE"
    NOT_EVALUABLE = "NOT_EVALUABLE"

@dataclass
class RuleResult:
    rule_id: str
    status: RuleStatus
    severity: Optional[str] = None
    reason_code: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)

class DeterministicEngine:
    _calibration_cache: Optional[Dict[str, Any]] = None

    @classmethod
    def _load_calibration_report(cls) -> Dict[str, Any]:
        """Loads and validates the frozen utilization calibration report (Fail-Closed)."""
        if cls._calibration_cache is not None:
            return cls._calibration_cache

        candidate_paths = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../artifacts/utilization_calibration_report.json")),
            os.path.abspath(os.path.join(os.getcwd(), "../artifacts/utilization_calibration_report.json")),
            os.path.abspath(os.path.join(os.getcwd(), "artifacts/utilization_calibration_report.json")),
            "/home/artifacts/utilization_calibration_report.json"
        ]

        report_path = next((p for p in candidate_paths if os.path.exists(p)), None)

        if not report_path:
            raise FileNotFoundError(f"CRITICAL PROVENANCE FAILURE: Utilization calibration report missing. Tried: {candidate_paths}. FAIL CLOSED.")

        try:
            with open(report_path, "r") as f:
                data = json.load(f)
            if not isinstance(data, dict) or len(data) == 0:
                raise ValueError("Malformed calibration report format.")
            cls._calibration_cache = data
            return data
        except Exception as e:
            raise ValueError(f"CRITICAL PROVENANCE FAILURE: Failed to parse calibration report: {e}. FAIL CLOSED.")

    @staticmethod
    def evaluate_prog_01(project: Dict[str, Any]) -> RuleResult:
        """
        PROG-01: Financial vs Physical Progress Mismatch
        """
        expenditure = project.get("expenditure")
        sanctioned_amount = project.get("sanctioned_amount")
        physical_pct = project.get("physical_progress_pct")
        age_days = project.get("project_age_days")

        # DQ Guards
        if sanctioned_amount is None or sanctioned_amount <= 0:
            return RuleResult("PROG-01", RuleStatus.NOT_EVALUABLE, reason_code="DQ_INVALID_SANCTIONED_AMOUNT")
        if physical_pct is None:
            return RuleResult("PROG-01", RuleStatus.NOT_EVALUABLE, reason_code="DQ_MISSING_PHYSICAL_PROGRESS")
        if expenditure is None or age_days is None:
            return RuleResult("PROG-01", RuleStatus.NOT_EVALUABLE, reason_code="DQ_MISSING_CORE_FIELDS")

        fin_pct = (expenditure / sanctioned_amount) * 100.0
        gap = fin_pct - physical_pct

        if gap > 20.0:
            if age_days < 30:
                return RuleResult("PROG-01", RuleStatus.SUPPRESSED_MOBILIZATION, severity="LOW", reason_code="EXEMPT_AGE_UNDER_30", details={"gap": gap, "age_days": age_days})
            return RuleResult("PROG-01", RuleStatus.TRIGGERED, severity="CRITICAL", reason_code="FIN_PHYS_GAP_EXCEEDS_20", details={"gap": gap, "fin_pct": fin_pct, "phys_pct": physical_pct})

        return RuleResult("PROG-01", RuleStatus.PASSED, severity="NONE", details={"gap": gap})

    @classmethod
    def evaluate_util_01(cls, project: Dict[str, Any]) -> RuleResult:
        """
        UTIL-01: Lifecycle-Adjusted Under-Utilization
        """
        expenditure = project.get("expenditure")
        sanctioned_amount = project.get("sanctioned_amount")
        elapsed = project.get("elapsed_duration_days")
        expected = project.get("expected_duration_days")

        # DQ Guards
        if sanctioned_amount is None or sanctioned_amount <= 0:
            return RuleResult("UTIL-01", RuleStatus.NOT_EVALUABLE, reason_code="DQ_INVALID_SANCTIONED_AMOUNT")
        if expenditure is None:
            return RuleResult("UTIL-01", RuleStatus.NOT_EVALUABLE, reason_code="DQ_MISSING_EXPENDITURE")
        if elapsed is None or expected is None or expected <= 0:
            return RuleResult("UTIL-01", RuleStatus.NOT_EVALUABLE, reason_code="DQ_INVALID_TIMELINE")

        try:
            utilization_pct = (expenditure / sanctioned_amount) * 100.0
            lifecycle_progress = elapsed / expected
        except Exception:
            return RuleResult("UTIL-01", RuleStatus.NOT_EVALUABLE, reason_code="DQ_CALCULATION_ERROR")

        if not (0 <= utilization_pct <= 200) or not (0 <= lifecycle_progress <= 10.0):
            return RuleResult("UTIL-01", RuleStatus.NOT_EVALUABLE, reason_code="DQ_OUT_OF_BOUNDS_METRICS")

        # Maturity Gate
        if lifecycle_progress < 0.25:
            return RuleResult(
                "UTIL-01", 
                RuleStatus.SUPPRESSED_EARLY_LIFECYCLE, 
                severity="LOW",
                reason_code="EXEMPT_EARLY_LIFECYCLE", 
                details={"lifecycle_progress": lifecycle_progress, "utilization_pct": utilization_pct}
            )

        # Load Calibration Report & Map Bucket
        try:
            report = cls._load_calibration_report()
        except Exception as e:
            return RuleResult("UTIL-01", RuleStatus.NOT_EVALUABLE, reason_code="FAIL_CLOSED_ARTIFACT_ERROR", details={"error": str(e)})

        bucket_key = cls._map_lifecycle_to_bucket(lifecycle_progress)
        
        # Fallback Hierarchy
        threshold_used, threshold_source = cls._resolve_threshold_with_fallback(report, bucket_key)

        if threshold_used is None:
            return RuleResult("UTIL-01", RuleStatus.NOT_EVALUABLE, reason_code="THRESHOLD_RESOLUTION_FAILED")

        shortfall = threshold_used - utilization_pct

        if utilization_pct < threshold_used:
            return RuleResult(
                "UTIL-01",
                RuleStatus.TRIGGERED,
                severity="HIGH",
                reason_code="UTILIZATION_BELOW_EXPECTED",
                details={
                    "lifecycle_progress": round(lifecycle_progress, 4),
                    "lifecycle_bucket": bucket_key,
                    "utilization_pct": round(utilization_pct, 2),
                    "threshold_used": round(threshold_used, 2),
                    "threshold_source": threshold_source,
                    "deviation_from_threshold": round(shortfall, 2)
                }
            )

        return RuleResult(
            "UTIL-01",
            RuleStatus.PASSED,
            severity="NONE",
            details={
                "lifecycle_progress": round(lifecycle_progress, 4),
                "lifecycle_bucket": bucket_key,
                "utilization_pct": round(utilization_pct, 2),
                "threshold_used": round(threshold_used, 2),
                "threshold_source": threshold_source
            }
        )

    @staticmethod
    def _map_lifecycle_to_bucket(progress: float) -> str:
        if progress < 0.10: return "<10%"
        elif progress < 0.25: return "10%-25%"
        elif progress < 0.50: return "25%-50%"
        elif progress < 0.75: return "50%-75%"
        elif progress < 0.90: return "75%-90%"
        elif progress <= 1.00: return "90%-100%"
        else: return "100%+"

    @staticmethod
    def _resolve_threshold_with_fallback(report: Dict[str, Any], bucket_key: str) -> Tuple[Optional[float], Optional[str]]:
        # 1. Exact Bucket Q25
        if bucket_key in report and "q25" in report[bucket_key]:
            return report[bucket_key]["q25"], f"EXACT_BUCKET_{bucket_key}"

        # 2. Adjacent Mature Bucket Fallback order
        bucket_order = ["25%-50%", "50%-75%", "75%-90%", "90%-100%", "100%+", "10%-25%"]
        for b in bucket_order:
            if b in report and "q25" in report[b]:
                return report[b]["q25"], f"ADJACENT_BUCKET_{b}"

        # 3. Global Mature Q25 Fallback (Average across mature buckets)
        q25_vals = [report[b]["q25"] for b in ["25%-50%", "50%-75%", "75%-90%", "90%-100%"] if b in report and "q25" in report[b]]
        if q25_vals:
            return float(np.mean(q25_vals)), "GLOBAL_MATURE_Q25_FALLBACK"

        return None, None