import type { Question } from "@/lib/types";
import raw from "./questions.json";

// Generated from the two verified mock exams by build_quiz.py (run in the repo root):
//   python3 -c "import build_quiz, json; print(json.dumps(build_quiz.build_bank()))" > wset-app/data/questions.json
export const QUESTIONS: Question[] = raw as Question[];

export const PAPERS: number[] = [...new Set(QUESTIONS.map((q) => q.paper))].sort();

export function questionsByPaper(paper: number): Question[] {
  return QUESTIONS.filter((q) => q.paper === paper);
}

export function questionsByLOs(los: number[]): Question[] {
  const set = new Set(los);
  return QUESTIONS.filter((q) => set.has(q.lo));
}

export function questionsByIds(ids: string[]): Question[] {
  const map = new Map(QUESTIONS.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter((q): q is Question => !!q);
}

export function loCounts(): Record<number, number> {
  const c: Record<number, number> = {};
  for (const q of QUESTIONS) c[q.lo] = (c[q.lo] ?? 0) + 1;
  return c;
}
