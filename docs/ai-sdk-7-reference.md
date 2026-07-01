# AI SDK 7 Reference

> Scraped 2026-06-30 from ai-sdk.dev. AI SDK 7.0.8 installed in this project.

## Quick Start — Next.js App Router

### Install

```bash
npm install ai @ai-sdk/anthropic @ai-sdk/react zod
```

### Environment

`.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### Route Handler

`app/api/chat/route.ts`:
```typescript
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    instructions: 'You are a helpful assistant.',
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
```

### Client

```typescript
'use client';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            if (part.type === 'text') return <span key={i}>{part.text}</span>;
          })}
        </div>
      ))}
      <form onSubmit={e => {
        e.preventDefault();
        sendMessage({ text: input });
        setInput('');
      }}>
        <input value={input} onChange={e => setInput(e.target.value)} />
      </form>
    </div>
  );
}
```

---

## SDK 7 Breaking Changes (vs 6.x)

### Infrastructure
- **Node.js 22+** required
- **ESM-only** — no `require()`

### Renamed APIs

| v6 | v7 |
|----|-----|
| `system` | `instructions` |
| `onFinish` | `onEnd` |
| `onStepFinish` | `onStepEnd` |
| `experimental_onStart` | `onStart` |
| `experimental_onStepStart` | `onStepStart` |
| `experimental_onToolCallStart` | `onToolExecutionStart` |
| `experimental_onToolCallFinish` | `onToolExecutionEnd` |
| `experimental_output` | `output` |
| `experimental_context` | `context` |
| `experimental_activeTools` | `activeTools` |
| `experimental_prepareStep` | `prepareStep` |
| `experimental_include` | `include` |
| `result.fullStream` | `result.stream` |
| `stepCountIs` | `isStepCount` |
| `experimental_customProvider` | `customProvider` |
| `experimental_generateImage` | `generateImage` |
| `experimental_transcribe` | `transcribe` |
| `experimental_generateSpeech` | `generateSpeech` |
| `experimental_telemetry` | `telemetry` |

### Stream helpers (stateless now)
```typescript
// OLD (deprecated)
result.toUIMessageStream()
result.toUIMessageStreamResponse()

// NEW
import { toUIMessageStream, createUIMessageStreamResponse } from 'ai';
createUIMessageStreamResponse({
  stream: toUIMessageStream({ stream: result.stream }),
});
```

### Multi-step results
- Top-level `usage`, `content`, `toolCalls`, `toolResults`, `files`, `sources`, `warnings` now accumulate ALL steps
- Use `result.finalStep.*` for final-step-only data
- `result.finalStep.reasoning`, `.request`, `.response`, `.providerMetadata`

### Image content → file content
```typescript
// OLD
{ type: 'image', image, mediaType? }
// NEW
{ type: 'file', data, mediaType }
```

### Token usage fields
```typescript
// OLD
usage.cachedInputTokens
usage.reasoningTokens
// NEW
usage.inputTokenDetails.cacheReadTokens
usage.outputTokenDetails.reasoningTokens
```

### OpenTelemetry
- Moved to `@ai-sdk/otel` (separate package)
- Telemetry now opt-out when registered (was opt-in)

### Codemod
```bash
npx @ai-sdk/codemod v7
```

---

## generateText

```typescript
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const { text } = await generateText({
  model: anthropic('claude-sonnet-4-6'),
  instructions: 'You are a professional writer.',
  prompt: 'Write a vegetarian lasagna recipe.',
});
```

### Result properties
- `result.text` — final text
- `result.content` — all steps content
- `result.files` — generated files
- `result.sources` — reference sources
- `result.toolCalls` / `result.toolResults`
- `result.finishReason` / `result.rawFinishReason`
- `result.usage` — token usage (all steps)
- `result.steps` — per-step details with performance
- `result.finalStep` — final step (reasoning, request, response, providerMetadata)
- `result.output` — structured output

---

## streamText

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  prompt: 'Explain quantum computing.',
});

for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}
```

### Stream helpers
```typescript
// Next.js route handler
return createUIMessageStreamResponse({
  stream: toUIMessageStream({ stream: result.stream }),
});

// Text-only
return createTextStreamResponse({
  stream: toTextStream({ stream: result.stream }),
});
```

### Stream chunk types
`start`, `start-step`, `text-start`, `text-delta`, `text-end`, `reasoning-start`, `reasoning-delta`, `reasoning-end`, `source`, `file`, `tool-call`, `tool-input-start`, `tool-input-delta`, `tool-input-end`, `tool-result`, `tool-error`, `finish-step`, `finish`, `error`, `raw`

