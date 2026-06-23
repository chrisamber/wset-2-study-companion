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

test("compound GIs are split into individual cards that merge", () => {
  const cards = buildAssocCards();
  // No card prompt should retain a compound "A / B" GI.
  assert.ok(
    !cards.some((c) => c.prompt.includes("/")),
    "compound GIs should be split, not kept as one card"
  );
  // "Graves" appears in two compound GIs (Cabernet Sauvignon and Sauvignon Blanc);
  // after splitting they merge into one Graves card that accepts both.
  const graves = cards.find((c) => c.id === "assoc:graves");
  assert.ok(graves, "expected a merged card for Graves");
  assert.equal(matchAnswer("Cabernet Sauvignon", graves!.accepted).correct, true);
  assert.equal(matchAnswer("Sauvignon Blanc", graves!.accepted).correct, true);
  // The "Also valid" note lists only the alternatives, not the canonical itself.
  assert.ok(!graves!.note?.includes(graves!.canonical), "note should exclude the canonical grape");
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
