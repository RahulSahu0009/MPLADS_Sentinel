import os
import joblib
import mlflow
from mlflow.tracking import MlflowClient

RUN_ID = "a4a13b5c0862471d8bd17fc8f194f42d"
# The exact URI that we know works!
URI = "sqlite:///C:/Users/smrit/OneDrive/Desktop/SIH%20MPLADS/src/mlflow.db"
mlflow.set_tracking_uri(URI)

root_dir = os.path.abspath(os.path.join(os.getcwd(), ".."))
artifacts_dir = os.path.join(root_dir, "artifacts")
dest_model = os.path.join(artifacts_dir, "isolation_forest.joblib")

print(f"✅ Connected to MLflow Database at: {URI}")

try:
    client = MlflowClient()
    artifacts = client.list_artifacts(RUN_ID)
    
    print("\n🔍 Artifacts found in this Run:")
    model_artifact_path = "model" # default mlflow path
    for a in artifacts:
        print(f" - {a.path} (dir: {a.is_dir})")
        if a.is_dir and ("model" in a.path.lower() or "detector" in a.path.lower()):
            model_artifact_path = a.path

    print(f"\nDownloading and loading model natively from '{model_artifact_path}'...")
    model_uri = f"runs:/{RUN_ID}/{model_artifact_path}"
    
    # Let MLflow handle all the internal file structures natively
    loaded_model = mlflow.sklearn.load_model(model_uri)
    
    # Unwrap from our custom class if necessary
    if hasattr(loaded_model, 'model'):
        loaded_model = loaded_model.model
        
    # Lock the raw sklearn Isolation Forest into the artifacts vault
    joblib.dump(loaded_model, dest_model)
    print(f"✅ EXACT EXP C MODEL EXTRACTED AND LOCKED AT: {dest_model}")
    
except Exception as e:
    print(f"❌ Failed to extract model natively: {e}")