### Callbacks
```typescript
streamText({
  model,
  prompt,
  onStart({ modelId }) { },
  onStepStart({ stepNumber, modelId, messages }) { },
  onToolExecutionStart({ toolCall }) { },
  onToolExecutionEnd({ toolCall, toolExecutionMs, toolOutput }) { },
  onStepEnd({ finishReason, usage }) { },
  onEnd({ text, finishReason, usage, responseMessages, steps }) { },
  onError({ error }) { },
  onChunk({ chunk }) { },
});
```

### Stream transforms
```typescript
import { smoothStream, streamText } from 'ai';

const result = streamText({
  model,
  prompt,
  experimental_transform: smoothStream(),
});
```

---

## useChat Hook

```typescript
import { useChat } from '@ai-sdk/react';

const {
  messages,        // UIMessage[]
  sendMessage,     // (msg) => void
  status,          // 'submitted' | 'streaming' | 'ready' | 'error'
  stop,            // () => void
  regenerate,      // () => void
  setMessages,     // (msgs) => void
  error,           // Error | undefined
} = useChat();
```

### Status states
| State | Meaning |
|-------|---------|
| `submitted` | Sent, awaiting response |
| `streaming` | Response actively streaming |
| `ready` | Complete, ready for input |
| `error` | Request failed |

### Message parts
- `type: 'text'` — text content
- `type: 'file'` — attachments
- `type: 'tool-invocation'` — tool calls
- `type: 'tool-result'` — tool results
- `type: 'reasoning'` — model reasoning
- `type: 'source-url'` — response sources

### Custom transport
```typescript
import { DefaultChatTransport } from '@ai-sdk/react';

const { messages } = useChat({
  transport: new DefaultChatTransport({
    api: '/api/chat',
    headers: { Authorization: 'Bearer token' },
    body: { user_id: '123' },
  }),
});
```

### Send with options
```typescript
sendMessage(
  { text: input },
  {
    headers: { 'X-Custom-Header': 'value' },
    body: { temperature: 0.7 },
    metadata: { userId: 'user123' },
  }
);
```

### File attachments
```typescript
sendMessage({
  text: input,
  files, // FileList from <input type="file">
});
```

### Callbacks
```typescript
useChat({
  onFinish: ({ message, messages, isAbort, isDisconnect, isError }) => { },
  onError: (error) => { },
  onData: (data) => { },
});
```

### Server: message metadata
```typescript
return createUIMessageStreamResponse({
  stream: toUIMessageStream({
    stream: result.stream,
    sendReasoning: true,
    sendSources: true,
    messageMetadata: ({ part }) => {
      if (part.type === 'finish') {
        return { totalTokens: part.totalUsage.totalTokens };
      }
    },
    onError: (error) => 'An error occurred.',
  }),
});
```

### Throttle UI updates
```typescript
const { messages } = useChat({
  experimental_throttle: 50, // ms
});
```

---

## Tools

```typescript
import { streamText, tool, isStepCount } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  messages: await convertToModelMessages(messages),
  stopWhen: isStepCount(5),
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      inputSchema: z.object({
        location: z.string().describe('The location'),
      }),
      execute: async ({ location }) => {
        return { location, temperature: 72 };
      },
    }),
  },
});
```

### Tool approval (v7)
```typescript
streamText({
  model,
  tools,
  toolApproval: {
    weather: 'auto',      // always execute
    deleteFile: 'manual', // requires approval
  },
});
```

---

## Providers

### Anthropic
```typescript
import { anthropic } from '@ai-sdk/anthropic';

const model = anthropic('claude-sonnet-4-6');
// or: anthropic('claude-opus-4-6'), anthropic('claude-haiku-4-5-20251001')
```

### OpenAI
```typescript
import { openai } from '@ai-sdk/openai';
const model = openai('gpt-5.5');
```

### Google
```typescript
import { google } from '@ai-sdk/google';
const model = google('gemini-2.5-flash');
```

### xAI
```typescript
import { xai } from '@ai-sdk/xai';
const model = xai('grok-build-0.1');
```

---

## Sources

- [AI SDK Introduction](https://ai-sdk.dev/docs/introduction)
- [Next.js App Router Getting Started](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)
- [Migration Guide 6.x → 7.0](https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0)
- [Generating Text](https://ai-sdk.dev/docs/ai-sdk-core/generating-text)
- [useChat Hook](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)
- [Providers and Models](https://ai-sdk.dev/docs/foundations/providers-and-models)
- [streamText Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text)
- [Full docs for LLMs](https://ai-sdk.dev/llms.txt)
