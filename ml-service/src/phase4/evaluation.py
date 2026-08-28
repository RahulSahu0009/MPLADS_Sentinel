import numpy as np
import pandas as pd
from sklearn.metrics import precision_recall_curve, roc_auc_score, auc, f1_score, confusion_matrix, average_precision_score, ConfusionMatrixDisplay
import matplotlib.pyplot as plt

# EXPLICIT AUTHORITATIVE MAPPING based on Frozen Dataset V1.0 generation semantics
FROZEN_V1_ANOMALY_MAPPING = {
    'combined_anomaly': ['cost_overrun', 'project_delay']
}

class Evaluator:
    @staticmethod
    def compute_metrics(y_true: np.ndarray, ml_anomaly_scores: np.ndarray, alert_flags: np.ndarray, k_percentages: list) -> dict:
        metrics = {}
        try:
            metrics['ROC_AUC'] = roc_auc_score(y_true, ml_anomaly_scores)
            metrics['Average_Precision'] = average_precision_score(y_true, ml_anomaly_scores)
            precision, recall, _ = precision_recall_curve(y_true, ml_anomaly_scores)
            metrics['PR_AUC'] = auc(recall, precision)
        except ValueError:
            metrics['ROC_AUC'] = metrics['Average_Precision'] = metrics['PR_AUC'] = None
            
        tn, fp, fn, tp = confusion_matrix(y_true, alert_flags, labels=[0, 1]).ravel()
        metrics['F1_Score'] = f1_score(y_true, alert_flags)
        metrics['Global_Precision'] = tp / (tp + fp) if (tp + fp) > 0 else 0
        metrics['Global_Recall'] = tp / (tp + fn) if (tp + fn) > 0 else 0
        metrics['FPR'] = fp / (fp + tn) if (fp + tn) > 0 else 0
        metrics['FNR'] = fn / (fn + tp) if (fn + tp) > 0 else 0
        
        sorted_indices = np.argsort(ml_anomaly_scores)[::-1] 
        y_true_sorted = y_true[sorted_indices]
        
        for k_pct in k_percentages:
            k = max(1, int(np.ceil(len(y_true) * (k_pct / 100.0))))
            top_k_y = y_true_sorted[:k]
            tp_k = np.sum(top_k_y)
            total_anomalies = np.sum(y_true)
            metrics[f'Precision_at_{k_pct}pct'] = tp_k / k
            metrics[f'Recall_at_{k_pct}pct'] = tp_k / total_anomalies if total_anomalies > 0 else 0
            
        return metrics

    @staticmethod
    def compute_typology_metrics(y_true: np.ndarray, alert_flags: np.ndarray, anomaly_types: np.ndarray) -> dict:
        """
        Calculates Support and Recall per Anomaly Type.
        Unpacks 'combined_anomaly' deterministically based on FROZEN_V1_ANOMALY_MAPPING.
        """
        metrics = {}
        df = pd.DataFrame({'y_true': y_true, 'alert': alert_flags, 'type': anomaly_types})
        anomalies_only = df[df['y_true'] == 1]
        
        base_types = [t for t in anomalies_only['type'].unique() if t != 'combined_anomaly']
        
        # Ensure combined_anomaly is evaluated on its own too, if present in mapping mapping
        all_types = list(base_types)
        if 'combined_anomaly' not in all_types and 'combined_anomaly' in FROZEN_V1_ANOMALY_MAPPING:
            all_types.append('combined_anomaly')
            
        for typ in all_types:
            if typ in ['cost_overrun', 'project_delay']:
                compound_matches = [comp for comp, constituents in FROZEN_V1_ANOMALY_MAPPING.items() if typ in constituents]
                subset = anomalies_only[anomalies_only['type'].isin([typ] + compound_matches)]
            else:
                subset = anomalies_only[anomalies_only['type'] == typ]
                
            support = len(subset)
            recall = subset['alert'].sum() / support if support > 0 else 0
            metrics[f'Support_{typ}'] = support
            metrics[f'Recall_{typ}'] = recall
            
        return metrics

    @staticmethod
    def plot_score_distribution(y_true, ml_anomaly_scores, threshold, path):
        plt.figure(figsize=(10, 6))
        plt.hist(ml_anomaly_scores[y_true == 0], bins=50, alpha=0.5, color='green', label='Normal', density=True)
        plt.hist(ml_anomaly_scores[y_true == 1], bins=50, alpha=0.5, color='red', label='Anomaly', density=True)
        plt.axvline(threshold, color='black', linestyle='--', label=f'Threshold (Train-derived): {threshold:.2f}')
        plt.title("ML Anomaly Score Distribution (Colors represent ground truth for evaluation ONLY)")
        plt.xlabel("ML Anomaly Score (Higher = More Anomalous)")
        plt.legend()
        plt.savefig(path)
        plt.close()

    @staticmethod
    def plot_pr_curve(y_true, ml_anomaly_scores, path):
        precision, recall, _ = precision_recall_curve(y_true, ml_anomaly_scores)
        plt.figure(figsize=(8, 6))
        plt.plot(recall, precision, marker='.', label='Isolation Forest')
        plt.title('Precision-Recall Curve')
        plt.xlabel('Recall')
        plt.ylabel('Precision')
        plt.legend()
        plt.savefig(path)
        plt.close()

    @staticmethod
    def plot_confusion_matrix(y_true, alert_flags, path):
        cm = confusion_matrix(y_true, alert_flags, labels=[0, 1])
        disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=['Normal', 'Anomaly'])
        disp.plot(cmap=plt.cm.Blues)
        plt.title('Confusion Matrix')
        plt.savefig(path)
        plt.close()