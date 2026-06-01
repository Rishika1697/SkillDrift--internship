import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ALERTS, STATUS_META } from "@/lib/mock-data";
import { AlertTriangle, ArrowRight, Filter } from "lucide-react";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "Drift Alerts · SkillDrift" }, { name: "description", content: "Real-time skill-decay alerts for shop-floor managers." }] }),
  component: Alerts,
});

function Alerts() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="ticker mb-2">Drift alerts · live</div>
            <h1 className="text-3xl font-display font-semibold tracking-tight">Six workers crossed a decay threshold today.</h1>
          </div>
          <div className="flex items-center gap-2">
            {(["All","Critical","Drift","Watch"]).map((t,i)=>(
              <button key={t} className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border ${i===0?"bg-primary/10 text-primary border-primary/30":"border-border text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
            <button className="ml-2 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border border-border text-muted-foreground hover:text-foreground flex items-center gap-1.5"><Filter className="w-3 h-3"/>Filter</button>
          </div>
        </div>

        <div className="panel divide-y divide-border">
          {ALERTS.map((a) => (
            <div key={a.id} className="p-5 hover:bg-secondary/30 transition-colors grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1">
                <div className={`w-10 h-10 rounded-md grid place-items-center ${STATUS_META[a.severity].bg}/15 border ${STATUS_META[a.severity].color} border-current/40`}>
                  <AlertTriangle className={`w-4 h-4 ${STATUS_META[a.severity].color}`} />
                </div>
              </div>
              <div className="col-span-3">
                <div className="font-medium">{a.workerName}</div>
                <div className="ticker mt-0.5">{a.station} · {a.id}</div>
              </div>
              <div className="col-span-3">
                <div className="text-sm">{a.skill}</div>
                <div className="ticker mt-0.5 flex items-center gap-1.5">
                  <span className={STATUS_META[a.severity].color}>{STATUS_META[a.severity].label}</span>
                  <span>·</span>
                  <span className="font-mono text-[color:var(--crit)]">Δ {a.delta}</span>
                </div>
              </div>
              <div className="col-span-3">
                <div className="text-xs text-muted-foreground leading-snug">{a.signal}</div>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="ticker">{a.timestamp}</span>
                <button className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 hover:opacity-90">
                  Push nudge <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
