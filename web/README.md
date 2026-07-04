# Decant

**An open-source, factually-grounded study companion for the [WSET](https://www.wsetglobal.com/) Level 2 Award in Wines.**

Explore grape varieties, decode wine labels, compare cool- vs warm-climate styles, drill the confusable pairs WSET loves to test, and quiz yourself against the exam structure — all in a fast, offline-friendly web app.

🔗 **Live demo:** https://decant-wines.vercel.app

> **Not affiliated with WSET.** Decant is an independent, fan-made study aid. It is not affiliated with, endorsed by, or sponsored by the Wine & Spirit Education Trust. See [Disclaimer](#disclaimer).

---

## Why

The WSET Level 2 exam is 50 multiple-choice questions in 60 minutes, and **62% of the marks (LO3 + LO4) are grape varieties and their regions**. Decant is built around that reality: it turns the syllabus into something you can *navigate* and *drill*, with every fact traceable to the published syllabus — nothing invented.

## Features

- **Learn** — the whole syllabus, one Learning Outcome at a time, weighted by the marks each is worth.
- **Explore** — every grape: structure, key regions & GIs, label terms. Search, filter, or browse region → grape.
- **Decode** — what AOC, DOCG, Prädikat, Crianza, Grand Cru and 50+ other label terms actually mean.
- **Climate** — see how the same grape shifts between cool and warm sites (the cause WSET keeps testing).
- **Confusables** — a two-way trap trainer for the lookalikes WSET pairs as distractors.
- **Recall** — place → grape flashcards across every GI.
- **Profile** — read a hidden grape's structure and aromas, then name it.
- **Quiz** — 150 verified questions as timed mock exams or untimed practice by Learning Outcome, with instant feedback and the *why* behind every answer.

Content: **30 grape varieties · 50+ label terms · 150 practice questions.** Your progress is stored locally in your browser — no account, no tracking (see [PRIVACY.md](PRIVACY.md)).

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack) · React 19 · TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) — theme defined in `app/globals.css` via `@theme` (no `tailwind.config`)
- Fully static — every page prerenders; no backend, no database.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # type-check + lint + production build (must stay green)
npm run lint     # eslint
npm start        # serve the production build
```

## Project structure

```
app/                feature pages — each a client component with internal state
  globals.css       Tailwind v4 @theme: design tokens (the "assessment sheet" identity)
components/         shared UI (Nav, Scale, ProgressSnapshot) + vendored wset-ui kit
data/
  varieties.ts      30 grapes — structure, regions/GIs, terms, cool/warm climate
  terms.ts          label-term glossary + GI → grape cross-reference
  concepts.ts       per-Learning-Outcome study content
  questions.json    150-question bank (maintained data — see CONTRIBUTING)
lib/
  quiz-engine.ts    pure shuffle/scoring logic
  progress.ts       localStorage progress hook
```

## The one rule: stay grounded

**Never invent wine facts.** Every claim in `data/` must trace to the published WSET Level 2 syllabus or other verifiable reference. Style descriptions, regions, and label terms are all sourced. If a fact can't be supported, it doesn't go in. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Good first contributions: adding sourced grape/region detail, fixing data errors, accessibility improvements.

## Disclaimer

WSET, "Wine & Spirit Education Trust", and related names are trademarks of their respective owners. Decant is an independent educational project and is **not affiliated with, endorsed by, or sponsored by WSET**. It reproduces no official WSET exam questions or copyrighted study materials; all content is original phrasing of publicly documented syllabus facts. Always study from official WSET materials for your exam.

## License

[MIT](LICENSE) © 2026 Chris Amber
