# Decant Directory Consolidation and Web Cleanup Design

**Date:** 2026-07-02

## Objective

Turn the current split workspace into a coherent root monorepo, then improve the
Next.js application's internal boundaries without changing product behavior or
losing local work.

The work is split into two independently verifiable projects:

1. Consolidate repository ownership and remove stale generated artifacts.
2. Add tests and refactor the web application's largest route files.

## Current State

`/Users/chrisamber/Developer/decant` contains the vault, semantic-search tools,
source material, and a nested Next.js repository:

```text
decant/
├── app/                 # the only Git repository; Next.js package
│   ├── app/             # Next.js App Router
│   ├── components/
│   ├── data/
│   └── lib/
├── embeddings/
├── raw/
├── wiki/
└── code/wset-app/.next/ # orphaned generated output
```

The root README describes these directories as one repository, but the root has
no Git metadata. The nested app repository has one committed baseline plus an
uncommitted `package-lock.json` change. Its ignored
`.claude/worktrees/flashcard-drill` directory points to a Git directory under a
former workspace path and must not be deleted until its source files have been
compared with the recorded branch.

## Project 1: Repository Consolidation

### Target Structure

```text
decant/
├── .git/
├── docs/
│   └── superpowers/
├── embeddings/
├── raw/                 # local-only source material
├── web/                 # Next.js package
│   ├── app/             # App Router
│   ├── components/
│   ├── data/
│   ├── lib/
│   ├── public/
│   └── package.json
├── wiki/
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

The root becomes the sole Git repository. The existing app history is imported
under `web/` with a history-preserving Git operation rather than copied into an
unrelated initial commit. The old nested `.git` directory is retained outside
the workspace as a temporary backup until history, tracked files, and the
modified lockfile are verified in the root repository.

### Tracked and Ignored Content

The root repository tracks:

- Root project documentation and licensing.
- `wiki/` authored study notes.
- Python source and dependency declarations under `embeddings/`.
- The complete web package under `web/`.
- Design specifications and implementation plans under `docs/superpowers/`.

The root repository ignores:

- `raw/`, because it contains copyrighted source references.
- `.obsidian/`, because it contains local editor state.
- `.claude/` and local worktrees.
- Python virtual environments, caches, and environment files.
- Node dependencies, Next.js output, Vercel state, TypeScript build metadata,
  logs, and environment files.

### Local-Work Preservation

Before migration, the executor records the current commit, branch, worktree
metadata, ignored directories, and complete Git diff. The modified lockfile is
carried into `web/package-lock.json` without rewriting or discarding it.

The flashcard worktree is handled as data recovery, not routine cleanup:

1. Compare every non-generated file in the copied worktree with both its branch
   commit and the current app tree.
2. Preserve any source-only differences in a patch or recovery branch.
3. Confirm the preserved patch can be applied or the recovery branch can be
   checked out from the new root repository.
4. Remove the broken worktree metadata and its generated dependencies only
   after those checks pass.

The orphaned `code/wset-app/` directory is removed only after confirming it
contains no files outside `.next/` generated types.

### Migration Verification

The consolidation is successful when:

- The root is the only active Git repository.
- The original app commit remains reachable in root history.
- `git status` reports only deliberately preserved user changes.
- Root documentation points to `web/`, not the former outer `app/` directory.
- From `web/`, dependency installation and the production build succeed using
  package-local commands.
- `npm run lint` reproduces only the documented pre-existing six errors and two
  warnings; Project 1 introduces no additional lint findings.
- All nine routes are reachable in a browser smoke test.

The known pre-existing lint failures are fixed in Project 2. Project 1 records
them as an expected baseline and must not introduce additional failures.

## Project 2: Web Application Cleanup

### Testing Foundation

Add Vitest as the package test runner and keep unit tests adjacent to pure
modules or under route-local `_lib` directories. The first tests cover:

- Deterministic quiz selection, scoring, and shuffle invariants in
  `lib/quiz-engine.ts`.
- Question selectors and Learning Outcome counts in `data/questions.ts`.
- Progress parsing, serialization, and malformed-storage fallback behavior
  after persistence logic is separated from the React hook.

Tests must not depend on browser navigation or external services. Page-level
confidence comes from the production build and browser smoke tests.

### Lint Baseline

Fix the six existing `no-explicit-any` errors and two unused-import warnings
before moving route code. The fixes preserve behavior and establish a clean
baseline so later failures can be attributed to refactoring.

### Route Boundaries

Route entry files remain responsible for page composition, URL-level behavior,
and wiring state to view components. Feature-specific presentation moves into
private route directories that cannot become public routes:

```text
web/app/quiz/
├── _components/
├── _lib/
└── page.tsx

web/app/confusables/
├── _components/
├── _lib/
└── page.tsx

web/app/recall/
├── _components/
├── _lib/
└── page.tsx

web/app/profile/
├── _components/
├── _lib/
└── page.tsx
```

Extraction follows these boundaries:

- `_components/` contains feature-specific rendered controls and result views.
- `_lib/` contains pure selection, scoring, and state-transition functions.
- `web/components/` retains components shared by multiple routes.
- `web/components/wset-ui/` remains unchanged unless extraction demonstrates a
  concrete duplicated primitive; it is not renamed as general cleanup.
- `web/data/` remains the authoritative, sourced study-data layer.

Each route is refactored and verified independently. No visual redesign, route
rename, data-model expansion, or content rewrite is included.

### Quiz Data Provenance

The existing `data/questions.ts` comment references a missing `build_quiz.py`
and obsolete `wset-app/` path. The cleanup must choose one verifiable source of
truth:

- Restore the actual deterministic generator under `web/scripts/` with its
  required inputs tracked or documented as intentionally local; or
- If the JSON is maintained directly, remove the generator claim and add a
  validator that enforces the `Question` schema and quiz-bank invariants.

The executor must inspect available source history and files before selecting
the branch. It may not invent a replacement generator or silently relabel
generated data as hand-maintained.

### Dead-File Cleanup

Remove `components/Bar.tsx` and the five default SVG files under `public/` only
after a repository-wide reference scan returns no consumers. Unused imports are
removed as part of the lint-baseline task.

### Error Handling

Pure quiz and persistence functions reject or safely normalize malformed input
without throwing during initial client render. Existing user-facing empty,
completion, and reset states remain available after component extraction. No
new network or server error paths are introduced.

### Final Verification

Project 2 is complete when all of the following pass from `web/`:

```sh
npm run lint
npm test
npm run build
```

A browser smoke test covers `/`, `/learn`, `/explore`, `/decode`, `/climate`,
`/confusables`, `/recall`, `/profile`, and `/quiz`. The smoke test checks that
each route renders, primary interactions respond, and the browser console has no
new errors.

## Commit Strategy

Commits remain small and independently reviewable:

1. Preserve the approved design and implementation plans.
2. Establish the root repository and import app history under `web/`.
3. Update root paths, ignore rules, and documentation.
4. Recover and clean stale generated/worktree directories.
5. Add the test runner and baseline pure-module tests.
6. Fix existing lint failures.
7. Refactor one route per commit with its focused tests.
8. Repair quiz-data provenance and validation.
9. Remove confirmed dead files and perform final verification.

Repository migration and application cleanup are documented as separate
implementation plans. Each plan must leave the project in a usable state and
must include exact rollback and verification commands for destructive steps.
