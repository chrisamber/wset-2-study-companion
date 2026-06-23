import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildAssocCards,
  buildTermCards,
  ALL_CARDS,
  cardsForDeck,
} from "./flashcards-deck";
import { matchAnswer } from "./fuzzy";

test("assoc deck maps a known GI to its grape", () => {
  const cards = buildAssocCards();
  const mosel = cards.find((c) => c.id === "assoc:mosel");
  assert.ok(mosel, "expected a card for Mosel");
  assert.equal(matchAnswer("Riesling", mosel!.accepted).correct, true);
  assert.match(mosel!.prompt, /Mosel/);
});

test("ambiguous GI accepts any of its grapes", () => {
  const cards = buildAssocCards();
  const napa = cards.find((c) => c.id === "assoc:napavalley");
  assert.ok(napa, "expected a card for Napa Valley");
  assert.ok(napa!.accepted.length > 1, "Napa should accept multiple grapes");
  assert.equal(matchAnswer("Cabernet Sauvignon", napa!.accepted).correct, true);
  assert.equal(matchAnswer("Merlot", napa!.accepted).correct, true);
});

test("terms deck prompts with meaning and answers with the term", () => {
  const cards = buildTermCards();
  const kab = cards.find((c) => c.id === "terms:kabinett");
  assert.ok(kab, "expected a card for Kabinett");
  assert.equal(kab!.canonical, "Kabinett");
  assert.equal(matchAnswer("kabinett", kab!.accepted).correct, true);
});

test("every card id is unique and non-empty", () => {
  const ids = ALL_CARDS.map((c) => c.id);
  assert.ok(ids.every((id) => id.length > 0));
  assert.equal(new Set(ids).size, ids.length);
});

test("cardsForDeck filters by deck", () => {
  assert.ok(cardsForDeck("assoc").every((c) => c.deck === "assoc"));
  assert.ok(cardsForDeck("terms").every((c) => c.deck === "terms"));
  assert.equal(cardsForDeck("all").length, ALL_CARDS.length);
});
