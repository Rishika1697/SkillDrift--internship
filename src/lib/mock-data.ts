export type SkillStatus = "ok" | "watch" | "drift" | "critical";

export interface Worker {
  id: string;
  name: string;
  station: string;
  shift: "A" | "B" | "C";
  language: string;
  avatar: string;
  tenure: number; // years
  skills: Record<string, number>; // 0-100
  status: SkillStatus;
  trend: number[]; // last 14 days score
}

export const SKILLS = [
  "Weld Precision",
  "Torque Control",
  "QC Inspection",
  "Cycle Timing",
  "Tool Handling",
  "Safety Protocol",
];

const NAMES = [
  ["Ravi Kumar", "hi", "Bay 3 · MIG-04"],
  ["Mei Lin", "zh", "Line 2 · Torque-11"],
  ["Carlos Ortega", "es", "Bay 1 · MIG-02"],
  ["Aisha Bello", "en", "QC Cell · A"],
  ["Hiroshi Tanaka", "ja", "Line 4 · Assy-07"],
  ["Priya Shah", "hi", "Line 2 · Torque-08"],
  ["Lukas Weber", "de", "Bay 5 · TIG-01"],
  ["Fatima Noor", "ur", "QC Cell · B"],
  ["Diego Silva", "pt", "Line 3 · Assy-12"],
  ["Anh Nguyen", "vi", "Line 1 · Pack-04"],
  ["Olu Adeyemi", "en", "Bay 2 · MIG-06"],
  ["Sven Berg", "sv", "Line 4 · Assy-03"],
];

function seedRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const WORKERS: Worker[] = NAMES.map(([name, lang, station], i) => {
  const r = seedRand(i + 7);
  const skills: Record<string, number> = {};
  SKILLS.forEach((s) => (skills[s] = Math.round(55 + r() * 45)));
  const avg = Object.values(skills).reduce((a, b) => a + b, 0) / SKILLS.length;
  const status: SkillStatus =
    avg > 88 ? "ok" : avg > 78 ? "watch" : avg > 68 ? "drift" : "critical";
  const trend = Array.from({ length: 14 }, (_, k) =>
    Math.round(avg + Math.sin(k / 2 + i) * 6 + (r() - 0.5) * 8)
  );
  return {
    id: `W-${1000 + i}`,
    name,
    language: lang,
    station,
    shift: (["A", "B", "C"] as const)[i % 3],
    avatar: name.split(" ").map((n) => n[0]).join(""),
    tenure: +(1 + r() * 11).toFixed(1),
    skills,
    status,
    trend,
  };
});

export const STATUS_META: Record<SkillStatus, { label: string; color: string; bg: string; ring: string }> = {
  ok:       { label: "Stable",   color: "text-[color:var(--ok)]",   bg: "bg-[color:var(--ok)]",   ring: "ring-[color:var(--ok)]" },
  watch:    { label: "Watch",    color: "text-[color:var(--info)]", bg: "bg-[color:var(--info)]", ring: "ring-[color:var(--info)]" },
  drift:    { label: "Drift",    color: "text-[color:var(--warn)]", bg: "bg-[color:var(--warn)]", ring: "ring-[color:var(--warn)]" },
  critical: { label: "Critical", color: "text-[color:var(--crit)]", bg: "bg-[color:var(--crit)]", ring: "ring-[color:var(--crit)]" },
};

export interface Alert {
  id: string;
  workerId: string;
  workerName: string;
  skill: string;
  delta: number;
  station: string;
  severity: SkillStatus;
  signal: string;
  timestamp: string;
}

export const ALERTS: Alert[] = [
  { id: "A-2049", workerId: "W-1002", workerName: "Carlos Ortega", skill: "Weld Precision", delta: -14, station: "Bay 1 · MIG-02", severity: "critical", signal: "Arc-time variance ↑ 38% over last 4 shifts", timestamp: "2m ago" },
  { id: "A-2048", workerId: "W-1005", workerName: "Priya Shah", skill: "Torque Control", delta: -9, station: "Line 2 · Torque-08", severity: "drift", signal: "Torque overshoot on 7/120 units", timestamp: "14m ago" },
  { id: "A-2047", workerId: "W-1009", workerName: "Anh Nguyen", skill: "Cycle Timing", delta: -7, station: "Line 1 · Pack-04", severity: "drift", signal: "Cycle time σ ↑ from 1.2s to 2.8s", timestamp: "31m ago" },
  { id: "A-2046", workerId: "W-1003", workerName: "Aisha Bello", skill: "QC Inspection", delta: -5, station: "QC Cell · A", severity: "watch", signal: "Escape rate +0.3% on night batch", timestamp: "1h ago" },
  { id: "A-2045", workerId: "W-1007", workerName: "Fatima Noor", skill: "Safety Protocol", delta: -11, station: "QC Cell · B", severity: "drift", signal: "PPE-cam: 3 lapses in 2 shifts", timestamp: "2h ago" },
  { id: "A-2044", workerId: "W-1000", workerName: "Ravi Kumar", skill: "Tool Handling", delta: -4, station: "Bay 3 · MIG-04", severity: "watch", signal: "Tool-change time drifting upward", timestamp: "3h ago" },
];

