"""
test_production_inference.py
Phase 4.5 — 8-Gate Production Acceptance Suite.
All gates must pass before the bundle is cleared for MERN integration.
"""
import hashlib
import json
import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))

from app import app

BUNDLE_DIR = os.environ.get(
    "BUNDLE_DIR",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../production_bundle")),
)

# ------------------------------------------------------------------
# Session-scoped client fixture (triggers startup event)
# ------------------------------------------------------------------
@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


# ------------------------------------------------------------------
# Shared test data
# ------------------------------------------------------------------
NORMAL_PROJECT = {
    "project_id": "TEST-001",
    "sanctioned_amount": 500000,
    "expenditure": 250000,
    "physical_progress_pct": 50.0,
    "project_age_days": 180,
    "expected_duration_days": 365,
    "elapsed_duration_days": 180,
    "num_payments": 5,
    "total_mp_allocation": 5000000,
    "total_mp_expenditure": 2500000,
    "peer_median_cost": 480000,
    "work_type": "road",
    "status": "in_progress",
    "location_id": "LOC-A",
    "constituency": "CONST-1",
    "project_description": "Construction of road in sector 5",
    "start_date": "2024-01-01",
}

PROG01_PROJECT = {
    **NORMAL_PROJECT,
    "project_id": "TEST-PROG01",
    # fin_pct = 90%, physical = 30% -> gap = 60 -> PROG-01 TRIGGERED
    "expenditure": 450000,
    "physical_progress_pct": 30.0,
    "project_age_days": 90,
}

DUPLICATE_PEER = {
    **NORMAL_PROJECT,
    "project_id": "PEER-001",
}


# ------------------------------------------------------------------
# Gate 1: Health Check
# ------------------------------------------------------------------
def test_gate_1_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


# ------------------------------------------------------------------
# Gate 2: Manifest Integrity
# ------------------------------------------------------------------
def test_gate_2_manifest_integrity():
    manifest_path = os.path.join(BUNDLE_DIR, "MANIFEST.json")
    assert os.path.exists(manifest_path), "MANIFEST.json must exist in production_bundle"

    with open(manifest_path) as f:
        manifest = json.load(f)

    for rel_path, meta in manifest["files"].items():
        abs_path = os.path.join(BUNDLE_DIR, rel_path.replace("/", os.sep))
        assert os.path.exists(abs_path), f"Bundle file missing: {rel_path}"
        h = hashlib.sha256()
        with open(abs_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        assert h.hexdigest() == meta["sha256"], f"Hash mismatch: {rel_path}"


# ------------------------------------------------------------------
# Gate 3: Scoring Config Validity
# ------------------------------------------------------------------
def test_gate_3_scoring_config_validity():
    threshold_path = os.path.join(BUNDLE_DIR, "scoring", "threshold.json")
    assert os.path.exists(threshold_path)
    with open(threshold_path) as f:
        cfg = json.load(f)
    val = cfg.get("threshold_value", cfg.get("exact_threshold"))
    assert isinstance(val, float), "Threshold must be a float"


# ------------------------------------------------------------------
# Gate 4: Artifact Existence
# ------------------------------------------------------------------
def test_gate_4_artifact_existence():
    required = [
        os.path.join("model", "isolation_forest.joblib"),
        os.path.join("preprocessing", "scaler.joblib"),
        os.path.join("preprocessing", "imputer.joblib"),
        os.path.join("preprocessing", "encoder.joblib"),
        os.path.join("scoring", "threshold.json"),
        os.path.join("schemas", "feature_schema.json"),
        os.path.join("duplicate", "duplicate_engine_frozen_spec.json"),
        os.path.join("rules", "utilization_calibration_report.json"),
        "MANIFEST.json",
    ]
    for rel in required:
        assert os.path.exists(os.path.join(BUNDLE_DIR, rel)), f"Missing: {rel}"


# ------------------------------------------------------------------
# Gate 5: Normal Project Inference
# ------------------------------------------------------------------
def test_gate_5_normal_project_inference(client):
    resp = client.post(
        "/api/v1/risk/analyze",
        json={"project": NORMAL_PROJECT, "candidate_peers": []},
    )
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    body = resp.json()
    assert "risk_score" in body
    assert "risk_band" in body
    assert "aggregation" in body
    assert "engines" in body
    assert "risk_drivers" in body
    assert 0.0 <= body["risk_score"] <= 100.0


# ------------------------------------------------------------------
# Gate 6: PROG-01 Governance Floor (>= 85)
# ------------------------------------------------------------------
def test_gate_6_prog01_governance_floor(client):
    resp = client.post(
        "/api/v1/risk/analyze",
        json={"project": PROG01_PROJECT, "candidate_peers": []},
    )
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    body = resp.json()
    assert body["risk_score"] >= 85, (
        f"PROG-01 floor not applied: risk_score={body['risk_score']}"
    )
    assert body["risk_band"] in ("CRITICAL", "HIGH")


# ------------------------------------------------------------------
# Gate 7: Duplicate Override (== 100)
# ------------------------------------------------------------------
def test_gate_7_duplicate_override(client):
    resp = client.post(
        "/api/v1/risk/analyze",
        json={"project": NORMAL_PROJECT, "candidate_peers": [DUPLICATE_PEER]},
    )
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    body = resp.json()
    assert body["risk_score"] == 100.0, (
        f"Duplicate override not applied: risk_score={body['risk_score']}"
    )
    assert body["risk_band"] == "CRITICAL"
    assert body["engines"]["duplicate"]["status"] == "DUPLICATE_DETECTED"


# ------------------------------------------------------------------
# Gate 8: Fail-Closed on Missing Keys (HTTP 422)
# ------------------------------------------------------------------
def test_gate_8_fail_closed_missing_keys(client):
    resp = client.post("/api/v1/risk/analyze", json={})
    assert resp.status_code == 422, (
        f"Expected 422 for missing 'project' key, got {resp.status_code}"
    )
