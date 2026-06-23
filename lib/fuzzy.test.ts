import { test } from "node:test";
import assert from "node:assert/strict";
import { normalize, editDistance, matchAnswer } from "./fuzzy";

test("normalize strips case, accents, and punctuation", () => {
  assert.equal(normalize("Gewürztraminer"), "gewurztraminer");
  assert.equal(normalize("Sancerre / Pouilly-Fumé"), "sancerrepouillyfume");
  assert.equal(normalize("  Pinot   Noir "), "pinotnoir");
});

test("editDistance counts single-character edits", () => {
  assert.equal(editDistance("merlot", "merlot"), 0);
  assert.equal(editDistance("sauvignon", "savignon"), 1);
  assert.equal(editDistance("", "abc"), 3);
});

test("matchAnswer accepts exact and near-exact typed answers", () => {
  assert.equal(matchAnswer("Sauvignon Blanc", ["Sauvignon Blanc"]).correct, true);
  assert.equal(matchAnswer("sauvingon blanc", ["Sauvignon Blanc"]).correct, true); // 1 typo
  assert.equal(matchAnswer("riesling", ["Riesling"]).correct, true);
});

test("matchAnswer expands slash aliases", () => {
  assert.equal(matchAnswer("Shiraz", ["Syrah / Shiraz"]).correct, true);
  assert.equal(matchAnswer("syrah", ["Syrah / Shiraz"]).correct, true);
});

test("matchAnswer accepts a generous prefix of a compound name", () => {
  assert.equal(matchAnswer("sauvignon", ["Sauvignon Blanc"]).correct, true); // 9/14 chars
});

test("matchAnswer rejects a different grape and empty input", () => {
  assert.equal(matchAnswer("Merlot", ["Nebbiolo"]).correct, false);
  assert.equal(matchAnswer("", ["Riesling"]).correct, false);
  assert.equal(matchAnswer("Cab", ["Gamay"]).correct, false); // short input must be near-exact
});

test("matchAnswer tolerates adjacent-letter transposition typos", () => {
  assert.equal(editDistance("reisling", "riesling"), 1);
  assert.equal(matchAnswer("reisling", ["Riesling"]).correct, true);
});

test("matchAnswer rejects a same-length similar grape (no false positive)", () => {
  assert.equal(matchAnswer("Pinot Gris", ["Pinot Noir"]).correct, false);
});

test("matchAnswer returns the matched alias", () => {
  assert.equal(matchAnswer("Shiraz", ["Syrah / Shiraz"]).matched, "shiraz");
});