export interface Nudge {
  id: string;
  workerName: string;
  language: string;
  skill: string;
  title: string;
  duration: number;
  format: "video" | "AR" | "quiz";
  status: "pending" | "delivered" | "completed";
  station: string;
}

export const NUDGES: Nudge[] = [
  { id: "N-118", workerName: "Carlos Ortega", language: "ES", skill: "Weld Precision", title: "Manteniendo el ángulo del arco en pasadas largas", duration: 8, format: "video", status: "delivered", station: "Bay 1" },
  { id: "N-117", workerName: "Priya Shah", language: "HI", skill: "Torque Control", title: "टॉर्क रेंज की पुष्टि — 3 चरणीय जाँच", duration: 6, format: "AR", status: "pending", station: "Line 2" },
  { id: "N-116", workerName: "Anh Nguyen", language: "VI", skill: "Cycle Timing", title: "Nhịp đóng gói: 4 mẹo giữ thời gian chu kỳ", duration: 5, format: "video", status: "completed", station: "Line 1" },
  { id: "N-115", workerName: "Fatima Noor", language: "UR", skill: "Safety Protocol", title: "PPE چیک لسٹ — 90 سیکنڈ ریفریشر", duration: 4, format: "quiz", status: "completed", station: "QC Cell B" },
  { id: "N-114", workerName: "Aisha Bello", language: "EN", skill: "QC Inspection", title: "Spotting hairline weld defects under low light", duration: 9, format: "video", status: "delivered", station: "QC Cell A" },
];

export const KPIS = {
  workforce: 412,
  monitored: 408,
  driftActive: 23,
  criticalNow: 4,
  nudgesToday: 61,
  completionRate: 87,
  defectReduction: 31, // %
  costSaved: 184_500,  // $
};

export const ROI_MONTHS = [
  { m: "Jan", defects: 412, saved: 92_000, nudges: 240 },
  { m: "Feb", defects: 388, saved: 108_000, nudges: 280 },
  { m: "Mar", defects: 340, saved: 124_000, nudges: 310 },
  { m: "Apr", defects: 295, saved: 151_000, nudges: 360 },
  { m: "May", defects: 261, saved: 168_000, nudges: 402 },
  { m: "Jun", defects: 224, saved: 184_500, nudges: 441 },
];

export const AUDIT_LOG = [
  { id: "LOG-7782", worker: "Carlos Ortega", action: "Completed micro-training", skill: "Weld Precision", evidence: "Quiz 92% · Sensor recheck pass", standard: "ISO 9001 §7.2", time: "Today 14:22" },
  { id: "LOG-7781", worker: "Priya Shah", action: "Nudge delivered", skill: "Torque Control", evidence: "Tablet ACK · 14:08", standard: "IATF 16949", time: "Today 14:08" },
  { id: "LOG-7780", worker: "Fatima Noor", action: "Safety refresher passed", skill: "PPE Protocol", evidence: "Quiz 100%", standard: "OSHA 1910.132", time: "Today 12:50" },
  { id: "LOG-7779", worker: "Anh Nguyen", action: "Drift resolved", skill: "Cycle Timing", evidence: "σ back to baseline (1.1s)", standard: "ISO 9001 §8.5", time: "Today 11:14" },
  { id: "LOG-7778", worker: "Ravi Kumar", action: "Skill fingerprint updated", skill: "All", evidence: "14-day rolling recomputed", standard: "Internal QMS", time: "Today 09:00" },
  { id: "LOG-7777", worker: "Aisha Bello", action: "Manager review acknowledged", skill: "QC Inspection", evidence: "Sign-off · J. Mehta", standard: "ISO 9001 §9.1", time: "Yesterday 18:40" },
];
