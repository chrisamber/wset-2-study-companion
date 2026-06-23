# Flashcard Drill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a typed-recall flashcard drill at `/flashcards` that quizzes GI→grape and definition→term associations, with forgiving fuzzy matching and Leitner spaced repetition.

**Architecture:** Pure data/logic modules (`lib/fuzzy.ts`, `lib/flashcards-deck.ts`, pure helpers in `lib/flashcards.ts`) are unit-tested with Node's built-in test runner via `tsx`. A localStorage hook (`useFlashcards`) mirrors the existing `lib/progress.ts`. The page (`app/flashcards/page.tsx`) is a client component with internal screen state, matching every other page. Cards are auto-derived from `data/varieties.ts` and `data/terms.ts` — no wine facts are invented and no `data/*` file is modified.

**Tech Stack:** Next 16 (App Router), React 19, TypeScript, Tailwind v4 (`@theme` tokens in `app/globals.css`), `tsx` + `node:test` for unit tests.

## Global Constraints

- **Never invent wine facts.** Every card is generated from existing `VARIETIES`, `TERMS`, `GI_TO_GRAPE`. Do not edit any `data/*` file.
- **Next 16 / React 19 / Tailwind v4.** No `tailwind.config`; theme tokens live in `app/globals.css` via `@theme`. Consult `node_modules/next/dist/docs/` before changing app conventions.
- **Pages are client components with internal state** — no dynamic routes, no async params. Add `"use client"` at the top of the page and of any module using React hooks.
- **localStorage access must be SSR-safe** — guard `typeof window === "undefined"`, read only after mount, swallow private-mode errors. Follow the exact pattern in `lib/progress.ts`.
- **Reuse house-style classes:** `card`, `btn-primary`, `kicker`, `font-display`, `text-ink`, `text-muted`, `bg-cream-2`, `border-wine`, `accent-[var(--color-wine)]`, and the `Bar` component. Do not introduce a new design system.
- **`npm run build` (type-check + lint + prod build) must stay green** after every task that touches app code.
- Worktrees do not inherit `node_modules`; run `npm install` in the worktree before building/testing (Task 1, Step 1).

---

### Task 1: Fuzzy answer matcher (`lib/fuzzy.ts`)

**Files:**
- Create: `lib/fuzzy.ts`
- Create: `lib/fuzzy.test.ts`
- Modify: `package.json` (add `tsx` devDependency + `test` script)

**Interfaces:**
- Produces:
  - `normalize(s: string): string`
  - `editDistance(a: string, b: string): number`
  - `matchAnswer(input: string, accepted: string[]): { correct: boolean; matched: string | null }`

- [ ] **Step 1: Install deps and add a test script**

Run (from the worktree root):
```bash
npm install
npm install -D tsx
```
Then edit `package.json` `"scripts"` to add:
```json
"test": "node --test --import tsx './lib/*.test.ts'"
```
Verify `tsx` landed in `devDependencies`.

- [ ] **Step 2: Write the failing test**

Create `lib/fuzzy.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalize, editDistance, matchAnswer } from "./fuzzy.ts";

test("normalize strips case, accents, and punctuation", () => {
  assert.equal(normalize("Gewürztraminer"), "gewurztraminer");
  assert.equal(normalize("Sancerre / Pouilly-Fumé"), "sancerrepouillyfume");
  assert.equal(normalize("  Pinot   Noir "), "pinotnoir");
});

test("editDistance counts single-character edits", () => {
  assert.equal(editDistance("merlot", "merlot"), 0);
  assert.equal(editDistance("sauvignon", "savignon"), 1);
  assert.equal(editDistance("", "abc"), 3);
});

test("matchAnswer accepts exact and near-exact typed answers", () => {
  assert.equal(matchAnswer("Sauvignon Blanc", ["Sauvignon Blanc"]).correct, true);
  assert.equal(matchAnswer("sauvingon blanc", ["Sauvignon Blanc"]).correct, true); // 1 typo
  assert.equal(matchAnswer("riesling", ["Riesling"]).correct, true);
});

test("matchAnswer expands slash aliases", () => {
  assert.equal(matchAnswer("Shiraz", ["Syrah / Shiraz"]).correct, true);
  assert.equal(matchAnswer("syrah", ["Syrah / Shiraz"]).correct, true);
});

test("matchAnswer accepts a generous prefix of a compound name", () => {
  assert.equal(matchAnswer("sauvignon", ["Sauvignon Blanc"]).correct, true); // 9/14 chars
});

test("matchAnswer rejects a different grape and empty input", () => {
  assert.equal(matchAnswer("Merlot", ["Nebbiolo"]).correct, false);
  assert.equal(matchAnswer("", ["Riesling"]).correct, false);
  assert.equal(matchAnswer("Cab", ["Gamay"]).correct, false); // short input must be near-exact
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './fuzzy.ts'` (implementation not yet written).

