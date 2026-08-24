"""
IMPLEMENTATION PROMPT
FILE: ml-service/app/schemas/project_features.py
PURPOSE:
Define the Pydantic schema for project feature inputs consumed by the ML service.

PROJECT CONTEXT:
Project features are built from financial, progress, and schedule signals to support anomaly scoring.

TECHNOLOGIES:
Python, Pydantic

INPUTS:
- Project metrics and context fields

OUTPUTS:
- Validated feature object for model inference

DEPENDENCIES:
- pydantic

DATABASE DEPENDENCIES:
- None directly

API DEPENDENCIES:
- Used by the predict route

BUSINESS RULES:
- Numeric fields must be validated and non-null when required

ERROR HANDLING:
- Raise validation errors for missing or malformed fields

SECURITY REQUIREMENTS:
- Keep schema contracts explicit and lightweight

ACCEPTANCE CRITERIA:
- Feature schema matches the backend ML payload contract

WHAT NOT TO CHANGE:
- Do not include training logic here

IMPLEMENTATION NOTES:
- Keep future feature engineering aligned with the schema
"""

from pydantic import BaseModel


class ProjectFeatures(BaseModel):
    project_id: str | None = None
    sanctioned_amount: float | None = None
    expenditure: float | None = None
    utilization_ratio: float | None = None
    schedule_slippage_days: float | None = None
    progress_percent: float | None = None
    delay_flag: int | None = None
