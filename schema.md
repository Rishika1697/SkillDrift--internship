# Expected CSV formats

Rename/reshape your real files to match these. If your columns are named
differently, either rename them in the CSV or adjust the column names at
the top of `app/ml/drift_detection.py` and `app/ml/defect_prediction.py`.

## 1. Skill history (for drift detection) — long format
One row per worker, per skill, per day.

| worker_id | skill          | date       | score |
|-----------|----------------|------------|-------|
| W-1000    | Weld Precision | 2026-06-01 | 91    |
| W-1000    | Weld Precision | 2026-06-02 | 89    |
| W-1000    | Torque Control | 2026-06-01 | 84    |

- `score` should be a 0-100 quality/competency score. If you only have raw
  sensor data (torque readings, cycle times), derive a daily score first,
  e.g. `score = 100 - normalized_deviation_from_spec`.
- Need at least ~9 days of history per worker/skill for the detector to
  produce a stable baseline (7-day baseline + a few days to compare).

## 2. Defect training data (for risk prediction) — one row per production record
| worker_id | station | shift | tenure_years | weld_precision | torque_control | qc_inspection | cycle_timing | tool_handling | safety_protocol | torque_variance | cycle_time_std | arc_time_variance | defect_occurred |
|-----------|---------|-------|--------------|-----------------|-----------------|----------------|--------------|----------------|-------------------|-------------------|------------------|---------------------|------------------|
| W-1002    | Bay 1   | A     | 3.2          | 78              | 82              | 85             | 90           | 88             | 95                | 0.14              | 1.8              | 0.22                | 1                |

- `defect_occurred`: 1 if this record is linked to a defect/quality escape, else 0.
- The more historical rows (thousands, ideally), the better the model.
- If your real column names differ, update `NUMERIC_FEATURES` /
  `CATEGORICAL_FEATURES` in `app/ml/defect_prediction.py`.
