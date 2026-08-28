import os
import joblib
import mlflow
from mlflow.tracking import MlflowClient

# Connect using the exact absolute URI that worked for you earlier
URI = "sqlite:///C:/Users/smrit/OneDrive/Desktop/SIH%20MPLADS/src/mlflow.db"
mlflow.set_tracking_uri(URI)

print(f"✅ Connected to MLflow Database at: {URI}")
client = MlflowClient()

# Automatically find Experiment C
experiment = client.get_experiment_by_name("Experiment_C_Production_Benchmark")
if experiment is None:
    print("❌ Experiment not found! Please check the DB path.")
    exit(1)

# Automatically get the LATEST Run ID
runs = client.search_runs(experiment.experiment_id, order_by=["start_time DESC"], max_results=1)
if not runs:
    print("❌ No runs found in Experiment C.")
    exit(1)

latest_run_id = runs[0].info.run_id
print(f"✅ Found Latest Run ID: {latest_run_id}")

# Extract the Model
root_dir = os.path.abspath(os.path.join(os.getcwd(), ".."))
artifacts_dir = os.path.join(root_dir, "artifacts")
dest_model = os.path.join(artifacts_dir, "isolation_forest.joblib")
os.makedirs(artifacts_dir, exist_ok=True)

try:
    artifacts = client.list_artifacts(latest_run_id)
    model_artifact_path = "model"
    for a in artifacts:
        if a.is_dir and ("model" in a.path.lower() or "detector" in a.path.lower()):
            model_artifact_path = a.path

    print(f"Downloading model natively from '{model_artifact_path}'...")
    model_uri = f"runs:/{latest_run_id}/{model_artifact_path}"
    
    loaded_model = mlflow.sklearn.load_model(model_uri)
    
    if hasattr(loaded_model, 'model'):
        loaded_model = loaded_model.model
        
    joblib.dump(loaded_model, dest_model)
    print(f"✅ EXACT EXP C MODEL EXTRACTED AND LOCKED AT: {dest_model}")
    
except Exception as e:
    print(f"❌ Failed to extract model natively: {e}")