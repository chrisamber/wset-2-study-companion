# Ponytail Audit Cleanup Plan

**Goal:** Remove the over-engineering identified by the 2026-07-16 repository audit without changing product behavior or adding dependencies.

**Expected cut:** About 1,300 lines, zero dependencies.

## Preflight

1. Run `git status --short`, `git branch --show-current`, and `git remote -v` from the repository root.
2. Stop if unrelated work is dirty. The current changes include `web/app/page.tsx`, which overlaps this cleanup; preserve them before implementation. This plan may be the only uncommitted file.
3. If on `main`, create and switch to `codex/ponytail-audit-cleanup`. Never commit this work directly to `main`.

## 1. Delete completed and duplicate artifacts

Delete:

- `docs/superpowers/plans/2026-07-02-repository-consolidation.md`
- `docs/superpowers/plans/2026-07-02-web-application-cleanup.md`
- `docs/superpowers/specs/2026-07-02-decant-directory-consolidation-design.md`
- `web/components/Bar.tsx`
- `web/public/file.svg`
- `web/public/globe.svg`
- `web/public/next.svg`
- `web/public/vercel.svg`
- `web/public/window.svg`
- `web/LICENSE`
- `web/next.config.ts`

Git history preserves the completed plans and duplicate license. Next.js needs no configuration file while the configuration is empty.

Verify:

```sh
rg -n '\bBar\b|file\.svg|globe\.svg|next\.svg|vercel\.svg|window\.svg' web --glob '!package-lock.json'
```

Expected: no references.

## 2. Remove dead retrieval code

In `embeddings/retrieval.py`:

- Delete unused `ranked_slugs` and `parse_tier_weights_spec`.
- Delete the Mandopop-specific CJK regex and `_has_cjk`; Decant's indexed wine corpus is English.
- Let `hybrid` alone control the FTS leg.
- Reduce `diagnostics["fts_leg"]` to `active`, `empty`, or `off`.
- Keep hybrid retrieval, query variants, tier weighting, wikilink expansion, and SSL enforcement.

In `embeddings/ingest.py`:

- Delete the unused `re` import.
- Import only the chunking names used by the file.
- Delete `PRUNE_ABS_FLOOR`, `PRUNE_FRAC_LIMIT`, and their stale threshold comment; pruning is now unconditionally opt-in.
- Keep the `--allow-prune` guard unchanged.

Verify:

```sh
embeddings/.venv/bin/python -m py_compile embeddings/chunking.py embeddings/ingest.py embeddings/retrieval.py embeddings/query.py
rg -n 'ranked_slugs|parse_tier_weights_spec|PRUNE_ABS_FLOOR|PRUNE_FRAC_LIMIT|_has_cjk|_CJK_RE|Mandopop' embeddings
```

Expected: Python compilation passes and the search returns no matches.

## 3. Use the native View Transition API

In these files, replace each duplicated seven-line `any`-cast wrapper with a typed feature check that calls `document.startViewTransition(update)` when available and `update()` otherwise:

- `web/app/profile/page.tsx`
- `web/app/quiz/page.tsx`
- `web/app/recall/page.tsx`

Keep the helper local to each client page; a shared module saves too little to justify another abstraction.

Also delete the unused `Button` import from `web/app/page.tsx` and unused `Link` import from `web/app/quiz/page.tsx`.

## 4. Verify sequentially

Run from `web/`:

```sh
npm run lint
npm run build
```

Then start the development server and prove it is usable before smoke testing:

```sh
test -d node_modules
npm run dev &
DEV_PID=$!
kill -0 "$DEV_PID"
attempt=0
until curl -f http://localhost:3000/; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then kill "$DEV_PID"; exit 1; fi
  sleep 1
done
curl -f http://localhost:3000/profile
curl -f http://localhost:3000/recall
curl -f http://localhost:3000/quiz
kill "$DEV_PID"
```

Manually exercise one forward and one back transition on Profile, Recall, and Quiz.

Finally run from the repository root:

```sh
git diff --check
git status --short
git diff --stat
```

Stage only the paths named in this plan and commit on `codex/ponytail-audit-cleanup`. Do not push without explicit authorization.
