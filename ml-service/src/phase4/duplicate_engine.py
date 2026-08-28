"""
duplicate_engine.py
Phase 4.3 Deterministic Duplicate Engine.
Implements the frozen Phase 4.3D Path A specification.
Enforces zero-leakage (duplicate_group_id is not a feature) and strict DQ guards.
"""
import pandas as pd
from typing import Dict, Any, Optional
from enum import Enum
from dataclasses import dataclass, field
from rapidfuzz import fuzz

class DuplicateStatus(Enum):
    DUPLICATE_DETECTED = "DUPLICATE_DETECTED"
    NO_MATCH = "NO_MATCH"
    NOT_EVALUABLE = "NOT_EVALUABLE"

@dataclass
class DuplicateResult:
    rule_id: str
    status: DuplicateStatus
    reason_code: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)

class DuplicateEngine:
    # 🔒 FROZEN PHASE 4.3D BOUNDARY THRESHOLDS
    TEXT_SIM_MIN = 0.95
    AMOUNT_DIFF_MAX_PCT = 2.0
    DATE_GAP_MAX_DAYS = 7.0

    @staticmethod
    def _normalize_text(text: Any) -> str:
        if not isinstance(text, str):
            return ""
        return " ".join(text.lower().strip().split())

    @classmethod
    def evaluate_pair(cls, p1: Dict[str, Any], p2: Dict[str, Any]) -> DuplicateResult:
        """
        Evaluates a candidate project pair against the frozen Path A spatial ruleset.
        """
        # DQ Guards: Required fields must exist
        req_keys = ['location_id', 'project_description', 'sanctioned_amount', 'start_date', 'constituency', 'work_type']
        for k in req_keys:
            if p1.get(k) is None or p2.get(k) is None:
                return DuplicateResult("DUP-01", DuplicateStatus.NOT_EVALUABLE, reason_code=f"DQ_MISSING_FIELD_{k.upper()}")

        # 1. Spatial & Categorical Blocking (Fast Fail)
        if str(p1['location_id']) != str(p2['location_id']):
            return DuplicateResult("DUP-01", DuplicateStatus.NO_MATCH, reason_code="DIFFERENT_LOCATION")
        if str(p1['constituency']) != str(p2['constituency']):
            return DuplicateResult("DUP-01", DuplicateStatus.NO_MATCH, reason_code="DIFFERENT_CONSTITUENCY")
        if str(p1['work_type']) != str(p2['work_type']):
            return DuplicateResult("DUP-01", DuplicateStatus.NO_MATCH, reason_code="DIFFERENT_WORK_TYPE")

        # 2. Financial Delta Validation
        try:
            amt1, amt2 = float(p1['sanctioned_amount']), float(p2['sanctioned_amount'])
            if amt1 <= 0 or amt2 <= 0:
                raise ValueError("Amounts must be positive.")
        except (ValueError, TypeError):
            return DuplicateResult("DUP-01", DuplicateStatus.NOT_EVALUABLE, reason_code="DQ_INVALID_AMOUNT")
            
        amt_diff_pct = abs(amt1 - amt2) / max(amt1, amt2) * 100.0
        if amt_diff_pct > cls.AMOUNT_DIFF_MAX_PCT:
            return DuplicateResult("DUP-01", DuplicateStatus.NO_MATCH, reason_code="FINANCIAL_DELTA_EXCEEDS_THRESHOLD", details={"amount_diff_pct": round(amt_diff_pct, 4)})

        # 3. Temporal Gap Validation
        try:
            d1 = pd.to_datetime(p1['start_date'])
            d2 = pd.to_datetime(p2['start_date'])
            date_gap_days = abs((d1 - d2).days)
        except Exception:
            return DuplicateResult("DUP-01", DuplicateStatus.NOT_EVALUABLE, reason_code="DQ_DATE_PARSE_ERROR")

        if date_gap_days > cls.DATE_GAP_MAX_DAYS:
            return DuplicateResult("DUP-01", DuplicateStatus.NO_MATCH, reason_code="TEMPORAL_GAP_EXCEEDS_THRESHOLD", details={"date_gap_days": float(date_gap_days)})

        # 4. Text Similarity Validation (Most Expensive, Executed Last)
        t1 = cls._normalize_text(p1['project_description'])
        t2 = cls._normalize_text(p2['project_description'])
        if not t1 or not t2:
             return DuplicateResult("DUP-01", DuplicateStatus.NOT_EVALUABLE, reason_code="DQ_EMPTY_DESCRIPTION")

        text_sim = fuzz.ratio(t1, t2) / 100.0

        if text_sim < cls.TEXT_SIM_MIN:
            return DuplicateResult("DUP-01", DuplicateStatus.NO_MATCH, reason_code="TEXT_SIMILARITY_BELOW_THRESHOLD", details={"text_similarity": round(text_sim, 4)})

        # 🚨 All conditions satisfied -> Duplicate Triggered
        return DuplicateResult(
            "DUP-01",
            DuplicateStatus.DUPLICATE_DETECTED,
            reason_code="PATH_A_SPATIAL_COLLISION",
            details={
                "text_similarity": round(text_sim, 4),
                "amount_difference_pct": round(amt_diff_pct, 4),
                "date_gap_days": float(date_gap_days),
                "same_location": True
            }
        )