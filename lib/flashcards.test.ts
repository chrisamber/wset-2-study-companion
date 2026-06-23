import { test } from "node:test";
import assert from "node:assert/strict";
import { grade, buildSession, deckSummary } from "./flashcards";
import type { Card } from "./flashcards-deck";

const card = (id: string): Card => ({
  id,
  deck: "assoc",
  prompt: id,
  canonical: "x",
  accepted: ["x"],
});

test("grade promotes on correct and resets to box 1 on wrong", () => {
  assert.deepEqual(grade(undefined, true), { box: 1, seen: 1, correct: 1 });
  assert.deepEqual(grade({ box: 3, seen: 5, correct: 4 }, true), { box: 4, seen: 6, correct: 5 });
  assert.deepEqual(grade({ box: 5, seen: 9, correct: 9 }, true), { box: 5, seen: 10, correct: 10 });
  assert.deepEqual(grade({ box: 4, seen: 8, correct: 6 }, false), { box: 1, seen: 9, correct: 6 });
});

test("buildSession returns up to size cards, lowest box first", () => {
  const cards = [card("a"), card("b"), card("c")];
  const store = { a: { box: 5, seen: 1, correct: 1 }, b: { box: 2, seen: 1, correct: 1 } };
  // c is unseen (box 0) → first; b (box 2) → next; a (box 5) → last
  const session = buildSession(cards, store, 2);
  assert.deepEqual(session.map((c) => c.id), ["c", "b"]);
});

test("deckSummary counts mastered, due, seen", () => {
  const cards = [card("a"), card("b"), card("c")];
  const store = { a: { box: 5, seen: 3, correct: 3 }, b: { box: 2, seen: 1, correct: 0 } };
  assert.deepEqual(deckSummary(cards, store), { total: 3, mastered: 1, due: 2, seen: 2 });
});
