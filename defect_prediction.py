"""
Defect-risk prediction: a supervised classifier that estimates the
probability a given worker/station/shift combination produces a
defect in the near term, based on skill + process features.

Model: RandomForestClassifier (scikit-learn).
Why Random Forest for this: tabular, mixed-scale features (skill scores,
variances, tenure, categorical station/shift), no need for heavy feature
scaling, robust to outliers, and gives feature_importances_ for
explainability (important for a factory-floor tool people need to trust).

Expected training data columns (adjust to match your real CSV):
  worker_id, station, shift, tenure_years,
  weld_precision, torque_control, qc_inspection, cycle_timing,
  tool_handling, safety_protocol,
  torque_variance, cycle_time_std, arc_time_variance,
  defect_occurred   <- label: 1 if a defect was linked to this record, else 0
"""

from dataclasses import dataclass
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

NUMERIC_FEATURES = [
    "tenure_years", "weld_precision", "torque_control", "qc_inspection",
    "cycle_timing", "tool_handling", "safety_protocol",
    "torque_variance", "cycle_time_std", "arc_time_variance",
]
CATEGORICAL_FEATURES = ["station", "shift"]
LABEL_COL = "defect_occurred"


@dataclass
class TrainResult:
    auc: float
    report: str
    feature_importances: dict


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ],
        remainder="passthrough",  # numeric features pass through untouched
    )
    clf = RandomForestClassifier(
        n_estimators=300,
        max_depth=8,
        min_samples_leaf=5,
        class_weight="balanced",  # defects are usually rare -> avoid majority bias
        random_state=42,
        n_jobs=-1,
    )
    return Pipeline([("preprocess", preprocessor), ("clf", clf)])


def train(df: pd.DataFrame, model_path: str = "app/ml/defect_model.joblib") -> TrainResult:
    missing = [c for c in NUMERIC_FEATURES + CATEGORICAL_FEATURES + [LABEL_COL] if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[LABEL_COL].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipe = build_pipeline()
    pipe.fit(X_train, y_train)

    proba = pipe.predict_proba(X_test)[:, 1]
    preds = pipe.predict(X_test)
    auc = roc_auc_score(y_test, proba)
    report = classification_report(y_test, preds)

    # Feature importances (mapped back to original names as best-effort)
    ohe = pipe.named_steps["preprocess"].named_transformers_["cat"]
    cat_names = list(ohe.get_feature_names_out(CATEGORICAL_FEATURES))
    all_names = cat_names + NUMERIC_FEATURES
    importances = pipe.named_steps["clf"].feature_importances_
    fi = dict(sorted(zip(all_names, importances.tolist()), key=lambda x: -x[1]))

    joblib.dump(pipe, model_path)
    return TrainResult(auc=round(float(auc), 4), report=report, feature_importances=fi)


def load_model(model_path: str = "app/ml/defect_model.joblib") -> Pipeline:
    return joblib.load(model_path)


def predict_risk(pipe: Pipeline, records: list[dict]) -> list[dict]:
    """
    records: list of dicts with the same feature columns used in training
             (minus the label).
    Returns each record with an added `defect_risk` probability (0-1).
    """
    df = pd.DataFrame(records)
    proba = pipe.predict_proba(df[NUMERIC_FEATURES + CATEGORICAL_FEATURES])[:, 1]
    out = []
    for rec, p in zip(records, proba):
        out.append({**rec, "defect_risk": round(float(p), 4)})
    return out
