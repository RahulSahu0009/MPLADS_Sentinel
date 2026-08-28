import pytest

def test_health_check(client):
    """
    Contract test: The ML service must expose a /health endpoint.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

@pytest.mark.skip(reason="Awaiting MJ's implementation of /predict endpoint")
def test_predict_valid_payload(client, synthetic_projects):
    """
    Contract test: The /predict endpoint must accept a valid project feature payload
    and return an anomaly score, a boolean prediction, and an evidence string.
    """
    if not synthetic_projects:
        pytest.skip("Synthetic data not found.")
        
    # Extract features from a synthetic project (simulate feature engineering)
    project = synthetic_projects[0]
    payload = {
        "project_id": project["id"],
        "sanctioned_amount": float(project["sanctionedAmount"]),
        "total_expenditure": float(project["totalExpenditure"]),
        "progress_percentage": float(project["progressPercentage"]),
        "is_delayed": False,
        "cost_overrun_ratio": 0.0
    }
    
    response = client.post("/predict", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "anomaly_score" in data
    assert "is_anomaly" in data
    assert "model_version" in data

@pytest.mark.skip(reason="Awaiting MJ's implementation of /predict endpoint")
def test_predict_missing_fields(client):
    """
    Contract test: The /predict endpoint must return a 422 Validation Error
    if required fields are missing from the payload.
    """
    payload = {
        "project_id": "proj-123"
        # missing other required features
    }
    
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
