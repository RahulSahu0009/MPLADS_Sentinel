# Official Data

Store official MPLADS extracts here.

## Expected minimum columns

- `external_id`
- `title`
- `state_name`
- `district_name`
- `constituency_name`
- `status`
- `sanctioned_amount`
- `total_expenditure`
- `start_date`
- `expected_completion_date`

## Required checks before import

- Null checks on identifiers and amounts
- Non-negative numeric checks
- Date parse checks
- Provenance notes captured in commit/PR
