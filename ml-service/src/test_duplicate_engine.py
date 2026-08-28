"""
test_duplicate_engine.py
Contract-driven unit tests for the Duplicate Engine.
Validates exact threshold boundaries, feature blindness, and categorical cascades.
"""
import unittest
from phase4.duplicate_engine import DuplicateEngine, DuplicateStatus

class TestDuplicateEngineContracts(unittest.TestCase):
    def setUp(self):
        # Base candidate pair representing an exact, clear duplicate
        self.p1_base = {
            "location_id": "LOC123", "constituency": "North", "work_type": "Road",
            "project_description": "Construction of concrete road near temple",
            "sanctioned_amount": 1000000, "start_date": "2026-05-01"
        }
        self.p2_base = {
            "location_id": "LOC123", "constituency": "North", "work_type": "Road",
            "project_description": "Construction of concrete road near temple",
            "sanctioned_amount": 1000000, "start_date": "2026-05-01"
        }

    # --- 1. CORE SUCCESS / EXACT THRESHOLD TRIGGERS ---
    def test_exact_positive_trigger(self):
        res = DuplicateEngine.evaluate_pair(self.p1_base, self.p2_base)
        self.assertEqual(res.status, DuplicateStatus.DUPLICATE_DETECTED)
        self.assertEqual(res.reason_code, "PATH_A_SPATIAL_COLLISION")

    def test_amount_difference_exactly_2_percent_triggers(self):
        # 1,000,000 vs 1,020,000 -> Diff is 20,000. 20k / 1.02M = 1.96% (<= 2.0%)
        # To hit exactly 2.0%, we need diff / max = 0.02. Max = 1,000,000 -> Diff = 20,000 -> Other amount = 980,000
        p2 = self.p2_base.copy()
        p2["sanctioned_amount"] = 980000
        res = DuplicateEngine.evaluate_pair(self.p1_base, p2)
        self.assertEqual(res.status, DuplicateStatus.DUPLICATE_DETECTED)
        self.assertEqual(res.details["amount_difference_pct"], 2.0)

    def test_date_gap_exactly_7_days_triggers(self):
        p2 = self.p2_base.copy()
        p2["start_date"] = "2026-05-08" # Exactly 7 days after 2026-05-01
        res = DuplicateEngine.evaluate_pair(self.p1_base, p2)
        self.assertEqual(res.status, DuplicateStatus.DUPLICATE_DETECTED)
        self.assertEqual(res.details["date_gap_days"], 7.0)

    # --- 2. EXACT BOUNDARY REJECTIONS (NO_MATCH) ---
    def test_text_below_95_no_trigger(self):
        p2 = self.p2_base.copy()
        # Substantially different description to force text_sim < 0.95
        p2["project_description"] = "Building a completely new water tank system in village"
        res = DuplicateEngine.evaluate_pair(self.p1_base, p2)
        self.assertEqual(res.status, DuplicateStatus.NO_MATCH)
        self.assertEqual(res.reason_code, "TEXT_SIMILARITY_BELOW_THRESHOLD")

    def test_amount_difference_above_2_percent_no_trigger(self):
        p2 = self.p2_base.copy()
        p2["sanctioned_amount"] = 1500000 # 50% difference
        res = DuplicateEngine.evaluate_pair(self.p1_base, p2)
        self.assertEqual(res.status, DuplicateStatus.NO_MATCH)
        self.assertEqual(res.reason_code, "FINANCIAL_DELTA_EXCEEDS_THRESHOLD")

    def test_date_gap_above_7_days_no_trigger(self):
        p2 = self.p2_base.copy()
        p2["start_date"] = "2026-05-15" # 14 days difference
        res = DuplicateEngine.evaluate_pair(self.p1_base, p2)
        self.assertEqual(res.status, DuplicateStatus.NO_MATCH)
        self.assertEqual(res.reason_code, "TEMPORAL_GAP_EXCEEDS_THRESHOLD")

    def test_different_location_no_trigger(self):
        p2 = self.p2_base.copy()
        p2["location_id"] = "LOC999"
        res = DuplicateEngine.evaluate_pair(self.p1_base, p2)
        self.assertEqual(res.status, DuplicateStatus.NO_MATCH)
        self.assertEqual(res.reason_code, "DIFFERENT_LOCATION")

    # --- 3. DATA QUALITY & EDGE GUARDS (NOT_EVALUABLE) ---
    def test_missing_required_field(self):
        p2 = self.p2_base.copy()
        del p2["sanctioned_amount"]
        res = DuplicateEngine.evaluate_pair(self.p1_base, p2)
        self.assertEqual(res.status, DuplicateStatus.NOT_EVALUABLE)
        self.assertEqual(res.reason_code, "DQ_MISSING_FIELD_SANCTIONED_AMOUNT")

    def test_invalid_date_format(self):
        p2 = self.p2_base.copy()
        p2["start_date"] = "NOT_A_DATE"
        res = DuplicateEngine.evaluate_pair(self.p1_base, p2)
        self.assertEqual(res.status, DuplicateStatus.NOT_EVALUABLE)
        self.assertEqual(res.reason_code, "DQ_DATE_PARSE_ERROR")

    # --- 4. GOVERNANCE: METADATA BLINDNESS ---
    def test_engine_is_blind_to_duplicate_group_id(self):
        p1 = self.p1_base.copy()
        p2 = self.p2_base.copy()
        
        # Inject entirely mismatched ground-truth metadata
        p1["duplicate_group_id"] = "GROUP_A"
        p2["duplicate_group_id"] = "GROUP_B"
        
        # The engine must still evaluate strictly on the features (text, amount, date, loc)
        # Because the features are identical, it MUST return DUPLICATE_DETECTED regardless of group_id
        res = DuplicateEngine.evaluate_pair(p1, p2)
        self.assertEqual(res.status, DuplicateStatus.DUPLICATE_DETECTED)

if __name__ == '__main__':
    unittest.main()