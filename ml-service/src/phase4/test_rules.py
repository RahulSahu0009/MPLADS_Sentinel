"""
test_rules.py
Deterministic contract and unit tests for Phase 4.2 Rules (PROG-01 & UTIL-01).
Ensures artifact-driven execution, fallback hierarchies, and fail-closed integrity.
"""
import unittest
import os
import json
from unittest.mock import patch
from phase4.rules import DeterministicEngine, RuleStatus

class TestRuleEngineContracts(unittest.TestCase):

    # --- PROG-01 Tests ---
    def test_prog_01_triggered(self):
        project = {"expenditure": 600000, "sanctioned_amount": 1000000, "physical_progress_pct": 30.0, "project_age_days": 150}
        res = DeterministicEngine.evaluate_prog_01(project)
        self.assertEqual(res.status, RuleStatus.TRIGGERED)
        self.assertEqual(res.severity, "CRITICAL")
        self.assertEqual(res.reason_code, "FIN_PHYS_GAP_EXCEEDS_20")

    def test_prog_01_passed(self):
        project = {"expenditure": 400000, "sanctioned_amount": 1000000, "physical_progress_pct": 35.0, "project_age_days": 100}
        res = DeterministicEngine.evaluate_prog_01(project)
        self.assertEqual(res.status, RuleStatus.PASSED)

    def test_prog_01_boundary_exact_20(self):
        project = {"expenditure": 500000, "sanctioned_amount": 1000000, "physical_progress_pct": 30.0, "project_age_days": 100}
        res = DeterministicEngine.evaluate_prog_01(project)
        self.assertEqual(res.status, RuleStatus.PASSED)

    def test_prog_01_suppressed_mobilization(self):
        project = {"expenditure": 500000, "sanctioned_amount": 1000000, "physical_progress_pct": 10.0, "project_age_days": 15}
        res = DeterministicEngine.evaluate_prog_01(project)
        self.assertEqual(res.status, RuleStatus.SUPPRESSED_MOBILIZATION)

    def test_prog_01_dq_missing_physical(self):
        project = {"expenditure": 500000, "sanctioned_amount": 1000000, "physical_progress_pct": None, "project_age_days": 100}
        res = DeterministicEngine.evaluate_prog_01(project)
        self.assertEqual(res.status, RuleStatus.NOT_EVALUABLE)

    # --- UTIL-01 Tests ---
    def test_util_01_suppressed_early_lifecycle(self):
        project = {"expenditure": 10000, "sanctioned_amount": 1000000, "elapsed_duration_days": 10, "expected_duration_days": 100}
        res = DeterministicEngine.evaluate_util_01(project)
        self.assertEqual(res.status, RuleStatus.SUPPRESSED_EARLY_LIFECYCLE)
        self.assertEqual(res.reason_code, "EXEMPT_EARLY_LIFECYCLE")

    def test_util_01_triggered_below_q25(self):
        # Lifecycle progress = 60/100 = 0.60 (Bucket: 50%-75%, Q25 = 87.4 from mock report)
        # Utilization = 500,000 / 1,000,000 = 50.0% < 87.4% -> Triggered
        project = {"expenditure": 500000, "sanctioned_amount": 1000000, "elapsed_duration_days": 60, "expected_duration_days": 100}
        res = DeterministicEngine.evaluate_util_01(project)
        self.assertEqual(res.status, RuleStatus.TRIGGERED)
        self.assertEqual(res.severity, "HIGH")
        self.assertIn("threshold_used", res.details)
        self.assertIn("deviation_from_threshold", res.details)

    def test_util_01_passed_above_q25(self):
        # Lifecycle progress = 60/100 = 0.60 (Bucket: 50%-75%, Q25 = 87.4)
        # Utilization = 900,000 / 1,000,000 = 90.0% >= 87.4% -> Passed
        project = {"expenditure": 900000, "sanctioned_amount": 1000000, "elapsed_duration_days": 60, "expected_duration_days": 100}
        res = DeterministicEngine.evaluate_util_01(project)
        self.assertEqual(res.status, RuleStatus.PASSED)

    def test_util_01_dq_invalid_sanctioned(self):
        project = {"expenditure": 500000, "sanctioned_amount": 0, "elapsed_duration_days": 60, "expected_duration_days": 100}
        res = DeterministicEngine.evaluate_util_01(project)
        self.assertEqual(res.status, RuleStatus.NOT_EVALUABLE)
        self.assertEqual(res.reason_code, "DQ_INVALID_SANCTIONED_AMOUNT")

    def test_util_01_dq_missing_expenditure(self):
        project = {"expenditure": None, "sanctioned_amount": 1000000, "elapsed_duration_days": 60, "expected_duration_days": 100}
        res = DeterministicEngine.evaluate_util_01(project)
        self.assertEqual(res.status, RuleStatus.NOT_EVALUABLE)
        self.assertEqual(res.reason_code, "DQ_MISSING_EXPENDITURE")

    def test_util_01_dq_invalid_timeline(self):
        project = {"expenditure": 500000, "sanctioned_amount": 1000000, "elapsed_duration_days": 60, "expected_duration_days": 0}
        res = DeterministicEngine.evaluate_util_01(project)
        self.assertEqual(res.status, RuleStatus.NOT_EVALUABLE)
        self.assertEqual(res.reason_code, "DQ_INVALID_TIMELINE")

    @patch('os.path.exists', return_value=False)
    def test_util_01_fail_closed_artifact_missing(self, mock_exists):
        DeterministicEngine._calibration_cache = None # Clear cache
        project = {"expenditure": 500000, "sanctioned_amount": 1000000, "elapsed_duration_days": 60, "expected_duration_days": 100}
        res = DeterministicEngine.evaluate_util_01(project)
        self.assertEqual(res.status, RuleStatus.NOT_EVALUABLE)
        self.assertEqual(res.reason_code, "FAIL_CLOSED_ARTIFACT_ERROR")

    def test_fallback_hierarchy_missing_bucket(self):
        # Test fallback when a bucket is missing from report
        sparse_report = {"25%-50%": {"q25": 90.0}}
        threshold, source = DeterministicEngine._resolve_threshold_with_fallback(sparse_report, "50%-75%")
        self.assertEqual(threshold, 90.0)
        self.assertIn("ADJACENT_BUCKET", source)

if __name__ == '__main__':
    unittest.main()