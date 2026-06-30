"use client";
import { useProgress } from "@/lib/progress";
import { LO_NAMES } from "@/lib/types";
import { Card, ProgressBar } from "@/components/wset-ui";

export function ProgressSnapshot() {
  const { progress, ready } = useProgress();
  const last = progress.attempts[0];

  return (
    <Card className="p-5">
      <div className="eyebrow mb-2">Your progress</div>
      <h2 className="mt-1 font-display text-lg font-semibold text-ink">Accuracy by Learning Outcome</h2>
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
      <div className="mt-5 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((lo) => {
          const p = progress.perLO[lo];
          const has = ready && p && p.total > 0;
          const pct = has ? Math.round((100 * p.correct) / p.total) : 0;
          return (
            <ProgressBar
              key={lo}
              label={`LO${lo} ${LO_NAMES[lo]}`}
              percent={pct}
              caption={has ? `${p.correct}/${p.total} · ${pct}%` : "—"}
              dim={!has}
            />
          );
        })}
      </div>
    </Card>
  );
}
