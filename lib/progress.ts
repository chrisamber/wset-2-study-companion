"use client";
import { useCallback, useEffect, useState } from "react";
import type { Result } from "./quiz-engine";

// Client-side progress, persisted to localStorage. SSR-safe: reads happen after mount.

const KEY = "wset_app_progress_v1";

export interface Attempt {
  ts: number;
  mode: "exam" | "practice";
  scope: string;
  total: number;
  correct: number;
  band: string | null;
}

export interface Progress {
  schemaVersion: 1;
  attempts: Attempt[];
  perLO: Record<number, { correct: number; total: number }>;
  lastMissed: string[];
  shuffle: boolean;
}

function fresh(): Progress {
  return { schemaVersion: 1, attempts: [], perLO: {}, lastMissed: [], shuffle: true };
}

function read(): Progress {
  if (typeof window === "undefined") return fresh();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fresh();
    const d = JSON.parse(raw);
    if (!d || d.schemaVersion !== 1) return fresh();
    return { ...fresh(), ...d };
  } catch {
    return fresh();
  }
}

function write(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable (private mode) — run in memory */
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(fresh);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(read());
    setReady(true);
  }, []);

  const persist = useCallback((next: Progress) => {
    setProgress(next);
    write(next);
  }, []);

  const setShuffle = useCallback(
    (v: boolean) => persist({ ...read(), shuffle: v }),
    [persist]
  );

  const recordAttempt = useCallback(
    (result: Result, meta: { mode: "exam" | "practice"; scope: string }) => {
      const cur = read();
      const attempts = [
        { ts: Date.now(), mode: meta.mode, scope: meta.scope, total: result.total, correct: result.correct, band: result.band },
        ...cur.attempts,
      ].slice(0, 50);
      const perLO = { ...cur.perLO };
      for (const lo of Object.keys(result.perLO)) {
        const k = Number(lo);
        perLO[k] = {
          correct: (perLO[k]?.correct ?? 0) + result.perLO[k].correct,
          total: (perLO[k]?.total ?? 0) + result.perLO[k].total,
        };
      }
      persist({ ...cur, attempts, perLO, lastMissed: result.missedIds.slice() });
    },
    [persist]
  );

  const reset = useCallback(() => persist(fresh()), [persist]);

  return { progress, ready, setShuffle, recordAttempt, reset };
}
