import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyDetectorIF:
    def __init__(self, contamination: float = 0.11, random_state: int = 42, **kwargs):
        """
        Initializes the Isolation Forest.
        Note: contamination here is an algorithm parameter, NOT the operational alert threshold.
        """
        self.model = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_jobs=-1,
            **kwargs
        )
        
    def fit(self, X: np.ndarray):
        self.model.fit(X)
        return self
        
    def predict_scores(self, X: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """
        Returns exactly two distinct quantities:
        1. if_score: Raw decision function (lower = anomalous)
        2. ml_anomaly_score: Inverted score (higher = anomalous). NOT a probability.
        """
        if_score = self.model.decision_function(X)
        ml_anomaly_score = -if_score
        return if_score, ml_anomaly_score