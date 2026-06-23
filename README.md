# 🍷 WSET L2 Companion

An interactive study app for the **WSET Level 2 Award in Wines**, built for Zeal.
Every fact is grounded in this pack's verified syllabus material — the RAG corpus,
the per-grape `sources/` files, and the two fact-checked mock exams. Nothing is invented.

## Features

| Page | What it does |
|------|--------------|
| **Home** (`/`) | Dashboard with the LO exam weighting (where the marks are) + your progress |
| **Learn** (`/learn`) | The whole syllabus, one Learning Outcome at a time, with marks per LO |
| **Explore** (`/explore`) | All 30 syllabus grapes — style, regions/GIs, climate. Search, filter, or browse **by region** |
| **Decode** (`/decode`) | Label glossary (AOC, DOCG, Prädikat, Crianza, Grand Cru…) + "the place names the grape" |
| **Climate** (`/climate`) | Cool vs warm style for the 9 principal grapes the sources contrast |
| **Quiz** (`/quiz`) | 100 verified questions — timed 50-Q exams or practice by LO, instant feedback, per-LO scoring, retry-your-misses, saved progress |

## Run it

```bash
cd wset-app
npm install      # first time only
npm run dev      # http://localhost:3000
```

Production build: `npm run build && npm start`.

## How the content stays grounded

- **`data/varieties.ts`** — the 30 grapes, transcribed from the verified RAG corpus; cool/warm
  climate styles for the principals were extracted from their `sources/*-source.md` files and verified.
- **`data/terms.ts`** — labelling glossary from the RAG corpus LO1 + term lists.
- **`data/concepts.ts`** — per-LO study content from the RAG corpus.
- **`data/questions.json`** — generated from the two mock exams by `../build_quiz.py`
  (`python3 -c "import build_quiz, json; print(json.dumps(build_quiz.build_bank()))" > wset-app/data/questions.json`).

To refresh the question bank after editing the mock exams, re-run that command.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Fraunces + Geist (next/font).
The quiz scoring/shuffle logic lives in `lib/quiz-engine.ts` (a port of the repo's tested
`quiz-engine.js`). Progress is stored in the browser via `localStorage` (no account, no server).