- [ ] **Step 4: Write the minimal implementation**

Create `lib/fuzzy.ts`:
```ts
// Forgiving answer matching for typed-recall flashcards. Pure — no React, no DOM.

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // drop spaces, slashes, hyphens, apostrophes
}

export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function aliases(accepted: string[]): string[] {
  const out = new Set<string>();
  for (const a of accepted) {
    for (const part of a.split("/")) {
      const n = normalize(part);
      if (n) out.add(n);
    }
  }
  return [...out];
}

export function matchAnswer(
  input: string,
  accepted: string[]
): { correct: boolean; matched: string | null } {
  const got = normalize(input);
  if (!got) return { correct: false, matched: null };
  for (const alias of aliases(accepted)) {
    const tol = got.length >= 4 ? Math.max(1, Math.floor(alias.length / 6)) : 0;
    if (editDistance(got, alias) <= tol) return { correct: true, matched: alias };
    // accept a generous prefix of a longer compound name (e.g. "sauvignon" → "sauvignonblanc")
    if (alias.startsWith(got) && got.length >= Math.ceil(alias.length * 0.6)) {
      return { correct: true, matched: alias };
    }
  }
  return { correct: false, matched: null };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all `fuzzy.test.ts` assertions green.

- [ ] **Step 6: Commit**

```bash
git add lib/fuzzy.ts lib/fuzzy.test.ts package.json package-lock.json
git commit -m "feat: fuzzy answer matcher for typed-recall flashcards"
```

---

### Task 2: Card deck builder (`lib/flashcards-deck.ts`)

**Files:**
- Create: `lib/flashcards-deck.ts`
- Create: `lib/flashcards-deck.test.ts`

**Interfaces:**
- Consumes: `normalize` from `lib/fuzzy.ts`; `VARIETIES` from `data/varieties.ts`; `TERMS`, `GI_TO_GRAPE` from `data/terms.ts`.
- Produces:
  - `interface Card { id: string; deck: "assoc" | "terms"; prompt: string; kicker?: string; canonical: string; accepted: string[]; note?: string }`
  - `type DeckId = "assoc" | "terms" | "all"`
  - `buildAssocCards(): Card[]`
  - `buildTermCards(): Card[]`
  - `ASSOC_CARDS: Card[]`, `TERM_CARDS: Card[]`, `ALL_CARDS: Card[]`
  - `cardsForDeck(deck: DeckId): Card[]`
  - `DECKS: { id: DeckId; label: string }[]`

- [ ] **Step 1: Write the failing test**

Create `lib/flashcards-deck.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildAssocCards,
  buildTermCards,
  ALL_CARDS,
  cardsForDeck,
} from "./flashcards-deck.ts";
import { matchAnswer } from "./fuzzy.ts";

test("assoc deck maps a known GI to its grape", () => {
  const cards = buildAssocCards();
  const mosel = cards.find((c) => c.id === "assoc:mosel");
  assert.ok(mosel, "expected a card for Mosel");
  assert.equal(matchAnswer("Riesling", mosel!.accepted).correct, true);
  assert.match(mosel!.prompt, /Mosel/);
});

