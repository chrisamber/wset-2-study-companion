# PRD: v1.1 — Portfolio/Case-Study Polish

**wset-app · WSET 2 Study Companion**

## Context

The app was built and shipped for a specific, time-boxed purpose — helping Zeal study for her WSET Level 2 exam. That exam has now passed. The app's job going forward is as a portfolio/case-study piece: the README already frames it as "a small case study in scoped, judgment-driven engineering," and this release is about making the repo itself back that framing up.

## Problem Statement

Anyone evaluating this repo as a portfolio piece — a recruiter, another engineer, future-Chris — hits gaps in the first minute of looking: no CI, no license, only one of three app views has a screenshot, and the most interesting design decision (RAG sized to a 21-item corpus, no vector DB) lives in prose only, with no diagram.

## Goals

Reframed as verifiable outcomes rather than product metrics, since this is a one-time hygiene pass, not a feature with adoption to track:

1. Every push/PR to `main` is automatically linted, tested, and built — no manual "does it still work" check needed.
2. The repo has an explicit license, so reuse terms aren't ambiguous.
3. All three app views (Study, Quiz, Ask the Sommelier) are visually represented in the README.
4. The RAG design's most distinctive decision is understandable in ~5 seconds from a diagram, not just prose.
5. None of the above changes app behavior — zero-risk, non-functional pass.

## Non-Goals

- **New app features or content** (more grapes/questions/etc.) — separate initiative if ever pursued.
- **API-route test coverage** — evaluated during brainstorming (Approach B) and declined: mocking-heavy, low signal relative to effort.
- **Repo topics / GitHub description tuning** — small enough to be its own task later, not bundled here.
- **Formal semver versioning** (package.json bump, CHANGELOG) — this repo isn't published or consumed as a dependency; "v1.1" is a label for this batch of work, not a version contract.
- **Generalizing the app for other WSET 2 students** — already decided against; it stays a case study about one person's exam, not a product.

## User Stories

The "users" here are repo readers, not app end-users:

- As a recruiter or engineer skimming the repo, I want to see CI passing, so I know the code works without cloning it.
- As a README reader, I want to see all three tabs, so I don't have to run the app myself to understand what it does.
- As an engineer curious about the RAG implementation, I want a diagram of the retrieval flow, so I can understand the design in seconds instead of piecing it together from prose.
- As anyone considering reusing this code, I want a clear license, so I know what I'm allowed to do with it.

## Requirements

### Must-Have (P0)

1. **CI workflow** — `.github/workflows/ci.yml`, running lint → test → build on push/PR to `main`.
   - Acceptance: workflow file exists; a `"test"` script is added to `package.json` (`node --test src/lib/*.test.ts`, matching the existing Node-built-in-test-runner convention already used by the `.test.ts` files); a pushed commit triggers the workflow and it passes.
2. **MIT `LICENSE`** at repo root.
   - Acceptance: file exists, standard MIT text, copyright holder "Chris Amber", year 2026.
3. **Screenshots** for the Quiz and Ask-the-Sommelier tabs, added to the README.
   - Acceptance: both images live under `public/screenshots/` (`quiz.png`, `ask.png`), both referenced in a new "Screenshots" section placed after "What it does"; the existing Study hero image and its position are unchanged.
4. **Mermaid architecture diagram** of the retrieval flow.
   - Acceptance: renders correctly in GitHub's README preview; placed inside the existing "Ask the Sommelier — retrieval, sized to the corpus" section, showing: grape data → build-time embeddings → cosine similarity ← question embedding → Claude via AI Gateway → grounded answer.
5. **Badge row update** — add a CI-status badge and a License badge alongside the existing four badges.
   - Acceptance: both badges render; CI badge links to the repo's Actions tab.

### Nice-to-Have (P1)

None — scope was already trimmed to essentials during brainstorming.

### Future Considerations (P2)

- Repo topics + GitHub description polish.
- API-route test coverage, if that route grows more complex later.

## Success Metrics

Binary completion, not adoption curves — this is a one-time pass on a personal project:
- **Leading indicator:** CI shows green on the next 3 consecutive pushes to `main` (proves it's not a one-off pass).
- **Lagging indicator:** n/a — no ongoing usage metrics for a static case-study repo.

## Open Questions

None blocking — brainstorming already resolved scope, approach, and license choice (MIT).

## Timeline Considerations

No hard deadline. Ship whenever convenient.

## Approaches Considered (from brainstorming)

- **A — CI + housekeeping only:** CI, LICENSE, missing screenshots. Fastest, closes the most obvious gaps.
- **B — A + API-route test coverage:** declined — mocking-heavy tests around already-tested logic, low signal.
- **C — A + architecture diagram:** highest leverage for the case-study framing at low cost.
- **Chosen: A + C.**
