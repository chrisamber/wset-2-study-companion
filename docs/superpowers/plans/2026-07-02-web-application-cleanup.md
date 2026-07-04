# Web Application Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a tested baseline, validate quiz data, split the four largest route files into focused route-local modules, and remove confirmed dead files without changing product behavior.

**Architecture:** Vitest covers pure domain logic. Shared browser integration remains under `web/lib/`; feature logic and views move beside their route under `_lib/` and `_components/`. Each `page.tsx` remains the state orchestrator, while production builds and browser smoke tests cover integration.

**Tech Stack:** Next.js 16.2.9, React 19.2.4, TypeScript 5, Tailwind CSS 4, Vitest, ESLint 9

---

## File Map

- Create `web/vitest.config.ts` and focused `*.test.ts` files for quiz, questions, progress, profile, recall, and confusables.
- Create `web/lib/progress-state.ts` and `web/lib/view-transition.ts` for pure persistence updates and typed browser transitions.
- Create `web/app/{profile,recall,confusables}/_lib/` for tested feature logic.
- Create `web/app/{profile,recall,confusables,quiz}/_components/` for route-local views.
- Modify the corresponding `page.tsx` files so they retain state and orchestration only.
- Delete `web/components/Bar.tsx` and the five unreferenced starter SVGs after a fresh reference scan.

### Task 1: Add Vitest and quiz-engine coverage

**Files:**
- Modify: `web/package.json`
- Modify: `web/package-lock.json`
- Create: `web/vitest.config.ts`
- Create: `web/lib/quiz-engine.test.ts`

- [ ] **Step 1: Install the test runner**

Run from `web/`:

```bash
npm install --save-dev vitest
```

Expected: `vitest` is added only to `devDependencies`; the existing `decant` package name and MIT license remain in the lockfile.

- [ ] **Step 2: Add scripts and configuration**

