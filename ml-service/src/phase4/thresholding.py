import numpy as np
import json
from typing import Dict, Any

class ThresholdManager:
    def __init__(self):
        self.threshold_value: float = None
        self.metadata: Dict[str, Any] = {}

    def _validate_inputs(self, scores: np.ndarray, check_alpha: float = None):
        if check_alpha is not None and not (0 < check_alpha < 1):
            raise ValueError("Alpha must be strictly between 0 and 1.")
        scores = np.asarray(scores, dtype=float)
        if scores.size == 0:
            raise ValueError("Score array is empty.")
        if not np.all(np.isfinite(scores)):
            raise ValueError("Score array contains non-finite values (NaN or Inf).")
        return scores

    def fit(self, ml_anomaly_scores_train: np.ndarray, alpha: float, experiment_id: str):
        """
        Fits the operational threshold: T = quantile(train_scores, 1 - alpha).
        alpha = Investigation budget (e.g., 0.10 for top 10%).
        """
        ml_anomaly_scores_train = self._validate_inputs(ml_anomaly_scores_train, alpha)
        
        self.threshold_value = float(np.quantile(ml_anomaly_scores_train, 1 - alpha))
        self.metadata = {
            "method": "train_quantile",
            "quantile": 1 - alpha,
            "alpha": alpha,
            "exact_threshold": self.threshold_value,
            "experiment_id": experiment_id,
            "training_row_count": len(ml_anomaly_scores_train)
        }
        return self
        
    def fit_oracle_clean(self, ml_anomaly_scores_train_normal: np.ndarray, alpha: float, experiment_id: str, mode: str):
        """ Specialized fit for Exp B: Supports both 'diagnostic' and 'operational' modes. """
        ml_anomaly_scores_train_normal = self._validate_inputs(ml_anomaly_scores_train_normal, alpha)
        
        self.threshold_value = float(np.quantile(ml_anomaly_scores_train_normal, 1 - alpha))
        self.metadata = {
            "method": f"oracle_clean_train_quantile_{mode}",
            "quantile": 1 - alpha,
            "alpha": alpha,
            "exact_threshold": self.threshold_value,
            "experiment_id": experiment_id,
            "training_row_count": len(ml_anomaly_scores_train_normal)
        }
        return self

    def predict_alerts(self, ml_anomaly_scores: np.ndarray) -> np.ndarray:
        """ Returns binary alert flags (1 = Alert, 0 = Normal). """
        if self.threshold_value is None:
            raise RuntimeError("ThresholdManager must be fitted before predicting.")
        # Validate inference scores
        ml_anomaly_scores = self._validate_inputs(ml_anomaly_scores)
        return (ml_anomaly_scores >= self.threshold_value).astype(int)

    def save_threshold(self, filepath: str):
        with open(filepath, 'w') as f:
            json.dump(self.metadata, f, indent=4)