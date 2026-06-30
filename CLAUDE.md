# Decant — working notes for AI agents

Interactive Next.js study app for the **WSET Level 2 Award in Wines**. Open source (MIT).
Nine pages: Home `/`, Learn `/learn`, Explore `/explore`, Decode `/decode`, Climate `/climate`,
Confusables `/confusables`, Recall `/recall`, Profile `/profile`, Quiz `/quiz`.

## ⚠️ Next.js version
@AGENTS.md
This is **Next 16 / React 19 / Tailwind v4**. Read the bundled docs in `node_modules/next/dist/docs/`
before changing app conventions. Tailwind theme lives in `app/globals.css` via `@theme` (no tailwind.config).

## The one rule: stay grounded
**Never invent wine facts.** Every claim in `data/` must trace to the published WSET Level 2
syllabus or another verifiable, citable reference. If a fact can't be supported, don't add it.
See `CONTRIBUTING.md`. Never reproduce official WSET exam questions or copyrighted material.

## Where things live
- `data/varieties.ts` — 30 grapes (style, regions/GIs, terms, cool/warm climate). `regionIndex()` derives region→grape.
- `data/terms.ts` — label glossary + `GI_TO_GRAPE` cross-ref.
- `data/concepts.ts` — per-LO study content (the `/learn` page).
- `data/questions.json` — the maintained question bank. Keep the JSON shape; one correct answer, no trick negatives, each with an `explanation`.
- `components/Scale.tsx` — the signature stepped structure scale (acidity = cool/steel pole, body & tannin = warm/wine pole).
- `lib/quiz-engine.ts` — pure shuffle/scoring. `lib/progress.ts` — localStorage hook.
- Feature pages are **client components with internal state** (no dynamic routes / no async params).

## Design language — "the assessment sheet"
Cool analytical paper, Space Grotesk display + Geist Mono as the data face, squared corners, flat fills.
Colour encodes the exam's core axis: **cool pole (steel) = cool climate / acidity**, **warm pole (wine) = warm climate / body / tannin**. Tokens live in `app/globals.css` (`@theme`) and `components/wset-ui/styles.css` (`:root`) — keep the two in sync.

## Commands
```bash
npm run dev        # http://localhost:3000
npm run build      # type-check + lint + prod build (must stay green)
npm run lint       # eslint
```

## Extending
- New grape/term → add to `data/varieties.ts` / `data/terms.ts` (sourced!) — Explore, Climate, Decode pick it up automatically.
- Climate comparator only shows varieties whose `climate` field is set (sources must contrast cool vs warm).
- After any data/UI change: `npm run build` must pass, then smoke-test the affected page in the browser.
