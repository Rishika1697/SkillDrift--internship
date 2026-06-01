import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { WORKERS, SKILLS, STATUS_META } from "@/lib/mock-data";
import { useState } from "react";
import { Fingerprint as FpIcon, Calendar, Languages, MapPin } from "lucide-react";

export const Route = createFileRoute("/fingerprint")({
  head: () => ({ meta: [{ title: "Skill Fingerprint · SkillDrift" }, { name: "description", content: "Longitudinal competency profile of every worker over their tenure." }] }),
  component: Fingerprint,
});

function Fingerprint() {
  const [activeId, setActiveId] = useState(WORKERS[2].id);
  const worker = WORKERS.find((w) => w.id === activeId)!;

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Worker selector */}
        <aside className="panel p-3 h-fit lg:sticky lg:top-20">
          <div className="ticker px-2 py-2">Workforce · {WORKERS.length}</div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {WORKERS.map((w) => (
              <button
                key={w.id}
                onClick={() => setActiveId(w.id)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-md text-left transition-colors ${activeId===w.id?"bg-primary/10 border border-primary/30":"hover:bg-secondary/60 border border-transparent"}`}
              >
                <div className={`w-7 h-7 rounded-md border grid place-items-center text-[10px] font-semibold ${STATUS_META[w.status].color} border-current/40 bg-current/10`}>
                  <span className="text-foreground">{w.avatar}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{w.name}</div>
                  <div className="ticker truncate">{w.id}</div>
                </div>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[w.status].bg}`} />
              </button>
            ))}
          </div>
        </aside>

        {/* Profile */}
        <div className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-start gap-5 flex-wrap">
              <div className={`w-20 h-20 rounded-lg border-2 grid place-items-center text-2xl font-display font-bold ${STATUS_META[worker.status].color} border-current/40 bg-current/10`}>
                <span className="text-foreground">{worker.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 ticker mb-1.5">
                  <FpIcon className="w-3 h-3" /> Skill fingerprint · {worker.id}
                </div>
                <h1 className="text-3xl font-display font-semibold tracking-tight">{worker.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/>{worker.station}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/>{worker.tenure} yrs tenure</span>
                  <span className="flex items-center gap-1.5"><Languages className="w-3.5 h-3.5"/>{worker.language.toUpperCase()}</span>
                  <span>·</span>
                  <span>Shift {worker.shift}</span>
                </div>
              </div>
              <div className={`panel-2 px-4 py-3 rounded-md border ${STATUS_META[worker.status].color} border-current/40`}>
                <div className="ticker">Status</div>
                <div className={`stat-num text-xl ${STATUS_META[worker.status].color}`}>{STATUS_META[worker.status].label}</div>
              </div>
            </div>
          </div>

          {/* Radar + skills */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-4">
            <div className="panel p-5">
              <div className="ticker mb-3">Competency radar · current</div>
              <Radar worker={worker} />
            </div>

            <div className="panel p-5">
              <div className="ticker mb-3">Sub-skill scores · 14-day rolling</div>
              <div className="space-y-3">
                {SKILLS.map((s) => {
                  const v = worker.skills[s];
                  const tone = v >= 88 ? "var(--ok)" : v >= 78 ? "var(--info)" : v >= 68 ? "var(--warn)" : "var(--crit)";
                  return (
                    <div key={s}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{s}</span>
                        <span className="font-mono text-xs" style={{ color: tone }}>{v}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, background: tone, boxShadow: `0 0 12px ${tone}` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trend chart */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="ticker">Composite skill score · last 14 days</div>
              <div className="font-mono text-xs text-muted-foreground">avg {Math.round(worker.trend.reduce((a,b)=>a+b,0)/worker.trend.length)}</div>
            </div>
            <TrendChart values={worker.trend} status={worker.status} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Radar({ worker }: { worker: typeof WORKERS[number] }) {
  const size = 260, cx = size/2, cy = size/2, R = 100;
  const n = SKILLS.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI/2;
  const pts = SKILLS.map((s, i) => {
    const r = (worker.skills[s] / 100) * R;
    return [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  });
  const poly = pts.map(p => p.join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
      {[0.25,0.5,0.75,1].map((f, i) => (
        <polygon key={i}
          points={SKILLS.map((_, j) => {
            const x = cx + Math.cos(angle(j)) * R * f;
            const y = cy + Math.sin(angle(j)) * R * f;
            return `${x},${y}`;
          }).join(" ")}
          fill="none" stroke="var(--border)" strokeWidth="1"
        />
      ))}
      {SKILLS.map((s, i) => {
        const x = cx + Math.cos(angle(i)) * (R + 18);
        const y = cy + Math.sin(angle(i)) * (R + 18);
        return (
          <g key={s}>
            <line x1={cx} y1={cy} x2={cx + Math.cos(angle(i)) * R} y2={cy + Math.sin(angle(i)) * R} stroke="var(--border)" strokeWidth="1"/>
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground" style={{ fontSize: 9, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.split(" ")[0]}</text>
          </g>
        );
      })}
      <polygon points={poly} fill="color-mix(in oklab, var(--primary) 25%, transparent)" stroke="var(--primary)" strokeWidth="2" />
      {pts.map(([x,y], i) => <circle key={i} cx={x} cy={y} r="3" fill="var(--primary)" />)}
    </svg>
  );
}

function TrendChart({ values, status }: { values: number[]; status: any }) {
  const w = 800, h = 180, pad = 20;
  const min = Math.min(...values) - 5, max = Math.max(...values) + 5;
  const x = (i: number) => pad + (i / (values.length - 1)) * (w - pad*2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min)) * (h - pad*2);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${pad},${h-pad} ${pts} ${w-pad},${h-pad}`;
  const color = `var(--${status === "ok" ? "ok" : status === "watch" ? "info" : status === "drift" ? "warn" : "crit"})`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
      {[0,1,2,3].map(i => <line key={i} x1={pad} x2={w-pad} y1={pad + i*(h-pad*2)/3} y2={pad + i*(h-pad*2)/3} stroke="var(--border)" strokeDasharray="2 4" />)}
      <polygon points={area} fill={`color-mix(in oklab, ${color} 15%, transparent)`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="var(--background)" stroke={color} strokeWidth="2" />)}
    </svg>
  );
}
