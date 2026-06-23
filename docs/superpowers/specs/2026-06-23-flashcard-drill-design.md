# Flashcard Drill — Design Spec

**Date:** 2026-06-23
**Feature:** A typed-recall flashcard drill page (`/flashcards`) for the WSET L2 study app.
**For:** Zeal (WSET L2 exam, early July 2026).

## Goal

A typed-recall drill that quizzes the highest-leverage exam associations
(GI → grape, definition → label term), with forgiving answer-matching and
spaced repetition so missed cards resurface. **All card content is
auto-derived from the existing sourced data — nothing is invented.**

This complements (does not duplicate) the existing MCQ `/quiz`: the quiz tests
recognition among 4 options; flashcards test free recall.

## The one rule: stay grounded

Every card is generated from data already in the repo and already
fact-checked: `data/varieties.ts` (`VARIETIES`, with `regions[].gi` and
`name`) and `data/terms.ts` (`TERMS` and `GI_TO_GRAPE`). No new wine facts are
introduced by this feature.

## Decks (card generation)

A pure builder `lib/flashcards-deck.ts` produces an array of `Card` from the
existing data. Two decks ship:

### Deck A — Associations (`assoc`)
The big exam lever (LO3 principal + LO4 regional varieties = 31 of 50 marks).

- **Source:** every `{ gi, country }` in `VARIETIES[].regions`, unioned with
  `GI_TO_GRAPE`.
- **Prompt:** `Which grape is associated with {GI}?`
- **Canonical answer:** the grape name (`Variety.name`, or `GI_TO_GRAPE.grape`).
- **Accepted answers:** ambiguous GIs (e.g. "Napa Valley" → Merlot, Cabernet
  Sauvignon, Chardonnay) accept **any** grape whose `regions` include that GI.
  The card's `accepted` array is the union of all matching grape names.
- A GI string is normalised for de-duplication so the same GI from multiple
  varieties yields **one** card with all valid grapes accepted.

### Deck B — Label terms (`terms`)
LO1 origin labelling + LO4/LO5 quality/ageing/sparkling/fortified terms.

- **Source:** every entry in `TERMS`.
- **Prompt:** the term's `meaning` (and `country`/`category` as a contextual
  kicker, e.g. "Germany · ripeness").
- **Canonical answer:** the `term` (e.g. "Spätlese").
- **Reveal note:** the full `meaning` + `note` (if present).

### Card shape

```ts
export interface Card {
  id: string;          // stable, e.g. "assoc:sancerre" or "terms:spatlese"
  deck: "assoc" | "terms";
  prompt: string;      // what Zeal sees
  kicker?: string;     // small context label, e.g. "France" or "Germany · ripeness"
  canonical: string;   // the single "best" answer shown on reveal
  accepted: string[];  // all answers the matcher should accept (incl. canonical)
  note?: string;       // extra context shown on reveal
}
```

## Fuzzy answer matching — `lib/fuzzy.ts`

Correctness-critical and the one piece built test-first. Pure, no React, no DOM.

```ts
export function normalize(s: string): string;
export function editDistance(a: string, b: string): number;
export function matchAnswer(input: string, accepted: string[]): { correct: boolean; matched: string | null };
```

- **`normalize`:** lowercase → strip diacritics (NFD + remove combining marks,
  so "Gewürztraminer" → "gewurztraminer") → remove anything that isn't
  `[a-z0-9]` (drops spaces, slashes, hyphens, apostrophes, accents) →
  return the collapsed string.
- **Aliases:** before matching, each accepted answer is expanded: split on `/`
  (so "Syrah / Shiraz" → "Syrah", "Shiraz") and each part is normalised. The
  builder may also add explicit aliases (e.g. variety `id`).
- **`editDistance`:** standard Levenshtein (iterative two-row DP).
- **`matchAnswer`:** normalise `input`; for each normalised accepted alias,
  accept if exact OR `editDistance ≤ tolerance` where
  `tolerance = floor(len / 6)` (≈ 1 typo per 6 chars), clamped to a minimum of
  1 for inputs of length ≥ 4 and 0 for shorter inputs (so a 3-letter answer
  must be exact — avoids "Cab" matching "Gam"). Return the first matched alias
  or `null`.

The UI also offers a **self-override** ("I was right" / "Mark wrong") so any
matcher edge case never blocks Zeal.

## Spaced repetition — `lib/flashcards.ts`

A localStorage-backed hook mirroring the existing `lib/progress.ts` pattern
(SSR-safe: reads after mount; tolerant of private-mode failures).

- **Storage key:** `wset_flashcards_v1` (separate from quiz progress).
- **State:** `Record<cardId, { box: number; seen: number; correct: number }>`.
  Leitner boxes 1–5; unseen cards are treated as box 0 (new).
- **Grading:** correct → `box = min(box + 1, 5)`; incorrect → `box = 1`.
- **Session builder** `buildSession(cards, state, size)`: prioritise due/low-box
  and unseen cards; lower boxes appear more often; returns up to `size` card ids
  in study order. Deterministic ordering (no `Math.random` reliance for
  correctness — a stable shuffle keyed off `seen` counts is fine).
- **Summary** `deckSummary(cards, state)`: `{ mastered, due, total, boxes }` for
  the footer (mastered = box 5).
- **`reset()`** clears the store.

## UI — `app/flashcards/page.tsx`

Client component with internal state (matches every other page; no dynamic
routes, no async params). Reuses warm-minimal tokens, `.kicker`, and `Bar`.

Screens (internal `screen` state):
1. **picker** — choose deck (Associations / Label terms / All) → start session.
2. **run** — show `kicker` + `prompt`, a text input (autofocus), Submit.
   On submit: reveal `canonical` + correct/incorrect state + `note`, plus a
   self-override toggle, then **Next**. Enter submits, then Enter goes Next.
3. **done** — session summary (this run's score) → back to picker.

Footer (on picker): per-deck `mastered / due / total` via `Bar` + a "Reset
progress" control (guarded by a confirm step in the UI, no native `confirm()`).

## Wiring

- `components/Nav.tsx`: add `{ href: "/flashcards", label: "Flashcards" }`
  after Quiz.

## Testing & verification

- **Unit tests (TDD):** `lib/fuzzy.ts` and `lib/flashcards-deck.ts` are pure and
  tested with Node's built-in `node:test` runner executed via `tsx`
  (added as a devDependency; a `test` script is added to `package.json`).
- `npm run build` (type-check + lint + prod build) must stay green.
- Manual smoke test of `/flashcards` in the browser.

## Scope guardrails (YAGNI)

Out of scope: audio, images, server/DB, accounts, leaderboards, a new design
system, and editing the underlying wine data. No `data/*` files are modified.
