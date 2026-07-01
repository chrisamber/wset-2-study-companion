import test from "node:test";
import assert from "node:assert/strict";
import { voyageEmbed } from "./embeddings.ts";

test("voyageEmbed re-orders results to match input order", async () => {
  process.env.VOYAGE_API_KEY = "test-key";
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: [
          { index: 1, embedding: [2] },
          { index: 0, embedding: [1] },
        ],
      }),
      { status: 200 }
    );

  try {
    const result = await voyageEmbed(["first", "second"], "document");
    assert.deepEqual(result, [[1], [2]]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("voyageEmbed throws a clear error when VOYAGE_API_KEY is missing", async () => {
  const original = process.env.VOYAGE_API_KEY;
  delete process.env.VOYAGE_API_KEY;

  try {
    await assert.rejects(
      () => voyageEmbed(["text"], "query"),
      /VOYAGE_API_KEY/
    );
  } finally {
    if (original) process.env.VOYAGE_API_KEY = original;
  }
});
