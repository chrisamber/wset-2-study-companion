import test from "node:test";
import assert from "node:assert/strict";
import type { UIMessage } from "ai";
import { isRateLimited, latestQuestionText } from "./chat-helpers.ts";

test("isRateLimited allows up to 10 requests per window, then blocks", () => {
  const client = "test-client-a";
  const start = 1_000_000;
  for (let i = 0; i < 10; i++) {
    assert.equal(isRateLimited(client, start + i), false);
  }
  assert.equal(isRateLimited(client, start + 10), true);
});

test("isRateLimited resets once the window has passed", () => {
  const client = "test-client-b";
  const start = 2_000_000;
  for (let i = 0; i < 10; i++) {
    isRateLimited(client, start + i);
  }
  assert.equal(isRateLimited(client, start + 10), true);
  assert.equal(isRateLimited(client, start + 70_000), false);
});

test("latestQuestionText finds the last user message's text", () => {
  const messages: UIMessage[] = [
    { id: "1", role: "user", parts: [{ type: "text", text: "first question" }] },
    { id: "2", role: "assistant", parts: [{ type: "text", text: "an answer" }] },
    { id: "3", role: "user", parts: [{ type: "text", text: "second question" }] },
  ];
  assert.equal(latestQuestionText(messages), "second question");
});

test("latestQuestionText returns an empty string when there is no user message", () => {
  assert.equal(latestQuestionText([]), "");
});
