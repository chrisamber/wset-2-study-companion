import type { UIMessage } from "ai";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const requestLog = new Map<string, number[]>();

// ponytail: in-memory, per-instance only — resets on cold start.
// Fine at portfolio-demo traffic; swap for Upstash/Redis if this ever gets real traffic.
export function isRateLimited(clientId: string, now: number = Date.now()): boolean {
  const recent = (requestLog.get(clientId) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  requestLog.set(clientId, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

export function latestQuestionText(messages: UIMessage[]): string {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) return "";
  return lastUserMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ");
}
