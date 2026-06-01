import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { NUDGES } from "@/lib/mock-data";
import { Play, CheckCircle2, Clock, Languages, Smartphone, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/nudges")({
  head: () => ({ meta: [{ title: "Micro-training · SkillDrift" }, { name: "description", content: "Auto-generated 5–10 min targeted lessons pushed to the worker's tablet in their language." }] }),
  component: Nudges,
});

const statusMeta = {
  pending:   { label: "Queued",    color: "text-[color:var(--warn)]", bg: "bg-[color:var(--warn)]" },
  delivered: { label: "On tablet", color: "text-[color:var(--info)]", bg: "bg-[color:var(--info)]" },
  completed: { label: "Completed", color: "text-[color:var(--ok)]",   bg: "bg-[color:var(--ok)]" },
} as const;

function Nudges() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="ticker mb-2">Micro-training nudges · contextual, native-language</div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">Training that arrives <span className="text-primary">before</span> the defect.</h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-2xl">
            When drift is detected, a 5–10 min lesson is auto-assembled for the exact sub-skill and pushed to the worker's device — in the language they think in.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Sent today", v: "61", icon: GraduationCap },
            { label: "Completion", v: "87%", icon: CheckCircle2 },
            { label: "Avg duration", v: "6.4m", icon: Clock },
            { label: "Languages live", v: "11", icon: Languages },
          ].map((k) => (
            <div key={k.label} className="panel p-4">
              <div className="flex items-center justify-between"><span className="ticker">{k.label}</span><k.icon className="w-4 h-4 text-primary" /></div>
              <div className="stat-num text-2xl mt-2">{k.v}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {NUDGES.map((n) => {
            const meta = statusMeta[n.status];
            return (
              <article key={n.id} className="panel p-5 flex gap-4 hover:border-primary/40 transition-colors">
                <div className="w-28 h-28 rounded-md bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/30 grid place-items-center shrink-0 scanline relative">
                  <Play className="w-7 h-7 text-primary" fill="currentColor" />
                  <div className="absolute bottom-1.5 right-1.5 font-mono text-[10px] bg-background/80 backdrop-blur px-1.5 py-0.5 rounded">{n.duration}:00</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.bg}`} />
                    <span className={`ticker ${meta.color}`}>{meta.label}</span>
                    <span className="ticker">·</span>
                    <span className="ticker">{n.format}</span>
                    <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border">{n.language}</span>
                  </div>
                  <div className="text-sm font-medium leading-snug" lang={n.language.toLowerCase()}>{n.title}</div>
                  <div className="ticker mt-2">{n.workerName} · {n.station} · skill: {n.skill}</div>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5"><Smartphone className="w-3 h-3"/>Resend to tablet</button>
                    <button className="px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground">Preview</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
