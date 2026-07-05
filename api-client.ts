// Drop this into src/lib/api-client.ts in your existing frontend repo.
// It replaces the hardcoded arrays in src/lib/mock-data.ts with real
// calls to the FastAPI backend.

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export interface DriftResult {
  worker_id: string;
  skill: string;
  baseline_mean: number;
  baseline_std: number;
  latest_value: number;
  ewma_value: number;
  cusum_pos: number;
  cusum_neg: number;
  z_score: number;
  status: "ok" | "watch" | "drift" | "critical";
  triggered_by: "ewma" | "cusum" | "none";
  series: number[];
}

export interface DefectRiskRecord {
  worker_id: string;
  station: string;
  shift: string;
  defect_risk: number;
  [key: string]: unknown;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export function getAllDrift(): Promise<DriftResult[]> {
  return apiGet<DriftResult[]>("/api/drift");
}

export function getWorkerDrift(workerId: string): Promise<DriftResult[]> {
  return apiGet<DriftResult[]>(`/api/drift/${encodeURIComponent(workerId)}`);
}

export function predictDefectRisk(
  records: Record<string, unknown>[]
): Promise<DefectRiskRecord[]> {
  return apiPost<DefectRiskRecord[]>("/api/predict/defect-risk", { records });
}

export async function uploadSkillHistory(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload/skill-history`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadDefectTrainingData(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload/defect-training-data`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
