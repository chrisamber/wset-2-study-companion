import {
  streamText,
  type UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai";
import { GRAPES } from "@/data/grapes";
import grapeEmbeddings from "@/data/grape-embeddings.json";
import { topMatches } from "@/lib/retrieval";
import { voyageEmbed } from "@/lib/embeddings";
import { isRateLimited, latestQuestionText } from "@/lib/chat-helpers";

// Gateway-style "provider/model-id" string — no @ai-sdk/anthropic import needed.
// Authenticated via AI_GATEWAY_API_KEY, set as an env var both locally and in
// production. (Vercel's docs describe automatic OIDC auth in production with
// no key needed; testing the live deployment showed that didn't hold here,
// so this repo sets the key explicitly in both environments.)
const CHAT_MODEL = process.env.SOMMELIER_MODEL || "anthropic/claude-sonnet-4-6";
const TOP_K = 5;
const MAX_QUESTION_LENGTH = 500;

export async function POST(req: Request) {
  // Only Voyage is checked here — a missing AI_GATEWAY_API_KEY surfaces later,
  // inside the stream's onError handler below, since the Gateway call itself
  // is what fails.
  if (!process.env.VOYAGE_API_KEY) {
    return new Response(
      "Ask the Sommelier isn't configured yet — missing VOYAGE_API_KEY.",
      { status: 500 }
    );
  }

  const clientId = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(clientId)) {
    return new Response("Too many questions — try again in a minute.", {
      status: 429,
    });
  }

  let messages: UIMessage[];
  try {
    ({ messages } = await req.json());
  } catch {
    return new Response("Malformed request body.", { status: 400 });
  }
  const question = latestQuestionText(messages);

  if (!question) {
    return new Response("No question found in the request.", { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return new Response("Question is too long.", { status: 413 });
  }

  const [queryEmbedding] = await voyageEmbed([question], "query");
  const matches = topMatches(queryEmbedding, grapeEmbeddings, TOP_K);

  const context = matches
    .map((match) => GRAPES.find((g) => g.name === match.name))
    .filter((grape): grape is (typeof GRAPES)[number] => Boolean(grape))
    .map(
      (grape) =>
        `${grape.name}: regions ${grape.regions}; body ${grape.body}; acidity ${grape.acidity}${
          grape.tannin ? `; tannin ${grape.tannin}` : ""
        }; aromas ${grape.aromas}; pairings ${grape.pairings}. ${grape.notes}`
    )
    .join("\n\n");

  const result = streamText({
    model: CHAT_MODEL,
    instructions: `You are a friendly tutor helping a student study for the WSET Level 2 exam. Answer ONLY using the grape reference notes below — do not use outside knowledge. If the question can't be answered from these notes, say so plainly and suggest what topic area it might fall under instead of guessing.\n\nReference notes:\n${context}`,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        console.error("Ask the Sommelier stream error:", error);
        return "Something went wrong generating a response — check that AI_GATEWAY_API_KEY is set (locally) or that the Vercel deployment has Gateway access.";
      },
    }),
  });
}
