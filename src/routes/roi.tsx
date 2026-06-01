import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ROI_MONTHS, KPIS } from "@/lib/mock-data";
import { TrendingUp, DollarSign, TrendingDown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/roi")({
  head: () => ({ meta: [{ title: "ROI Report · SkillDrift" }, { name: "description", content: "Monthly report linking skill interventions to defect reduction and cost savings." }] }),
  component: Roi,
});

function Roi() {
  const totalSaved = ROI_MONTHS.reduce((a,b)=>a+b.saved,0);
  const totalNudges = ROI_MONTHS.reduce((a,b)=>a+b.nudges,0);
  const firstDef = ROI_MONTHS[0].defects, lastDef = ROI_MONTHS[ROI_MONTHS.length-1].defects;
  const reduction = Math.round(((firstDef - lastDef) / firstDef) * 100);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="ticker mb-2">ROI report · H1 2026</div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">
            <span className="text-primary">$827k</span> saved. <span className="text-[color:var(--ok)]">−{reduction}%</span> defects. One model.
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-2xl">
            Every micro-training nudge is tied back to the sensor signature it corrected and the defect it prevented. The math is auditable.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "Saved (H1)", v: `$${(totalSaved/1000).toFixed(0)}k`, i: DollarSign, t: "primary" },
            { l: "Defect rate", v: `−${reduction}%`, i: TrendingDown, t: "ok" },
            { l: "Nudges shipped", v: totalNudges.toLocaleString(), i: Sparkles, t: "info" },
            { l: "ROI multiple", v: "11.4×", i: TrendingUp, t: "primary" },
          ].map((k) => (
            <div key={k.l} className="panel p-5">
              <div className="flex items-center justify-between"><span className="ticker">{k.l}</span><k.i className="w-4 h-4 text-primary"/></div>
              <div className="stat-num text-3xl mt-2">{k.v}</div>
            </div>
          ))}
        </div>

        {/* Combined chart */}
        <div className="panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Defects down, training up</h2>
              <div className="ticker mt-1">bars: defects · line: $ saved · area: nudges</div>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs">
              <Legend color="var(--crit)" label="Defects" />
              <Legend color="var(--ok)" label="$ saved" />
              <Legend color="var(--primary)" label="Nudges" />
            </div>
          </div>
          <Chart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="panel p-5">
            <h3 className="font-semibold mb-3">What it prevented</h3>
            <ul className="space-y-3 text-sm">
              {[
                ["MIG-02 weld porosity recurrence", "$48,200"],
                ["Torque overshoot on Line 2", "$31,800"],
                ["QC night-batch escape rate", "$22,400"],
                ["Packaging cycle overrun", "$18,900"],
                ["PPE compliance lapses (insurance)", "$14,500"],
              ].map(([k,v]) => (
                <li key={k} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono text-[color:var(--ok)]">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel p-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 scanline pointer-events-none"/>
            <h3 className="font-semibold mb-3 relative">Model contribution</h3>
            <div className="space-y-4 relative">
              {[
                ["Drift detection accuracy", 94],
                ["Nudge completion rate", KPIS.completionRate],
                ["Sensor coverage", 99],
                ["Multilingual reach", 88],
              ].map(([k,v]: any) => (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1"><span>{k}</span><span className="font-mono text-primary">{v}%</span></div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${v}%`, boxShadow: "0 0 10px var(--primary)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2.5 h-2.5 rounded-sm" style={{background:color}}/>{label}</span>;
}

function Chart() {
  const w = 900, h = 260, pad = 36;
  const months = ROI_MONTHS;
  const maxDef = Math.max(...months.map(m=>m.defects));
  const maxSaved = Math.max(...months.map(m=>m.saved));
  const maxNudges = Math.max(...months.map(m=>m.nudges));
  const bw = (w - pad*2) / months.length;

  const linePts = months.map((m,i) => {
    const x = pad + bw*i + bw/2;
    const y = pad + (1 - m.saved/maxSaved) * (h - pad*2);
    return [x,y];
  });
  const nudgePts = months.map((m,i) => {
    const x = pad + bw*i + bw/2;
    const y = pad + (1 - m.nudges/maxNudges) * (h - pad*2);
    return [x,y];
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-64">
      {[0,1,2,3,4].map(i => <line key={i} x1={pad} x2={w-pad} y1={pad+i*(h-pad*2)/4} y2={pad+i*(h-pad*2)/4} stroke="var(--border)" strokeDasharray="2 4" />)}

      {/* nudges area */}
      <polygon
        points={`${pad},${h-pad} ${nudgePts.map(p=>p.join(",")).join(" ")} ${w-pad},${h-pad}`}
        fill="color-mix(in oklab, var(--primary) 12%, transparent)"
      />

      {/* defect bars */}
      {months.map((m, i) => {
        const bh = (m.defects/maxDef) * (h - pad*2);
        return <rect key={m.m} x={pad + bw*i + bw*0.25} y={h - pad - bh} width={bw*0.5} height={bh} rx="2" fill="color-mix(in oklab, var(--crit) 70%, transparent)" />;
      })}

      {/* saved line */}
      <polyline points={linePts.map(p=>p.join(",")).join(" ")} fill="none" stroke="var(--ok)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {linePts.map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="4" fill="var(--background)" stroke="var(--ok)" strokeWidth="2"/>))}

      {/* nudges line */}
      <polyline points={nudgePts.map(p=>p.join(",")).join(" ")} fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4" />

      {/* x labels */}
      {months.map((m, i) => (
        <text key={m.m} x={pad + bw*i + bw/2} y={h - 10} textAnchor="middle" className="fill-muted-foreground" style={{fontSize:11, fontFamily:"var(--font-mono)"}}>{m.m}</text>
      ))}
    </svg>
  );
}
