import pytest
from fastapi.testclient import TestClient
import json
import os

# Note: Once MJ creates the FastAPI app in app.main, we will import it here:
# from app.main import app

# Mock app for scaffolding purposes to ensure pytest doesn't crash before MJ implements it.
from fastapi import FastAPI
app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def synthetic_projects():
    # Load synthetic projects from the data directory for testing
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, "../../data/synthetic/synthetic_projects.json")
    try:
        with open(data_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []
