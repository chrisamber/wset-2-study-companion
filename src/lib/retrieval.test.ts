import test from "node:test";
import assert from "node:assert/strict";
import { cosineSimilarity, topMatches } from "./retrieval.ts";

test("cosineSimilarity returns 1 for identical vectors", () => {
  assert.equal(cosineSimilarity([1, 0, 0], [1, 0, 0]), 1);
});

test("cosineSimilarity returns 0 for orthogonal vectors", () => {
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
});

test("topMatches ranks the closest vector first and respects k", () => {
  const records = [
    { name: "far", embedding: [0, 1] },
    { name: "close", embedding: [1, 0.01] },
    { name: "exact", embedding: [1, 0] },
  ];

  const result = topMatches([1, 0], records, 2);

  assert.deepEqual(
    result.map((r) => r.name),
    ["exact", "close"]
  );
});
