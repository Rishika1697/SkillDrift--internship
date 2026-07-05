# SkillDrift — making the dashboard real

This adds a real backend + two real ML/statistics components to the
existing `craft-care-compass` / `SkillDrift--internship` frontend, which
currently only shows hardcoded mock data.

## What's included

```
backend/
  requirements.txt
  README.md                         <- you are here
  app/
    main.py                         <- FastAPI app, all endpoints
    ml/
      drift_detection.py            <- EWMA + CUSUM skill-drift detector
      defect_prediction.py          <- Random Forest defect-risk classifier
    data/
      schema.md                     <- exact CSV column formats expected

frontend-integration/
  api-client.ts                     <- drop into src/lib/, replaces mock-data fetch calls
  example-index-with-real-data.tsx  <- shows the pattern for wiring a route to live data
```

## The two algorithms, in plain terms

**1. Drift detection — EWMA + CUSUM control charts**
This is classical statistical process control (used in manufacturing QA
for decades), not a trained model — which is actually a plus for a
factory tool: it's transparent and auditable.
- Each worker/skill gets its *own* baseline (mean + std dev) from their
  first ~7 days of scores.
- EWMA smooths daily noise and flags when the smoothed value drifts
  >1/2/3 standard deviations from baseline → watch/drift/critical.
- CUSUM separately accumulates small persistent deviations, catching
  *slow creeping* drift that EWMA's snapshot z-score can miss.

**2. Defect-risk prediction — Random Forest classifier**
This one *is* trained on your historical data (`scikit-learn`,
`RandomForestClassifier`). It takes a worker's skill scores + process
variance features + station/shift and predicts the probability their
next unit is linked to a defect. Random Forest was chosen because it
handles mixed numeric/categorical factory data well without heavy
preprocessing, and gives feature importances so you can explain *why*
a risk score is high (useful for supervisors, not just a black box).

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Check it's alive: http://localhost:8000/api/health

## Load your real data

1. Reshape your CSV/Excel files to match `app/data/schema.md`.
   (Ask me for help here — paste a few sample rows of your actual files
   and I'll write a small pandas conversion script for you.)
2. Upload skill history:
   ```bash
   curl -F "file=@skill_history.csv" http://localhost:8000/api/upload/skill-history
   ```
3. Train the defect model:
   ```bash
   curl -F "file=@defect_training_data.csv" http://localhost:8000/api/upload/defect-training-data
   ```
   This returns the model's AUC score and top predictive features —
   share that output with me and I can help you interpret/improve it.

## Wire up the frontend

1. Copy `frontend-integration/api-client.ts` into your repo at
   `src/lib/api-client.ts`.
2. Add to your `.env`: `VITE_API_BASE=http://localhost:8000`
3. In each route (`src/routes/index.tsx`, `fingerprint.tsx`, `alerts.tsx`,
   `roi.tsx`), replace the imports from `mock-data.ts` (the `WORKERS`,
   `ALERTS`, etc. arrays) with calls to `getAllDrift()` /
   `predictDefectRisk()` from `api-client.ts`, inside a `useEffect` +
   `useState` (see `example-index-with-real-data.tsx`).
4. Keep `SKILLS` and `STATUS_META` from `mock-data.ts` — those are just
   static UI config, not fake data, so no need to replace them.

## Suggested order of work

1. Get the backend running and hitting `/api/health`.
2. Get your skill-history CSV into the shape in `schema.md` and confirm
   `/api/drift` returns sensible results for a couple of workers.
3. Swap just the heatmap page (`index.tsx`) over to live data first —
   easiest to verify visually.
4. Do the same for `fingerprint.tsx` (per-worker drill-down).
5. Get defect training data in shape, train, check the AUC is
   meaningfully above 0.5 before trusting `roi.tsx` / `alerts.tsx` numbers.
6. Only then remove `mock-data.ts`'s fake arrays entirely.

## Notes / limitations to be upfront about

- Storage is in-memory right now (resets when the server restarts) —
  fine for a demo/internship deliverable, but swap for SQLite/Postgres
  before anything resembling production.
- No auth on the API yet — add before deploying anywhere public.
- The defect model needs a reasonable number of positive (defect) examples
  to learn anything meaningful — if defects are very rare in your data,
  say so and we can adjust (e.g. SMOTE oversampling, or reframe as
  anomaly detection instead of classification).