Add to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: { environment: "node", include: ["**/*.test.ts"] },
});
```

- [ ] **Step 3: Write deterministic tests before changing quiz logic**

Create `lib/quiz-engine.test.ts` with a `Question` fixture and assertions that:

```ts
expect(shuffled([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1]);
expect(correctDisplayLetter(makeSession([question], { shuffle: true, rng: () => 0 }).items[0])).toBe("a");
const session = makeSession(Array.from({ length: 50 }, (_, index) => question(`q${index}`)));
session.answers = Object.fromEntries(Array.from({ length: 43 }, (_, index) => [index, "b"]));
expect(scoreSession(session).band).toBe("Distinction");
expect(band(27, 50)).toBe("Fail");
expect(band(28, 50)).toBe("Pass");
expect(band(35, 50)).toBe("Merit");
expect(band(43, 50)).toBe("Distinction");
```

The 50-question fixture must answer exactly 43 questions correctly and assert per-LO totals and seven missed IDs.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- lib/quiz-engine.test.ts
npm run lint
git -C .. add web/package.json web/package-lock.json web/vitest.config.ts web/lib/quiz-engine.test.ts
git -C .. commit -m "test: add quiz engine coverage"
```

Expected: tests pass. Lint still reports the known six errors and two warnings; no new finding appears.

### Task 2: Fix lint with one typed transition helper

**Files:**
- Create: `web/lib/view-transition.ts`
- Modify: `web/app/{profile,recall,quiz}/page.tsx`
- Modify: `web/app/page.tsx`

- [ ] **Step 1: Add the browser capability wrapper**

Create `lib/view-transition.ts`:

```ts
type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

export function runViewTransition(update: () => void): void {
  if (typeof document === "undefined") return update();
  const start = (document as DocumentWithViewTransition).startViewTransition;
  if (start) start.call(document, update);
  else update();
}
```

- [ ] **Step 2: Replace duplicated casts and unused imports**

Import `runViewTransition` in profile, recall, and quiz; delete each local `transition` function; replace every `transition(...)` call with `runViewTransition(...)`. Remove `Link` from quiz and `Button` from the home-page UI import.

- [ ] **Step 3: Verify and commit the clean baseline**

Run:

```bash
npm run lint
npx tsc --noEmit
git -C .. add web/lib/view-transition.ts web/app/page.tsx web/app/profile/page.tsx web/app/recall/page.tsx web/app/quiz/page.tsx
git -C .. commit -m "fix: establish clean TypeScript lint baseline"
```

Expected: lint and type checking exit 0.

### Task 3: Validate the maintained question bank

**Files:**
- Modify: `web/data/questions.ts`
- Create: `web/data/questions.test.ts`

- [ ] **Step 1: Write failing tests**

Test `validateQuestionBank`, selectors, ID ordering, and LO counts:

```ts
expect(() => validateQuestionBank([{ id: "broken" }])).toThrow(/question 0/i);
expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
expect(questionsByIds([QUESTIONS[2].id, QUESTIONS[0].id]).map((q) => q.id))
  .toEqual([QUESTIONS[2].id, QUESTIONS[0].id]);
expect(Object.values(loCounts()).reduce((sum, count) => sum + count, 0)).toBe(QUESTIONS.length);
```

- [ ] **Step 2: Run the focused test and see it fail**

Run `npm test -- data/questions.test.ts`.

Expected: FAIL because `validateQuestionBank` is not exported.

- [ ] **Step 3: Implement validation**

Export `validateQuestionBank(raw: unknown): Question[]`. Require an array; non-empty unique `id`; positive integer `paper` and `lo`; non-empty `stem` and `explanation`; exactly string options `a`, `b`, `c`, `d`; and an answer in those keys. Replace the unsafe cast with:

```ts
export const QUESTIONS = validateQuestionBank(raw);
```

Replace the missing-generator claim with:

```ts
// Maintained question bank. Runtime validation prevents malformed content from
// reaching quiz sessions; factual changes still require source review.
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- data/questions.test.ts
npm run lint
git -C .. add web/data/questions.ts web/data/questions.test.ts
git -C .. commit -m "test: validate maintained quiz data"
```

Expected: tests and lint pass.

### Task 4: Extract pure progress state

**Files:**
- Create: `web/lib/progress-state.ts`
- Create: `web/lib/progress-state.test.ts`
- Modify: `web/lib/progress.ts`

- [ ] **Step 1: Write failing parsing and aggregation tests**

Test these exports:

```ts
expect(parseProgress(null)).toEqual(freshProgress());
expect(parseProgress("not-json")).toEqual(freshProgress());
expect(parseProgress('{"schemaVersion":2}')).toEqual(freshProgress());
expect(parseProgress(serializeProgress(progress))).toEqual(progress);
expect(addAttempt(existing, result, meta, 100).attempts[0].ts).toBe(100);
```

Also assert the 50-attempt cap, per-LO aggregation, and copied `lastMissed` IDs.

- [ ] **Step 2: Implement the pure API**

Move `Attempt` and `Progress` to `progress-state.ts` and export:

```ts
export const PROGRESS_KEY = "wset_app_progress_v1";
export function freshProgress(): Progress;
export function parseProgress(value: string | null): Progress;
export function serializeProgress(progress: Progress): string;
export function addAttempt(
  progress: Progress,
  result: Result,
  meta: { mode: "exam" | "practice"; scope: string },
  timestamp?: number
): Progress;
```

`parseProgress` catches JSON errors, requires schema version 1, and merges missing fields over a fresh value. `addAttempt` preserves current aggregation and history limits.

- [ ] **Step 3: Rewire the storage hook**

Use this boundary in `progress.ts`:

```ts
function read(): Progress {
  if (typeof window === "undefined") return freshProgress();
  return parseProgress(window.localStorage.getItem(PROGRESS_KEY));
}

function write(progress: Progress): void {
  try { window.localStorage.setItem(PROGRESS_KEY, serializeProgress(progress)); }
  catch { /* storage unavailable; notify in-memory consumers */ }
  notify();
}
```

Use `addAttempt(read(), result, meta)` and `freshProgress()` from the pure module.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- lib/progress-state.test.ts
npm run lint
npx tsc --noEmit
git -C .. add web/lib/progress-state.ts web/lib/progress-state.test.ts web/lib/progress.ts
git -C .. commit -m "refactor: isolate progress persistence state"
```

### Task 5: Split Profile and Recall

**Files:**
- Create: `web/app/profile/_lib/profile-deck.ts` and `.test.ts`
- Create: `web/app/profile/_components/{ProfileSetup,ProfileRun,ProfileResults}.tsx`
- Modify: `web/app/profile/page.tsx`
- Create: `web/app/recall/_lib/recall-deck.ts` and `.test.ts`
- Create: `web/app/recall/_components/{RecallSetup,RecallRun,RecallResults}.tsx`
- Modify: `web/app/recall/page.tsx`

- [ ] **Step 1: Test profile deck invariants before extraction**

Test `buildProfileDeck(principalOnly, rng)`, `buildProfileCard(target, pool, rng)`, and `tanninLabel`. Assert at most ten unique in-tier cards, four unique options including the target, only target-owned aromas, and em-dash tannin displayed as `N/A`.

- [ ] **Step 2: Move profile logic and views**

Export `PROFILE_ROUND_SIZE`, `ProfileCard`, `buildProfileDeck`, `buildProfileCard`, and `tanninLabel` from `_lib/profile-deck.ts`; inject `rng` into every shuffle. Give the three views explicit props for current state and callbacks. Move existing JSX, sourced text, classes, and scoring thresholds unchanged. Keep React state and transitions in `page.tsx`.

- [ ] **Step 3: Verify and commit Profile**

Run:

```bash
npm test -- app/profile/_lib/profile-deck.test.ts
npm run lint
npx tsc --noEmit
git -C .. add web/app/profile
git -C .. commit -m "refactor: split profile deck and views"
```

Expected: all commands pass and the page is under 150 lines.

- [ ] **Step 4: Test recall deck invariants before extraction**

Test `keyOf`, slash-separated `noteFor`, `buildRecallCard(entry, rng)`, and `buildRecallDeck(missesFirst, misses, rng)`. Assert every correct grape is retained, distractors are real and non-correct, and misses move ahead without dropping cards.

- [ ] **Step 5: Move recall logic and views**

Export `RecallCard`, `keyOf`, `noteFor`, `buildRecallCard`, and `buildRecallDeck` from `_lib/recall-deck.ts`; pass RNG through shuffles. Extract setup, run, and results JSX behind typed props. Keep progress persistence, session state, and transitions in `page.tsx`.

- [ ] **Step 6: Verify and commit Recall**

Run:

```bash
npm test -- app/recall/_lib/recall-deck.test.ts
npm run lint
npx tsc --noEmit
git -C .. add web/app/recall
git -C .. commit -m "refactor: split recall deck and views"
```

Expected: all commands pass and the page is under 170 lines.

### Task 6: Split grounded Confusables

**Files:**
- Create: `web/app/confusables/_lib/cards.ts` and `.test.ts`
- Create: `web/app/confusables/_components/{ConfusablesHome,ConfusableCard,ConfusablesResults}.tsx`
- Modify: `web/app/confusables/page.tsx`

- [ ] **Step 1: Write grounding tests before moving card construction**

Assert unique card keys, cool and warm cards for each configured grape, complete answer labels, verbatim reveal strings from existing datasets, and stable pair deduplication.

- [ ] **Step 2: Move the model and builders**

Export:

```ts
export interface ConfusableAnswer { label: string; reveal: string }
export interface ConfusableCardModel {
  key: string;
  kind: "grape" | "concept" | "term";
  pair: string;
  context: string;
  clue: string;
  left: ConfusableAnswer;
  right: ConfusableAnswer;
  correct: "left" | "right";
}
export const KIND_LABEL: Record<ConfusableCardModel["kind"], string>;
export function buildCards(): ConfusableCardModel[];
export function pairsFor(cards: ConfusableCardModel[]): Array<{ pair: string; kind: ConfusableCardModel["kind"] }>;
```

Move all grounding comments with this code. Do not rewrite wine claims.

- [ ] **Step 3: Extract three views and verify**

Move existing home, card, and result JSX behind typed props; keep score and progress state in `page.tsx`. Then run:

```bash
npm test -- app/confusables/_lib/cards.test.ts
npm run lint
npx tsc --noEmit
git -C .. add web/app/confusables
git -C .. commit -m "refactor: split grounded confusable cards and views"
```

Expected: all commands pass and the page is under 100 lines.

### Task 7: Split Quiz views

**Files:**
- Create: `web/app/quiz/_components/{QuizHome,QuizSetup,QuizRun,QuizResults}.tsx`
- Modify: `web/app/quiz/page.tsx`

- [ ] **Step 1: Move setup views**

Move `BackHeader`, `PracticeSetup`, paper blurbs, and the exam chooser into `QuizSetup.tsx`. Use typed callbacks for back, paper start, and LO start.

- [ ] **Step 2: Move home, run, and results views**

`QuizHome` receives counts, shuffle, misses, and navigation callbacks. `QuizRun` receives session/meta/answers/current/time plus choose/navigation/finish callbacks. `QuizResults` receives session/meta/answers/result plus retry and home callbacks. Preserve every label, class, confirmation, and result calculation.

- [ ] **Step 3: Keep orchestration in the page**

Keep `Screen`, `Meta`, React state, timer effects, `start`, `finish`, and transition calls in `page.tsx`. Do not introduce a reducer or change session behavior.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test
npm run lint
npx tsc --noEmit
git -C .. add web/app/quiz
git -C .. commit -m "refactor: split quiz session views"
```

Expected: all commands pass and the page is under 180 lines.

### Task 8: Remove confirmed dead files

**Files:**
- Delete: `web/components/Bar.tsx`
- Delete: `web/public/{file,globe,next,vercel,window}.svg`

- [ ] **Step 1: Prove there are no consumers**

Run from `web/`:

```bash
rg -n '\bBar\b|file\.svg|globe\.svg|next\.svg|vercel\.svg|window\.svg' app components data lib public --glob '!components/Bar.tsx' --glob '!public/*.svg'
```

Expected: exit 1 with no matches.

- [ ] **Step 2: Delete and verify**

Run:

```bash
rm components/Bar.tsx public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
npm run lint
npm test
npx tsc --noEmit
git -C .. add web/components/Bar.tsx web/public
git -C .. commit -m "chore: remove unused starter assets"
```

Expected: all verification commands pass.

### Task 9: Full verification and migration-backup cleanup

**Files:**
- Generate ignored: `web/.next/**`
- Remove after success: `/private/tmp/decant-migration-20260702/**`

- [ ] **Step 1: Run the complete automated gate**

Run from `web/`:

```bash
npm run lint
npm test
npm run build
```

Expected: zero lint findings, all Vitest tests pass, and Next.js builds all nine routes.

- [ ] **Step 2: Smoke-test the production application**

Run `npm run start`, then open `/`, `/learn`, `/explore`, `/decode`, `/climate`, `/confusables`, `/recall`, `/profile`, and `/quiz`. Confirm each route renders, primary interactions advance, navigation works, and the console has no errors.

- [ ] **Step 3: Verify repository state**

Run from the repository root:

```bash
git status --short --branch
git log --oneline --decorate -15
find . -path './web/node_modules' -prune -o -path './web/.next' -prune -o -name .git -print
```

Expected: one root `.git`, a clean worktree, and focused commits for every task.

- [ ] **Step 4: Remove compact migration backups**

Only after every check passes:

```bash
rm -rf /private/tmp/decant-migration-20260702/legacy-app.git
rm -f /private/tmp/decant-migration-20260702/legacy-app.bundle
rm -f /private/tmp/decant-migration-20260702/package-lock.json
rmdir /private/tmp/decant-migration-20260702
```

Expected: backup removal succeeds because the root history and archive branch are verified.
