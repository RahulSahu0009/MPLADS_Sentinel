import mlflow
import json
import numpy as np
import platform
import sklearn
import mlflow.sklearn

class ExperimentLogger:
    def __init__(self, experiment_name: str):
        mlflow.set_experiment(experiment_name)

    def start_run(self, run_name: str):
        return mlflow.start_run(run_name=run_name)

    def log_config(self, config_dict: dict, filename: str = "experiment_config.json"):
        with open(filename, 'w') as f:
            json.dump(config_dict, f, indent=4)
        mlflow.log_artifact(filename)

    def log_metrics(self, metrics: dict):
        float_metrics = {k: float(v) for k, v in metrics.items() if isinstance(v, (int, float, np.number))}
        mlflow.log_metrics(float_metrics)

    def log_provenance_and_env(self, provenance_meta: dict, filename: str = "provenance.json"):
        env_meta = {
            "python_version": platform.python_version(),
            "sklearn_version": sklearn.__version__,
            "numpy_version": np.__version__,
            "mlflow_version": mlflow.__version__
        }
        combined_meta = {**provenance_meta, **env_meta}
        with open(filename, 'w') as f:
            json.dump(combined_meta, f, indent=4)
        mlflow.log_artifact(filename)

    def log_threshold(self, threshold_path: str):
        mlflow.log_artifact(threshold_path)

    def log_model(self, detector, artifact_path: str = "model"):
        # Pass the path positionally to bypass the deprecated keyword warning
        mlflow.sklearn.log_model(detector.model, artifact_path)

    def log_figure(self, local_path: str):
        mlflow.log_artifact(local_path)