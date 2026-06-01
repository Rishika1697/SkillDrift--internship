import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AUDIT_LOG } from "@/lib/mock-data";
import { ShieldCheck, Download, FileCheck2 } from "lucide-react";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Compliance Log · SkillDrift" }, { name: "description", content: "Evidence-backed training records for ISO, factory safety and labour audits." }] }),
  component: Audit,
});

function Audit() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="ticker mb-2">Compliance audit log · immutable, signed</div>
            <h1 className="text-3xl font-display font-semibold tracking-tight">Every nudge. Every quiz. Every sensor recheck.</h1>
            <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">Auditor-ready evidence trail mapped to ISO 9001, IATF 16949, OSHA, and your internal QMS.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-md border border-border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 hover:bg-secondary"><Download className="w-3 h-3"/>Export CSV</button>
            <button className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"><FileCheck2 className="w-3 h-3"/>Sign-off pack</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["Records (mo)", "3,418"],
            ["Coverage", "99.4%"],
            ["Auditor accesses", "12"],
            ["Last verified", "10:02 today"],
          ].map(([k,v]) => (
            <div key={k} className="panel p-4">
              <div className="ticker">{k}</div>
              <div className="stat-num text-2xl mt-2">{v}</div>
            </div>
          ))}
        </div>

        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["ID","Worker","Action","Skill","Evidence","Standard","Time"].map(h => (
                  <th key={h} className="text-left ticker font-normal px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {AUDIT_LOG.map((l) => (
                <tr key={l.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.id}</td>
                  <td className="px-4 py-3 font-medium">{l.worker}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[color:var(--ok)]"/>{l.action}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.skill}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.evidence}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border uppercase tracking-wider">{l.standard}</span>
                  </td>
                  <td className="px-4 py-3 ticker">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
