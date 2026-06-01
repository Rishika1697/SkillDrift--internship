import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { WORKERS, SKILLS, STATUS_META, KPIS, ALERTS } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { Activity, AlertTriangle, GraduationCap, TrendingDown, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Heatmap · SkillDrift" },
      { name: "description", content: "Live skill-health heatmap across the entire factory workforce." },
    ],
  }),
  component: Heatmap,
});

function cellColor(v: number) {
  if (v >= 88) return "var(--ok)";
  if (v >= 78) return "var(--info)";
  if (v >= 68) return "var(--warn)";
  return "var(--crit)";
}

function Kpi({ icon: Icon, label, value, suffix, tone = "primary", sub }: any) {
  const toneClass: Record<string, string> = {
    primary: "text-primary",
    crit: "text-[color:var(--crit)]",
    warn: "text-[color:var(--warn)]",
    ok: "text-[color:var(--ok)]",
    info: "text-[color:var(--info)]",
  };
  return (
    <div className="panel p-5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="ticker">{label}</div>
        <Icon className={`w-4 h-4 ${toneClass[tone]}`} />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <div className={`stat-num text-3xl ${toneClass[tone]}`}>{value}</div>
        {suffix && <div className="text-muted-foreground text-sm">{suffix}</div>}
      </div>
      {sub && <div className="ticker mt-1">{sub}</div>}
    </div>
  );
}

function Heatmap() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="ticker mb-2">Skill-health heatmap · {WORKERS.length} workers · {SKILLS.length} skills</div>
            <h1 className="text-3xl font-display font-semibold tracking-tight">
              The floor is <span className="text-primary">listening</span>.
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">
              Every torque, weld, and cycle is being scored in real time. Drift surfaces before defects do.
            </p>
          </div>
          <div className="flex items-center gap-2 panel-2 px-3 py-2 rounded-md">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full text-[color:var(--ok)] bg-[color:var(--ok)]" />
            <span className="ticker">Model v2.4 · last sync 00:04 ago</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Kpi icon={Users} label="Workforce" value={KPIS.workforce} sub={`${KPIS.monitored} on stream`} />
          <Kpi icon={TrendingDown} label="Drift active" value={KPIS.driftActive} tone="warn" sub="last 24h" />
          <Kpi icon={AlertTriangle} label="Critical" value={KPIS.criticalNow} tone="crit" sub="needs intervention" />
          <Kpi icon={GraduationCap} label="Nudges sent" value={KPIS.nudgesToday} tone="info" sub={`${KPIS.completionRate}% completed`} />
          <Kpi icon={Activity} label="Defect drop" value={`−${KPIS.defectReduction}`} suffix="%" tone="ok" sub="vs baseline" />
          <Kpi icon={Zap} label="Saved (mo)" value={`$${(KPIS.costSaved/1000).toFixed(0)}k`} tone="primary" sub="June" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          {/* Heatmap grid */}
          <section className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Competency matrix</h2>
                <div className="ticker mt-1">rows: workers · cols: tracked skills · cell: 14-day score</div>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                {(["ok","watch","drift","critical"] as const).map((s) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${STATUS_META[s].bg}`} />
                    <span className="text-muted-foreground">{STATUS_META[s].label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate" style={{ borderSpacing: "3px" }}>
                <thead>
                  <tr>
                    <th className="text-left ticker font-normal pb-2 pl-2 min-w-[200px]">Worker</th>
                    {SKILLS.map((s) => (
                      <th key={s} className="ticker font-normal pb-2 text-center">
                        <div className="-rotate-0 text-[10px]">{s}</div>
                      </th>
                    ))}
                    <th className="ticker font-normal pb-2 text-right pr-2">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {WORKERS.map((w) => (
                    <tr key={w.id} className="group">
                      <td className="py-1.5 pl-2">
                        <Link to="/fingerprint" className="flex items-center gap-2.5 group-hover:text-primary transition-colors">
                          <div className={`w-7 h-7 rounded-md grid place-items-center text-[10px] font-semibold font-mono border ${STATUS_META[w.status].color} border-current/30 bg-current/10`}>
                            <span className="text-foreground">{w.avatar}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{w.name}</div>
                            <div className="ticker truncate">{w.station} · {w.language.toUpperCase()}</div>
                          </div>
                        </Link>
                      </td>
                      {SKILLS.map((s) => {
                        const v = w.skills[s];
                        return (
                          <td key={s} className="p-0">
                            <div
                              className="h-9 rounded-sm grid place-items-center text-[10px] font-mono font-medium transition-transform hover:scale-110 cursor-pointer"
                              style={{
                                background: `color-mix(in oklab, ${cellColor(v)} ${20 + (v - 60) * 1.4}%, transparent)`,
                                color: v < 70 ? "var(--background)" : "var(--foreground)",
                                border: `1px solid color-mix(in oklab, ${cellColor(v)} 50%, transparent)`,
                              }}
                              title={`${w.name} · ${s}: ${v}`}
                            >
                              {v}
                            </div>
                          </td>
                        );
                      })}
                      <td className="pr-2">
                        <Sparkline values={w.trend} status={w.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Live alerts sidebar */}
          <aside className="panel p-5 h-fit sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Live drift feed</h2>
              <Link to="/alerts" className="ticker text-primary hover:underline">view all →</Link>
            </div>
            <div className="space-y-3">
              {ALERTS.slice(0, 5).map((a) => (
                <div key={a.id} className="panel-2 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[a.severity].bg} ${a.severity === "critical" ? "pulse-dot text-[color:var(--crit)]" : ""}`} />
                      <span className={`ticker ${STATUS_META[a.severity].color}`}>{STATUS_META[a.severity].label}</span>
                    </div>
                    <span className="ticker">{a.timestamp}</span>
                  </div>
                  <div className="text-sm font-medium">{a.workerName}</div>
                  <div className="ticker mt-0.5">{a.skill} · Δ {a.delta}</div>
                  <div className="text-xs text-muted-foreground mt-1.5 leading-snug">{a.signal}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Sparkline({ values, status }: { values: number[]; status: any }) {
  const w = 70, h = 24;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const color = `var(--${status === "ok" ? "ok" : status === "watch" ? "info" : status === "drift" ? "warn" : "crit"})`;
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
