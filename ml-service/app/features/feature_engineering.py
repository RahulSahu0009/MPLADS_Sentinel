"""
IMPLEMENTATION PROMPT
FILE: ml-service/app/features/feature_engineering.py
PURPOSE:
Build and transform project metrics into feature vectors for model inference.

PROJECT CONTEXT:
The ML service must transform raw project values into a standardized feature set suitable for anomaly logic.

TECHNOLOGIES:
Python, NumPy or pandas

INPUTS:
- Raw project metadata and financial/progress values

OUTPUTS:
- Feature vector dictionary or DataFrame

DEPENDENCIES:
- pandas
- numpy

DATABASE DEPENDENCIES:
- None directly

API DEPENDENCIES:
- Called by ML service prediction handlers

BUSINESS RULES:
- Features must remain explainable and consistent with the backend schema
- Null or missing values should be handled deterministically

ERROR HANDLING:
- Return safe, sanitized feature values for invalid input

SECURITY REQUIREMENTS:
- Avoid leaking sensitive project details beyond the required feature set

ACCEPTANCE CRITERIA:
- The module exposes a reusable feature-building function

WHAT NOT TO CHANGE:
- Do not include the model itself here

IMPLEMENTATION NOTES:
- Keep this module well-scoped and composable for training and inference
"""


def build_feature_vector(project_record):
    return {
        'project_id': project_record.get('project_id'),
        'sanctioned_amount': project_record.get('sanctioned_amount', 0),
        'expenditure': project_record.get('expenditure', 0),
        'utilization_ratio': project_record.get('utilization_ratio', 0),
        'schedule_slippage_days': project_record.get('schedule_slippage_days', 0),
        'progress_percent': project_record.get('progress_percent', 0),
        'delay_flag': project_record.get('delay_flag', 0),
    }
