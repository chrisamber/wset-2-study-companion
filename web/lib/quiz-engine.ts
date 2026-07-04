// Pure quiz logic — no React, no DOM. Mirrors the standalone quiz-engine.js so
// the same shuffle-integrity / scoring rules are reused and independently testable.
import type { Letter, Question } from "./types";

export const LETTERS: Letter[] = ["a", "b", "c", "d"];
export type Band = "Distinction" | "Merit" | "Pass" | "Fail";

export interface SessionItem {
  q: Question;
  order: Letter[]; // display index -> original option key
}

export interface Session {
  mode: "exam" | "practice";
  scope: string;
  shuffle: boolean;
  items: SessionItem[];
  answers: Record<number, Letter>;
}

export interface PerLO {
  [lo: number]: { correct: number; total: number };
}

export interface Result {
  total: number;
  correct: number;
  perLO: PerLO;
  missedIds: string[];
  band: Band | null;
}

export function shuffled<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeSessionItem(q: Question, doShuffle: boolean, rng: () => number = Math.random): SessionItem {
  return { q, order: doShuffle ? shuffled(LETTERS, rng) : LETTERS.slice() };
}

export interface SessionOpts {
  mode?: "exam" | "practice";
  scope?: string;
  shuffle?: boolean;
  rng?: () => number;
}

export function makeSession(questions: Question[], opts: SessionOpts = {}): Session {
  const rng = opts.rng ?? Math.random;
  const doShuffle = !!opts.shuffle;
  const qs = doShuffle ? shuffled(questions, rng) : questions.slice();
  return {
    mode: opts.mode ?? "practice",
    scope: opts.scope ?? "",
    shuffle: doShuffle,
    items: qs.map((q) => makeSessionItem(q, doShuffle, rng)),
    answers: {},
  };
}

export interface DisplayOption {
  letter: Letter;
  origKey: Letter;
  text: string;
}

export function displayOptions(item: SessionItem): DisplayOption[] {
  return item.order.map((origKey, i) => ({
    letter: LETTERS[i],
    origKey,
    text: item.q.options[origKey],
  }));
}

export function correctDisplayLetter(item: SessionItem): Letter {
  return LETTERS[item.order.indexOf(item.q.answer)];
}

export function isCorrect(item: SessionItem, chosen: Letter): boolean {
  return chosen === correctDisplayLetter(item);
}

export function band(correct: number, total: number): Band | null {
  if (total !== 50) return null;
  if (correct >= 43) return "Distinction";
  if (correct >= 35) return "Merit";
  if (correct >= 28) return "Pass";
  return "Fail";
}

export function scoreSession(session: Session): Result {
  const total = session.items.length;
  let correct = 0;
  const perLO: PerLO = {};
  const missedIds: string[] = [];
  session.items.forEach((item, i) => {
    const lo = item.q.lo;
    perLO[lo] ??= { correct: 0, total: 0 };
    perLO[lo].total++;
    const chosen = session.answers[i];
    if (chosen != null && isCorrect(item, chosen)) {
      correct++;
      perLO[lo].correct++;
    } else {
      missedIds.push(item.q.id);
    }
  });
  return { total, correct, perLO, missedIds, band: band(correct, total) };
}
