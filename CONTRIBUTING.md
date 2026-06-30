# Contributing to Decant

Thanks for your interest in improving Decant! This is a small, focused project, so the guidelines are short.

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## The one rule: stay grounded

**Never invent wine facts.** This is the project's core principle and the bar for any data contribution:

- Every claim in `data/` (grape structure, regions/GIs, label terms, climate styles, quiz answers) must trace to the published WSET Level 2 syllabus or another verifiable, citable reference.
- In your PR description, **cite the source** for any new or changed fact.
- If a fact can't be supported, it doesn't go in. "I'm pretty sure" isn't a source.
- **Do not** copy official WSET exam questions or any copyrighted WSET study material. Quiz questions must be original phrasing of publicly documented syllabus facts.

## Development setup

```bash
npm install
npm run dev      # http://localhost:3000
```

Before opening a PR, make sure the build is green:

```bash
npm run build    # type-check + lint + production build — must pass
```

## Where things live

- `data/varieties.ts` — grapes (structure, regions/GIs, terms, cool/warm climate). Explore, Climate, and Decode derive from this automatically.
- `data/terms.ts` — label glossary + GI → grape cross-reference.
- `data/concepts.ts` — per-Learning-Outcome study content for `/learn`.
- `data/questions.json` — the maintained question bank. Keep the existing JSON shape; one correct answer per question, no trick negatives, and an `explanation` that names the supporting fact.

Notes:

- The Climate comparator only shows varieties whose `climate` field is set (sources must contrast cool vs warm).
- Feature pages are client components with internal state — no dynamic routes or async params.
- This is **Next.js 16 / React 19 / Tailwind v4**; the theme lives in `app/globals.css` via `@theme` (there is no `tailwind.config`).

## Good first contributions

- Add sourced detail to an existing grape or region.
- Fix a data error (with a citation).
- Accessibility improvements (focus states, labels, contrast, reduced motion).
- New, well-sourced quiz questions.

## Pull requests

1. Fork and create a feature branch.
2. Make focused changes; run `npm run build`.
3. Open a PR describing **what** changed and **why**, with sources for any facts.
4. A maintainer will review. Keep PRs small where you can — it makes review faster.

Thank you for helping more people pass with confidence. 🍷
