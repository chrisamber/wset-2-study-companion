# WSET L2 Companion — working notes

Interactive Next.js study app for the **WSET Level 2 Award in Wines** (for Zeal; exam early July 2026).
Six pages: Home `/`, Learn `/learn`, Explore `/explore`, Decode `/decode`, Climate `/climate`, Quiz `/quiz`.

## ⚠️ Next.js version
@AGENTS.md
This is **Next 16 / React 19 / Tailwind v4**. Read the bundled docs in `node_modules/next/dist/docs/`
before changing app conventions. Tailwind theme lives in `app/globals.css` via `@theme` (no tailwind.config).

## The one rule: stay grounded
**Never invent wine facts.** Everything traces to the verified pack at the repo root:
`../wset-l2-wines-rag.md` (canonical facts sheet), `../sources/*-source.md`, and the two fact-checked
mock exams. If a fact isn't in those, don't add it.

## Where things live
- `data/varieties.ts` — 30 grapes (style, regions/GIs, terms, cool/warm climate). `regionIndex()` derives region→grape.
- `data/terms.ts` — 54-term label glossary + `GI_TO_GRAPE` cross-ref.
- `data/concepts.ts` — per-LO study content (the `/learn` page).
- `data/questions.json` — 100-question bank, **generated** from the mock exams (do not hand-edit).
- `lib/quiz-engine.ts` — pure shuffle/scoring (port of repo's tested `quiz-engine.js`). `lib/progress.ts` — localStorage hook.
- Feature pages are **client components with internal state** (no dynamic routes / no async params).

## Commands
```bash
npm run dev        # http://localhost:3000
npm run build      # type-check + lint + prod build (must stay green)
# refresh quiz bank after editing the mock exams:
python3 -c "import build_quiz, json; print(json.dumps(build_quiz.build_bank()))" > data/questions.json   # run from repo root
```

## Extending
- New grape/term → add to `data/varieties.ts` / `data/terms.ts` (sourced!) — Explore, Climate, Decode pick it up automatically.
- Climate comparator only shows varieties whose `climate` field is set (sources must contrast cool vs warm).
- After any data/UI change: `npm run build` must pass, then smoke-test the affected page in the browser.
