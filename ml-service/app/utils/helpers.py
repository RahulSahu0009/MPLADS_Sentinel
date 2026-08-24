"""
IMPLEMENTATION PROMPT
FILE: ml-service/app/utils/helpers.py
PURPOSE:
Provide utility functions for numeric sanitization and model-safe value handling.

PROJECT CONTEXT:
The ML pipeline must handle missing, null, or malformed values gracefully.

TECHNOLOGIES:
Python

INPUTS:
- Numeric and optional values

OUTPUTS:
- Safe numeric values or defaults

DEPENDENCIES:
- None

DATABASE DEPENDENCIES:
- None

API DEPENDENCIES:
- Used by feature engineering and predictor modules

BUSINESS RULES:
- Use deterministic defaults for missing or invalid input

ERROR HANDLING:
- Guard against non-numeric values cleanly

SECURITY REQUIREMENTS:
- Keep helper functions generic and safe

ACCEPTANCE CRITERIA:
- Feature engineering can rely on numeric sanitization utilities

WHAT NOT TO CHANGE:
- Do not add ML training code here

IMPLEMENTATION NOTES:
- Keep the helper set small and reusable
"""


def safe_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)