test("ambiguous GI accepts any of its grapes", () => {
  const cards = buildAssocCards();
  const napa = cards.find((c) => c.id === "assoc:napavalley");
  assert.ok(napa, "expected a card for Napa Valley");
  assert.ok(napa!.accepted.length > 1, "Napa should accept multiple grapes");
  assert.equal(matchAnswer("Cabernet Sauvignon", napa!.accepted).correct, true);
  assert.equal(matchAnswer("Merlot", napa!.accepted).correct, true);
});

test("terms deck prompts with meaning and answers with the term", () => {
  const cards = buildTermCards();
  const kab = cards.find((c) => c.id === "terms:kabinett");
  assert.ok(kab, "expected a card for Kabinett");
  assert.equal(kab!.canonical, "Kabinett");
  assert.equal(matchAnswer("kabinett", kab!.accepted).correct, true);
});

test("every card id is unique and non-empty", () => {
  const ids = ALL_CARDS.map((c) => c.id);
  assert.ok(ids.every((id) => id.length > 0));
  assert.equal(new Set(ids).size, ids.length);
});

test("cardsForDeck filters by deck", () => {
  assert.ok(cardsForDeck("assoc").every((c) => c.deck === "assoc"));
  assert.ok(cardsForDeck("terms").every((c) => c.deck === "terms"));
  assert.equal(cardsForDeck("all").length, ALL_CARDS.length);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './flashcards-deck.ts'`.

- [ ] **Step 3: Write the minimal implementation**

Create `lib/flashcards-deck.ts`:
```ts
// Auto-generates flashcards from the verified data. Pure — no React, no DOM.
// NOTHING here invents wine facts: cards derive only from VARIETIES / TERMS / GI_TO_GRAPE.
import { VARIETIES } from "@/data/varieties";
import { TERMS, GI_TO_GRAPE } from "@/data/terms";
import { normalize } from "@/lib/fuzzy";

export interface Card {
  id: string;
  deck: "assoc" | "terms";
  prompt: string;
  kicker?: string;
  canonical: string;
  accepted: string[];
  note?: string;
}

export type DeckId = "assoc" | "terms" | "all";

export function buildAssocCards(): Card[] {
  const map = new Map<string, { display: string; kicker: string; grapes: string[] }>();
  const add = (gi: string, kicker: string, grape: string) => {
    const key = normalize(gi);
    if (!key) return;
    let e = map.get(key);
    if (!e) {
      e = { display: gi, kicker, grapes: [] };
      map.set(key, e);
    }
    if (!e.kicker && kicker) e.kicker = kicker;
    if (!e.grapes.includes(grape)) e.grapes.push(grape);
  };
  for (const v of VARIETIES) for (const r of v.regions) add(r.gi, r.country, v.name);
  for (const g of GI_TO_GRAPE) add(g.gi, g.note, g.grape);

  const cards: Card[] = [];
  for (const [key, e] of map) {
    cards.push({
      id: `assoc:${key}`,
      deck: "assoc",
      prompt: `Which grape is associated with ${e.display}?`,
      kicker: e.kicker || undefined,
      canonical: e.grapes[0],
      accepted: e.grapes,
      note: e.grapes.length > 1 ? `Also valid: ${e.grapes.join(", ")}` : undefined,
    });
  }
  return cards;
}

export function buildTermCards(): Card[] {
  return TERMS.map((t) => ({
    id: `terms:${normalize(t.term)}`,
    deck: "terms" as const,
    prompt: t.meaning,
    kicker: `${t.country} · ${t.category}`,
    canonical: t.term,
    accepted: [t.term],
    note: t.note,
  }));
}

export const ASSOC_CARDS: Card[] = buildAssocCards();
export const TERM_CARDS: Card[] = buildTermCards();
export const ALL_CARDS: Card[] = [...ASSOC_CARDS, ...TERM_CARDS];

export function cardsForDeck(deck: DeckId): Card[] {
  if (deck === "assoc") return ASSOC_CARDS;
  if (deck === "terms") return TERM_CARDS;
  return ALL_CARDS;
}

export const DECKS: { id: DeckId; label: string }[] = [
  { id: "assoc", label: "Region → Grape" },
  { id: "terms", label: "Label terms" },
  { id: "all", label: "Everything" },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — both `fuzzy.test.ts` and `flashcards-deck.test.ts` green.

> Note: if `assoc:napavalley` or `assoc:mosel` is not found, inspect the real GI strings with `node --import tsx -e "import('./lib/flashcards-deck.ts').then(m=>console.log(m.ASSOC_CARDS.map(c=>c.id)))"` and adjust the test's expected ids to real ones (do NOT change source data). The `assoc:mosel` id is guaranteed by `GI_TO_GRAPE` ("Mosel" → Riesling); `napavalley` should exist from Merlot/Cabernet/Chardonnay regions.

- [ ] **Step 5: Commit**

```bash
git add lib/flashcards-deck.ts lib/flashcards-deck.test.ts
git commit -m "feat: generate flashcard decks from verified variety + term data"
```

---

### Task 3: Spaced-repetition store + hook (`lib/flashcards.ts`)

**Files:**
- Create: `lib/flashcards.ts`
- Create: `lib/flashcards.test.ts`

**Interfaces:**
- Consumes: `Card` from `lib/flashcards-deck.ts`.
- Produces:
  - `interface CardState { box: number; seen: number; correct: number }`
  - `type Store = Record<string, CardState>`
  - `grade(prev: CardState | undefined, correct: boolean): CardState`
  - `buildSession(cards: Card[], store: Store, size: number): Card[]`
  - `interface DeckSummary { total: number; mastered: number; due: number; seen: number }`
  - `deckSummary(cards: Card[], store: Store): DeckSummary`
  - `useFlashcards(): { store: Store; ready: boolean; record(id: string, correct: boolean): void; reset(): void }`

- [ ] **Step 1: Write the failing test (pure helpers only)**

Create `lib/flashcards.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { grade, buildSession, deckSummary } from "./flashcards.ts";
import type { Card } from "./flashcards-deck.ts";

const card = (id: string): Card => ({
  id,
  deck: "assoc",
  prompt: id,
  canonical: "x",
  accepted: ["x"],
});

test("grade promotes on correct and resets to box 1 on wrong", () => {
  assert.deepEqual(grade(undefined, true), { box: 1, seen: 1, correct: 1 });
  assert.deepEqual(grade({ box: 3, seen: 5, correct: 4 }, true), { box: 4, seen: 6, correct: 5 });
  assert.deepEqual(grade({ box: 5, seen: 9, correct: 9 }, true), { box: 5, seen: 10, correct: 10 });
  assert.deepEqual(grade({ box: 4, seen: 8, correct: 6 }, false), { box: 1, seen: 9, correct: 6 });
});

test("buildSession returns up to size cards, lowest box first", () => {
  const cards = [card("a"), card("b"), card("c")];
  const store = { a: { box: 5, seen: 1, correct: 1 }, b: { box: 2, seen: 1, correct: 1 } };
  // c is unseen (box 0) → first; b (box 2) → next; a (box 5) → last
  const session = buildSession(cards, store, 2);
  assert.deepEqual(session.map((c) => c.id), ["c", "b"]);
});

test("deckSummary counts mastered, due, seen", () => {
  const cards = [card("a"), card("b"), card("c")];
  const store = { a: { box: 5, seen: 3, correct: 3 }, b: { box: 2, seen: 1, correct: 0 } };
  assert.deepEqual(deckSummary(cards, store), { total: 3, mastered: 1, due: 2, seen: 2 });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './flashcards.ts'`.

- [ ] **Step 3: Write the minimal implementation**

Create `lib/flashcards.ts`:
```ts
"use client";
import { useCallback, useEffect, useState } from "react";
import type { Card } from "./flashcards-deck";

// Leitner spaced repetition, persisted to localStorage. SSR-safe: reads after mount.

const KEY = "wset_flashcards_v1";

export interface CardState {
  box: number; // 0 = unseen, 1..5 Leitner boxes (5 = mastered)
  seen: number;
  correct: number;
}
export type Store = Record<string, CardState>;

export function grade(prev: CardState | undefined, correct: boolean): CardState {
  const base = prev ?? { box: 0, seen: 0, correct: 0 };
  return {
    box: correct ? Math.min(base.box + 1, 5) : 1,
    seen: base.seen + 1,
    correct: base.correct + (correct ? 1 : 0),
  };
}

export function buildSession(cards: Card[], store: Store, size: number): Card[] {
  const box = (c: Card) => store[c.id]?.box ?? 0; // unseen sorts first
  const seen = (c: Card) => store[c.id]?.seen ?? 0;
  const sorted = [...cards].sort((a, b) => {
    if (box(a) !== box(b)) return box(a) - box(b);
    if (seen(a) !== seen(b)) return seen(a) - seen(b);
    return a.id < b.id ? -1 : 1;
  });
  return sorted.slice(0, size);
}

export interface DeckSummary {
  total: number;
  mastered: number;
  due: number;
  seen: number;
}

export function deckSummary(cards: Card[], store: Store): DeckSummary {
  let mastered = 0;
  let due = 0;
  let seen = 0;
  for (const c of cards) {
    const st = store[c.id];
    if (!st) {
      due += 1; // unseen = still to learn
      continue;
    }
    seen += 1;
    if (st.box >= 5) mastered += 1;
    else due += 1;
  }
  return { total: cards.length, mastered, due, seen };
}

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const d = JSON.parse(raw);
    return d && typeof d === "object" ? (d as Store) : {};
  } catch {
    return {};
  }
}

function write(s: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable (private mode) — run in memory */
  }
}

export function useFlashcards() {
  const [store, setStore] = useState<Store>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStore(read());
    setReady(true);
  }, []);

  const record = useCallback((id: string, correct: boolean) => {
    setStore((prev) => {
      const next = { ...prev, [id]: grade(prev[id], correct) };
      write(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStore({});
    write({});
  }, []);

  return { store, ready, record, reset };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all three test files green.

- [ ] **Step 5: Commit**

```bash
git add lib/flashcards.ts lib/flashcards.test.ts
git commit -m "feat: Leitner spaced-repetition store and useFlashcards hook"
```

---

### Task 4: Flashcards page (`app/flashcards/page.tsx`)

**Files:**
- Create: `app/flashcards/page.tsx`

**Interfaces:**
- Consumes: `cardsForDeck`, `DECKS`, `type DeckId`, `type Card` from `lib/flashcards-deck`; `useFlashcards`, `deckSummary`, `buildSession` from `lib/flashcards`; `matchAnswer` from `lib/fuzzy`; `Bar` from `components/Bar`.
- Produces: the default-exported `FlashcardsPage` route component.

- [ ] **Step 1: Write the page**

Create `app/flashcards/page.tsx`:
```tsx
"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { cardsForDeck, DECKS, type DeckId, type Card } from "@/lib/flashcards-deck";
import { useFlashcards, deckSummary, buildSession } from "@/lib/flashcards";
import { matchAnswer } from "@/lib/fuzzy";
import { Bar } from "@/components/Bar";

const SESSION_SIZE = 20;
type Screen = "picker" | "run" | "done";

export default function FlashcardsPage() {
  const { store, ready, record, reset } = useFlashcards();
  const [screen, setScreen] = useState<Screen>("picker");
  const [deck, setDeck] = useState<DeckId>("assoc");
  const [queue, setQueue] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [tally, setTally] = useState({ right: 0, total: 0 });
  const [confirmReset, setConfirmReset] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startDeck = useCallback(
    (d: DeckId) => {
      setDeck(d);
      setQueue(buildSession(cardsForDeck(d), store, SESSION_SIZE));
      setIdx(0);
      setInput("");
      setRevealed(false);
      setTally({ right: 0, total: 0 });
      setScreen("run");
    },
    [store]
  );

  const submit = useCallback(() => {
    if (revealed || !input.trim()) return;
    const card = queue[idx];
    const ok = matchAnswer(input, card.accepted).correct;
    setCorrect(ok);
    setRevealed(true);
    setTally((t) => ({ right: t.right + (ok ? 1 : 0), total: t.total + 1 }));
    record(card.id, ok);
  }, [revealed, input, queue, idx, record]);

  const override = useCallback(() => {
    const card = queue[idx];
    const next = !correct;
    setCorrect(next);
    setTally((t) => ({ ...t, right: t.right + (next ? 1 : -1) }));
    record(card.id, next);
  }, [correct, queue, idx, record]);

  const next = useCallback(() => {
    if (idx + 1 >= queue.length) {
      setScreen("done");
      return;
    }
    setIdx((i) => i + 1);
    setInput("");
    setRevealed(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [idx, queue.length]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (revealed) next();
    else submit();
  };

  // ---------- PICKER ----------
  if (screen === "picker") {
    return (
      <div className="space-y-6">
        <header>
          <p className="kicker">Flashcards</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Drill from memory</h1>
          <p className="mt-1 text-muted">
            Type the answer — recall is stronger than recognition. Misses come back sooner.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          {DECKS.map((d) => {
            const s = ready ? deckSummary(cardsForDeck(d.id), store) : null;
            return (
              <button
                key={d.id}
                onClick={() => startDeck(d.id)}
                className="card p-5 text-left transition hover:border-wine"
              >
                <div className="font-display text-lg font-semibold text-ink">{d.label}</div>
                <p className="mt-1 text-sm text-muted">
                  {s ? `${s.mastered}/${s.total} mastered` : `${cardsForDeck(d.id).length} cards`}
                </p>
              </button>
            );
          })}
        </div>

        {ready && (
          <div className="card space-y-3 p-5">
            <p className="kicker">Your progress</p>
            {DECKS.map((d) => {
              const s = deckSummary(cardsForDeck(d.id), store);
              const pct = s.total ? Math.round((s.mastered / s.total) * 100) : 0;
              return <Bar key={d.id} label={d.label} pct={pct} value={`${s.mastered}/${s.total}`} />;
            })}
            {confirmReset ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted">Reset all flashcard progress?</span>
                <button
                  onClick={() => {
                    reset();
                    setConfirmReset(false);
                  }}
                  className="font-medium text-wine"
                >
                  Yes, reset
                </button>
                <button onClick={() => setConfirmReset(false)} className="text-muted">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmReset(true)} className="text-sm text-muted hover:text-wine">
                Reset progress
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---------- RUN ----------
  if (screen === "run") {
    const card = queue[idx];
    if (!card) {
      return (
        <div className="space-y-4">
          <p className="text-muted">No cards to study in this deck yet.</p>
          <button onClick={() => setScreen("picker")} className="btn-primary">
            Back
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between text-sm text-muted">
          <button onClick={() => setScreen("picker")} className="hover:text-wine">
            ← Decks
          </button>
          <span className="tabular-nums">
            {idx + 1} / {queue.length}
          </span>
        </div>

        <div className="card p-6">
          {card.kicker && <p className="kicker">{card.kicker}</p>}
          <p className="mt-2 font-display text-xl font-semibold text-ink">{card.prompt}</p>

          <input
            ref={inputRef}
            autoFocus
            value={input}
            disabled={revealed}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type your answer…"
            className="mt-4 w-full rounded-lg border border-cream-2 bg-white px-3 py-2 text-ink outline-none focus:border-wine disabled:opacity-60"
          />

          {revealed && (
            <div className="mt-4 space-y-2">
              <p className={`font-medium ${correct ? "text-green-700" : "text-wine"}`}>
                {correct ? "✓ Correct" : "✗ Not quite"} — {card.canonical}
              </p>
              {card.note && <p className="text-sm text-muted">{card.note}</p>}
              <button onClick={override} className="text-sm text-muted underline hover:text-wine">
                {correct ? "Mark wrong" : "I was right"}
              </button>
            </div>
          )}
        </div>

        {revealed ? (
          <button onClick={next} className="btn-primary w-full">
            {idx + 1 >= queue.length ? "Finish" : "Next →"}
          </button>
        ) : (
          <button onClick={submit} disabled={!input.trim()} className="btn-primary w-full disabled:opacity-50">
            Check
          </button>
        )}
      </div>
    );
  }

  // ---------- DONE ----------
  const pct = tally.total ? Math.round((tally.right / tally.total) * 100) : 0;
  return (
    <div className="space-y-5">
      <header>
        <p className="kicker">Session complete</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          {tally.right} / {tally.total} correct
        </h1>
        <p className="mt-1 text-muted">{pct}% this round. Missed cards will resurface sooner.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => startDeck(deck)} className="btn-primary">
          Study again
        </button>
        <button onClick={() => setScreen("picker")} className="card p-4 text-center hover:border-wine">
          Back to decks
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check and build pass**

Run: `npm run build`
Expected: PASS — compiles with no type or lint errors; `/flashcards` appears in the route list.

- [ ] **Step 3: Commit**

```bash
git add app/flashcards/page.tsx
git commit -m "feat: flashcards drill page (typed recall, reveal, self-override)"
```

---

### Task 5: Wire into nav + full verification

**Files:**
- Modify: `components/Nav.tsx`

**Interfaces:**
- Consumes: nothing new. Adds a nav link to the existing `links` array.

- [ ] **Step 1: Add the nav link**

In `components/Nav.tsx`, add to the `links` array immediately after the Quiz entry (`{ href: "/quiz", label: "Quiz" }`):
```ts
  { href: "/flashcards", label: "Flashcards" },
```

- [ ] **Step 2: Run the full unit-test suite**

Run: `npm test`
Expected: PASS — `fuzzy`, `flashcards-deck`, and `flashcards` test files all green.

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS — type-check + lint + prod build green; `/flashcards` listed as a static route.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, open `http://localhost:3000/flashcards`. Verify:
- Nav shows "Flashcards"; the three deck cards show mastery counts.
- Start "Region → Grape": type a correct grape → "✓ Correct"; type a typo → still accepted; type a wrong grape → "✗ Not quite" with the answer revealed.
- "I was right" / "Mark wrong" flips the result and the tally.
- Enter submits, then Enter advances; finishing shows the session summary.
- Reload the page — mastery counts persisted (localStorage).

- [ ] **Step 5: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat: add Flashcards to nav"
```

---

## Self-Review Notes

- **Spec coverage:** Deck A (assoc) → Task 2 `buildAssocCards`; Deck B (terms) → Task 2 `buildTermCards`; fuzzy matching → Task 1; spaced repetition → Task 3; UI (picker/run/done, self-override, reset, footer Bars) → Task 4; nav wiring + verification → Task 5. All spec sections covered.
- **Grounding:** no task edits any `data/*` file; cards derive only from `VARIETIES`/`TERMS`/`GI_TO_GRAPE`.
- **Type consistency:** `Card`, `CardState`, `Store`, `DeckId`, `DeckSummary`, and the function signatures (`grade`, `buildSession`, `deckSummary`, `matchAnswer`, `cardsForDeck`) are defined once and consumed with matching names/shapes across tasks.
- **Test-runner caveat:** `node --test --import tsx` requires a Node version that supports `--import` (Node 18.19+/20.6+). If unavailable, fall back to `npx tsx --test ./lib/*.test.ts`.
```
