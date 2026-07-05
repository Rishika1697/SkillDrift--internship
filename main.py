"""
SkillDrift backend API.

Run locally:
    cd backend
    python -m venv venv && source venv/bin/activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8000

Then the React frontend (currently reading src/lib/mock-data.ts) can
instead call http://localhost:8000/api/... for real data.
"""

import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.ml.drift_detection import detect_drift_batch
from app.ml import defect_prediction as dp

app = FastAPI(title="SkillDrift API")

# Allow the Vite dev server (default port 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache for demo purposes; swap for a real DB (Postgres/SQLite) later
_state = {"skill_history_df": None, "defect_model": None}


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------- 1. Upload real data ----------

@app.post("/api/upload/skill-history")
async def upload_skill_history(file: UploadFile = File(...)):
    """
    Expects a CSV with columns: worker_id, skill, date, score
    (long format: one row per worker per skill per day)
    """
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    required = {"worker_id", "skill", "date", "score"}
    if not required.issubset(df.columns):
        raise HTTPException(400, f"CSV must contain columns: {sorted(required)}")
    _state["skill_history_df"] = df
    return {"rows_loaded": len(df), "workers": df["worker_id"].nunique(), "skills": df["skill"].nunique()}


@app.post("/api/upload/defect-training-data")
async def upload_defect_training_data(file: UploadFile = File(...)):
    """
    Expects a CSV with the columns listed in ml/defect_prediction.py
    (features + defect_occurred label). Trains and saves the model.
    """
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    try:
        result = dp.train(df)
    except ValueError as e:
        raise HTTPException(400, str(e))
    _state["defect_model"] = dp.load_model()
    return {
        "auc": result.auc,
        "top_features": dict(list(result.feature_importances.items())[:5]),
        "report": result.report,
    }


# ---------- 2. Drift detection (feeds the heatmap / fingerprint pages) ----------

@app.get("/api/drift")
def get_drift_results():
    df = _state["skill_history_df"]
    if df is None:
        raise HTTPException(400, "No skill history uploaded yet. POST /api/upload/skill-history first.")
    results = detect_drift_batch(df)
    return [r.__dict__ for r in results]


@app.get("/api/drift/{worker_id}")
def get_worker_drift(worker_id: str):
    df = _state["skill_history_df"]
    if df is None:
        raise HTTPException(400, "No skill history uploaded yet.")
    sub = df[df["worker_id"] == worker_id]
    if sub.empty:
        raise HTTPException(404, "Worker not found")
    results = detect_drift_batch(sub)
    return [r.__dict__ for r in results]


# ---------- 3. Defect risk prediction (feeds alerts / ROI pages) ----------

class PredictRequest(BaseModel):
    records: list[dict]


@app.post("/api/predict/defect-risk")
def predict_defect_risk(req: PredictRequest):
    model = _state["defect_model"]
    if model is None:
        try:
            model = dp.load_model()
            _state["defect_model"] = model
        except FileNotFoundError:
            raise HTTPException(400, "No trained model found. POST /api/upload/defect-training-data first.")
    return dp.predict_risk(model, req.records)
