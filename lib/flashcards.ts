"use client";
import { useCallback, useEffect, useState } from "react";
import type { Card } from "./flashcards-deck";

// Leitner spaced repetition, persisted to localStorage. SSR-safe: reads after mount.

const KEY = "wset_flashcards_v1";

export interface CardState {
  box: number; // 0 = unseen, 1..5 Leitner boxes (5 = mastered)
  seen: number;
  correct: number;
}
export type Store = Record<string, CardState>;

export function grade(prev: CardState | undefined, correct: boolean): CardState {
  const base = prev ?? { box: 0, seen: 0, correct: 0 };
  return {
    box: correct ? Math.min(base.box + 1, 5) : 1,
    seen: base.seen + 1,
    correct: base.correct + (correct ? 1 : 0),
  };
}

export function buildSession(cards: Card[], store: Store, size: number): Card[] {
  const box = (c: Card) => store[c.id]?.box ?? 0; // unseen sorts first
  const seen = (c: Card) => store[c.id]?.seen ?? 0;
  const sorted = [...cards].sort((a, b) => {
    if (box(a) !== box(b)) return box(a) - box(b);
    if (seen(a) !== seen(b)) return seen(a) - seen(b);
    return a.id < b.id ? -1 : 1;
  });
  return sorted.slice(0, size);
}

export interface DeckSummary {
  total: number;
  mastered: number;
  due: number;
  seen: number;
}

export function deckSummary(cards: Card[], store: Store): DeckSummary {
  let mastered = 0;
  let due = 0;
  let seen = 0;
  for (const c of cards) {
    const st = store[c.id];
    if (!st) {
      due += 1; // unseen = still to learn
      continue;
    }
    seen += 1;
    if (st.box >= 5) mastered += 1;
    else due += 1;
  }
  return { total: cards.length, mastered, due, seen };
}

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const d = JSON.parse(raw);
    return d && typeof d === "object" ? (d as Store) : {};
  } catch {
    return {};
  }
}

function write(s: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable (private mode) — run in memory */
  }
}

export function useFlashcards() {
  const [store, setStore] = useState<Store>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStore(read());
    setReady(true);
  }, []);

  const record = useCallback((id: string, correct: boolean) => {
    setStore((prev) => {
      const next = { ...prev, [id]: grade(prev[id], correct) };
      write(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStore({});
    write({});
  }, []);

  return { store, ready, record, reset };
}
