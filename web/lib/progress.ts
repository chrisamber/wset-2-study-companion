"use client";
import { useCallback, useSyncExternalStore } from "react";
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
  recallMisses: string[]; // GI keys ("gi|country") self-marked wrong, re-served first next pass
}

function fresh(): Progress {
  return { schemaVersion: 1, attempts: [], perLO: {}, lastMissed: [], shuffle: true, recallMisses: [] };
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

// ---- external store (localStorage) -------------------------------------
// useSyncExternalStore keeps this SSR-safe: the server snapshot is the frozen
// `fresh()` default, and the client subscribes to localStorage. This avoids
// hydrating via a setState-in-effect.
const SERVER_SNAPSHOT = fresh();
const listeners = new Set<() => void>();
let cache: Progress | null = null; // memoised client snapshot (stable identity between bumps)

function notify() {
  cache = null;
  for (const l of listeners) l();
}

function write(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable (private mode) — run in memory */
  }
  notify();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // Reflect changes made in other tabs.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Progress {
  // Must return a stable reference across renders until the store changes,
  // otherwise useSyncExternalStore loops. We recompute only after notify().
  if (cache === null) cache = read();
  return cache;
}

function getServerSnapshot(): Progress {
  return SERVER_SNAPSHOT;
}

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // `ready` is true once we're past the server snapshot (i.e. on the client).
  const ready = progress !== SERVER_SNAPSHOT;

  const persist = useCallback((next: Progress) => {
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

  const setRecallMisses = useCallback(
    (keys: string[]) => persist({ ...read(), recallMisses: keys.slice() }),
    [persist]
  );

  const reset = useCallback(() => persist(fresh()), [persist]);

  return { progress, ready, setShuffle, recordAttempt, setRecallMisses, reset };
}
