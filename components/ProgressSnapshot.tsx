"use client";
import { useProgress } from "@/lib/progress";
import { LO_NAMES } from "@/lib/types";
import { Bar } from "./Bar";

export function ProgressSnapshot() {
  const { progress, ready } = useProgress();
  const last = progress.attempts[0];

  return (
    <section className="card p-5">
      <h2 className="font-display text-lg font-semibold">Your progress</h2>
      <p className="mt-1 text-sm text-muted">
        {!ready ? (
          "Loading…"
        ) : last ? (
          <>
            Last: <strong className="text-ink">{last.scope}</strong> — {last.correct}/{last.total}
            {last.band ? ` (${last.band})` : ""}
          </>
        ) : (
          "No attempts yet — take a quiz to start tracking your accuracy by Learning Outcome."
        )}
      </p>
      <div className="mt-4 space-y-2">
        {[1, 2, 3, 4, 5, 6].map((lo) => {
          const p = progress.perLO[lo];
          const has = ready && p && p.total > 0;
          const pct = has ? Math.round((100 * p.correct) / p.total) : 0;
          return (
            <Bar
              key={lo}
              label={`LO${lo} ${LO_NAMES[lo]}`}
              pct={pct}
              value={has ? `${p.correct}/${p.total} · ${pct}%` : "—"}
              dim={!has}
            />
          );
        })}
      </div>
    </section>
  );
}
