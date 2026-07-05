// Example: how src/routes/index.tsx changes to use real drift data
// instead of the hardcoded WORKERS array from mock-data.ts.
// This is illustrative — merge the relevant bits into your real file,
// don't just drop this in wholesale (it omits some of your existing UI).

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getAllDrift, type DriftResult } from "@/lib/api-client";
import { SKILLS, STATUS_META } from "@/lib/mock-data"; // keep static lookups, drop the fake WORKERS array

export const Route = createFileRoute("/")({
  component: Heatmap,
});

function Heatmap() {
  const [drift, setDrift] = useState<DriftResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllDrift()
      .then(setDrift)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <AppShell>
        <div className="panel p-6 text-sm text-muted-foreground">
          Couldn't load live drift data: {error}. Make sure the backend is
          running and you've uploaded skill history via
          <code> POST /api/upload/skill-history</code>.
        </div>
      </AppShell>
    );
  }

  if (!drift) {
    return (
      <AppShell>
        <div className="panel p-6 text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  // Group flat drift results back into a per-worker view
  const byWorker = new Map<string, DriftResult[]>();
  for (const d of drift) {
    if (!byWorker.has(d.worker_id)) byWorker.set(d.worker_id, []);
    byWorker.get(d.worker_id)!.push(d);
  }

  return (
    <AppShell>
      <table className="w-full border-separate" style={{ borderSpacing: "3px" }}>
        <thead>
          <tr>
            <th className="text-left">Worker</th>
            {SKILLS.map((s) => (
              <th key={s}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...byWorker.entries()].map(([workerId, rows]) => (
            <tr key={workerId}>
              <td>{workerId}</td>
              {SKILLS.map((s) => {
                const cell = rows.find((r) => r.skill === s);
                const tone = cell ? STATUS_META[cell.status] : undefined;
                return (
                  <td key={s} className={tone?.color}>
                    {cell ? cell.ewma_value : "–"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </AppShell>
  );
}
