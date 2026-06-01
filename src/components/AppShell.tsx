import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Activity, AlertTriangle, GraduationCap, Fingerprint, ShieldCheck, TrendingUp, Radio } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Heatmap", icon: Activity, kbd: "1" },
  { to: "/alerts", label: "Drift Alerts", icon: AlertTriangle, kbd: "2" },
  { to: "/nudges", label: "Micro-training", icon: GraduationCap, kbd: "3" },
  { to: "/fingerprint", label: "Skill Fingerprint", icon: Fingerprint, kbd: "4" },
  { to: "/audit", label: "Compliance Log", icon: ShieldCheck, kbd: "5" },
  { to: "/roi", label: "ROI Report", icon: TrendingUp, kbd: "6" },
] as const;

export function AppShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-[color:var(--surface)]/80 backdrop-blur-xl flex flex-col">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/30 grid place-items-center glow-primary">
              <Radio className="w-4.5 h-4.5 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display font-semibold tracking-tight leading-none">SkillDrift</div>
              <div className="ticker mt-1">v2.4 · Edge AI</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span className="flex-1">{n.label}</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary/80 border border-border opacity-60 group-hover:opacity-100">{n.kbd}</kbd>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="panel-2 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full text-[color:var(--ok)] bg-[color:var(--ok)]" />
              <span className="ticker">Streams live</span>
            </div>
            <div className="mt-2 font-mono text-[11px] text-muted-foreground leading-relaxed">
              IoT · ERP · QC · MES<br/>
              <span className="text-foreground">12,481</span> events/min
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-14 border-b border-border bg-[color:var(--surface)]/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="ticker">Plant</div>
            <div className="text-sm font-medium">Nashik Unit 3 · Automotive Assembly</div>
            <span className="text-border">/</span>
            <div className="ticker">Shift A · 06:00–14:00</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="ticker">Operator</div>
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 grid place-items-center text-[11px] font-semibold text-primary">JM</div>
          </div>
        </header>
        <div className="p-6">{children ?? <Outlet />}</div>
      </main>
    </div>
  );
}
