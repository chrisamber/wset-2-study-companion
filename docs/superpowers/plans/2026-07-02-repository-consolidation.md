# Repository Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `/Users/chrisamber/Developer/decant` into one root Git repository with the existing Next.js application and its history under `web/`, while preserving the modified lockfile and flashcard branch.

**Architecture:** Create a mirror of the nested app repository before changing paths, initialize the root repository around the vault and embedding tools, then import the app with `git subtree` so its commits remain reachable. Preserve the broken flashcard worktree as an archive branch, move the approved design and plans to root `docs/`, and keep generated and copyrighted material ignored.

**Tech Stack:** Git, Git subtree, Next.js 16, npm, Python 3.11, Obsidian Markdown

---

## File Structure

**Create or move:**

- Create: `/Users/chrisamber/Developer/decant/.git/` — root repository metadata.
- Create: `/Users/chrisamber/Developer/decant/web/` — imported Next.js package.
- Create: `/Users/chrisamber/Developer/decant/docs/superpowers/` — root design and plan documents.
- Create temporarily: `/private/tmp/decant-migration-20260702/legacy-app.git/` — mirror backup of every app ref.
- Create temporarily: `/private/tmp/decant-migration-20260702/legacy-working-tree/` — reversible backup of the former nested app directory.

**Modify:**

- Modify: `/Users/chrisamber/Developer/decant/.gitignore` — root-wide ignores plus a temporary `/app/` migration exclusion.
- Modify: `/Users/chrisamber/Developer/decant/README.md` — rename user-facing app paths to `web/`.
- Preserve as modified: `/Users/chrisamber/Developer/decant/web/package-lock.json` — carry forward the user's existing package metadata edit without committing it.

**Remove after verification:**

- Remove: `/Users/chrisamber/Developer/decant/app/` — former nested repository after reversible backup.
- Remove: `/Users/chrisamber/Developer/decant/code/wset-app/` — confirmed orphan `.next` output.
- Remove: stale generated `.next` output from the backed-up broken worktree after its source files match the archive branch.

### Task 1: Capture a reversible migration snapshot

**Files:**

- Create: `/private/tmp/decant-migration-20260702/legacy-app.git/`
- Create: `/private/tmp/decant-migration-20260702/package-lock.json`
- Create: `/private/tmp/decant-migration-20260702/main-status.txt`
- Create: `/private/tmp/decant-migration-20260702/worktree-files.txt`

- [ ] **Step 1: Verify the known starting state**

Run from `/Users/chrisamber/Developer/decant/app`:

```bash
git status --short --branch
git log --oneline --decorate --all --graph -12
git worktree list --porcelain
```

Expected: `main` points at the committed design, only `package-lock.json` is modified, and `worktree-flashcard-drill` is reachable but its registered worktree is prunable.

- [ ] **Step 2: Create the backup directory without overwriting an earlier run**

Run:

```bash
test ! -e /private/tmp/decant-migration-20260702
mkdir -p /private/tmp/decant-migration-20260702
```

Expected: both commands exit 0. If the first command fails, stop and inspect the existing backup rather than replacing it.

- [ ] **Step 3: Mirror all Git refs and preserve the modified lockfile**

Run:

```bash
git clone --mirror /Users/chrisamber/Developer/decant/app /private/tmp/decant-migration-20260702/legacy-app.git
cp /Users/chrisamber/Developer/decant/app/package-lock.json /private/tmp/decant-migration-20260702/package-lock.json
git bundle create /private/tmp/decant-migration-20260702/legacy-app.bundle --all
```

Expected: the mirror contains `refs/heads/main` and `refs/heads/worktree-flashcard-drill`; the bundle command reports no error.

- [ ] **Step 4: Record exact status and worktree source inventory**

Run:

```bash
git status --porcelain=v2 > /private/tmp/decant-migration-20260702/main-status.txt
find .claude/worktrees/flashcard-drill -path '*/node_modules' -prune -o -path '*/.next' -prune -o -path '*/.git' -prune -o -type f -print | sort > /private/tmp/decant-migration-20260702/worktree-files.txt
git fsck --full --no-dangling
```

Expected: `git fsck` exits 0. `main-status.txt` records only `package-lock.json` as modified.

- [ ] **Step 5: Verify the mirror before proceeding**

Run:

```bash
git --git-dir=/private/tmp/decant-migration-20260702/legacy-app.git show-ref --verify refs/heads/main
git --git-dir=/private/tmp/decant-migration-20260702/legacy-app.git show-ref --verify refs/heads/worktree-flashcard-drill
cmp package-lock.json /private/tmp/decant-migration-20260702/package-lock.json
```

Expected: all three commands exit 0.

### Task 2: Initialize the root repository safely

**Files:**

- Modify: `/Users/chrisamber/Developer/decant/.gitignore`
- Create: `/Users/chrisamber/Developer/decant/.git/`
- Track: `/Users/chrisamber/Developer/decant/wiki/**`
- Track: `/Users/chrisamber/Developer/decant/embeddings/{chunking,ingest,query,retrieval}.py`
- Track: `/Users/chrisamber/Developer/decant/embeddings/requirements.txt`

- [ ] **Step 1: Replace the root ignore rules with repository-wide rules**

Write `/Users/chrisamber/Developer/decant/.gitignore` as:

```gitignore
# Local source material and editor state
/raw/
/.obsidian/
/.claude/
/inbox/
/clippings/

# Temporary exclusion while the nested repository is imported
/app/

# Secrets and local environments
.env
.env.*
!.env.example
.venv/
**/.venv/
__pycache__/
**/__pycache__/
*.py[cod]

# JavaScript and Next.js generated files
node_modules/
**/node_modules/
.next/
**/.next/
out/
**/out/
build/
**/build/
coverage/
**/coverage/
.vercel/
**/.vercel/
*.tsbuildinfo
next-env.d.ts

# Tooling and operating-system state
.DS_Store
*.pem
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Private root agent instructions
/CLAUDE.md
/AGENTS.md
```

- [ ] **Step 2: Confirm sensitive and generated paths are ignored**

Run from `/Users/chrisamber/Developer/decant` after initializing Git:

```bash
git init -b main
git check-ignore -v raw/wset-l2-wines-spec.pdf
git check-ignore -v embeddings/.env
git check-ignore -v embeddings/.venv/pyvenv.cfg
git check-ignore -v app/.next
git check-ignore -v .obsidian/workspace.json
```

Expected: every path prints the matching ignore rule.

- [ ] **Step 3: Stage only root-owned source and documentation**

Run:

```bash
git add .gitignore CONTRIBUTING.md LICENSE README.md wiki embeddings
git status --short
```

Expected: root documents, `wiki/`, Python source, `embeddings/.gitignore`, and `embeddings/requirements.txt` are staged. `raw/`, `.obsidian/`, `.claude/`, `app/`, `.env`, `.venv`, and Python caches are absent.

- [ ] **Step 4: Commit the root baseline**

Run:

```bash
git commit -m "chore: establish Decant monorepo root"
```

Expected: one root commit is created with no nested-app files.

### Task 3: Import the app history under `web/`

**Files:**

- Create: `/Users/chrisamber/Developer/decant/web/**`
- Move: `/Users/chrisamber/Developer/decant/web/docs/superpowers/**` to `/Users/chrisamber/Developer/decant/docs/superpowers/**`
- Preserve ref: `refs/heads/archive/flashcard-drill`

- [ ] **Step 1: Fetch the mirrored app repository**

Run from `/Users/chrisamber/Developer/decant`:

```bash
git remote add legacy-app /private/tmp/decant-migration-20260702/legacy-app.git
git fetch legacy-app '+refs/heads/*:refs/remotes/legacy-app/*'
git show --oneline --no-patch refs/remotes/legacy-app/main
git show --oneline --no-patch refs/remotes/legacy-app/worktree-flashcard-drill
```

Expected: the app design commit and flashcard navigation commit are both displayed.

- [ ] **Step 2: Import the app main branch with history**

Run:

```bash
git subtree add --prefix=web legacy-app main -m "chore: import web app history"
```

Expected: `web/package.json`, `web/app/page.tsx`, and the committed design and plans exist. `git log --all --oneline` still contains the original app commits.

- [ ] **Step 3: Preserve the unrelated flashcard history as an archive branch**

Run:

```bash
git branch archive/flashcard-drill refs/remotes/legacy-app/worktree-flashcard-drill
git show --oneline --no-patch archive/flashcard-drill
```

Expected: the archive branch points to `feat: add Flashcards to nav` and remains reachable independently of `main`.

- [ ] **Step 4: Move project-level design documents to the root**

Run:

```bash
mkdir -p docs
git mv web/docs/superpowers docs/superpowers
rmdir web/docs
git status --short
```

Expected: Git records renames from `web/docs/superpowers/**` to `docs/superpowers/**`.

### Task 4: Reconcile the working tree and documentation

**Files:**

- Modify: `/Users/chrisamber/Developer/decant/.gitignore`
- Modify: `/Users/chrisamber/Developer/decant/README.md`
- Preserve: `/Users/chrisamber/Developer/decant/web/package-lock.json`
- Create temporarily: `/private/tmp/decant-migration-20260702/legacy-working-tree/`

- [ ] **Step 1: Restore the exact user-modified lockfile under `web/`**

Run:

```bash
cp /private/tmp/decant-migration-20260702/package-lock.json web/package-lock.json
git diff -- web/package-lock.json
```

Expected: the diff changes the package name from `wset-app` to `decant` and adds the MIT license, matching the pre-migration diff.

- [ ] **Step 2: Move the entire former app working tree to the reversible backup**

Run:

```bash
mv app /private/tmp/decant-migration-20260702/legacy-working-tree
test ! -e app
test -d /private/tmp/decant-migration-20260702/legacy-working-tree/.git
```

Expected: the old nested repository no longer exists under the monorepo root and remains intact in `/private/tmp`.

- [ ] **Step 3: Reuse installed dependencies without carrying stale build output**

Run:

```bash
mv /private/tmp/decant-migration-20260702/legacy-working-tree/node_modules web/node_modules
test -x web/node_modules/.bin/next
```

Expected: the existing dependency installation is available under `web/`; the old `.next` directory remains only in the backup.

- [ ] **Step 4: Remove the temporary `/app/` ignore rule**

Delete these lines from the root `.gitignore`:

```gitignore
# Temporary exclusion while the nested repository is imported
/app/
```

Run:

```bash
git check-ignore app
```

Expected: the command exits 1 because the obsolete path is no longer ignored or present.

- [ ] **Step 5: Update root README paths**

Apply these exact textual changes in `README.md`:

```diff
-| [`app/`](app/) | Next.js 16 web app (Learn / Explore / Decode / Climate / Quiz). [Live demo](https://wset-app-umber.vercel.app). Has its own README. |
+| [`web/`](web/) | Next.js 16 web app (Learn / Explore / Decode / Climate / Quiz). [Live demo](https://wset-app-umber.vercel.app). Has its own README. |
@@
-cd app
+cd web
@@
-Opens at `http://localhost:3000`. See [`app/README.md`](app/README.md) for details.
+Opens at `http://localhost:3000`. See [`web/README.md`](web/README.md) for details.
```

- [ ] **Step 6: Commit only consolidation-owned changes**

Run:

```bash
git add .gitignore README.md docs
git diff --cached --check
git status --short
git commit -m "chore: finalize monorepo directory layout"
```

Expected: documentation and ignore changes are committed. `web/package-lock.json` remains the only unstaged tracked modification.

### Task 5: Verify and clean stale directories

**Files:**

- Inspect: `/private/tmp/decant-migration-20260702/legacy-working-tree/.claude/worktrees/flashcard-drill/`
- Remove after comparison: `/Users/chrisamber/Developer/decant/code/wset-app/`
- Retain until final verification: `/private/tmp/decant-migration-20260702/legacy-app.git/`
- Retain until final verification: `/private/tmp/decant-migration-20260702/legacy-working-tree/`

- [ ] **Step 1: Verify the orphan directory contains only generated output**

Run:

```bash
find code/wset-app -type f -print | sort
```

Expected exactly:

```text
code/wset-app/.next/dev/types/cache-life.d.ts
code/wset-app/.next/dev/types/routes.d.ts
code/wset-app/.next/dev/types/validator.ts
```

- [ ] **Step 2: Remove the verified generated directory**

Run:

```bash
rm -rf code/wset-app
rmdir code
test ! -e code
```

Expected: all commands exit 0.

- [ ] **Step 3: Compare the broken worktree's authored files with its archive commit**

Run:

```bash
mkdir -p /private/tmp/decant-migration-20260702/flashcard-branch
git archive archive/flashcard-drill | tar -x -C /private/tmp/decant-migration-20260702/flashcard-branch
diff -qr \
  --exclude=.git \
  --exclude=.next \
  --exclude=node_modules \
  --exclude=.superpowers \
  --exclude=tsconfig.tsbuildinfo \
  --exclude=next-env.d.ts \
  /private/tmp/decant-migration-20260702/legacy-working-tree/.claude/worktrees/flashcard-drill \
  /private/tmp/decant-migration-20260702/flashcard-branch
```

Expected: no differences. If authored differences appear, stop cleanup, copy them to `/private/tmp/decant-migration-20260702/recovered-flashcard/`, and document them before continuing.

- [ ] **Step 4: Verify repository ownership and history**

Run:

```bash
find . -path './web/node_modules' -prune -o -path './web/.next' -prune -o -name .git -print
git log --all --oneline --decorate --graph -20
git show --oneline --no-patch archive/flashcard-drill
git status --short
```

Expected: only `./.git` is inside the workspace. Both the old app main commit and flashcard archive commit remain reachable. Only `web/package-lock.json` is modified.

### Task 6: Run the migration verification gate

**Files:**

- Generate ignored: `/Users/chrisamber/Developer/decant/web/.next/**`

- [ ] **Step 1: Verify the Python source tree imports**

Run from `/Users/chrisamber/Developer/decant`:

```bash
embeddings/.venv/bin/python -m py_compile embeddings/chunking.py embeddings/ingest.py embeddings/query.py embeddings/retrieval.py
```

Expected: exit 0 with no output.

- [ ] **Step 2: Record the known lint baseline**

Run from `/Users/chrisamber/Developer/decant/web`:

```bash
npm run lint
```

Expected: exit 1 with exactly six `no-explicit-any` errors and two unused-import warnings, matching the pre-migration audit and showing no path-resolution failures.

- [ ] **Step 3: Build the relocated Next.js application**

Run:

```bash
npm run build
```

Expected: production compilation and static route generation succeed. If lint errors block the Next.js build, record that exact limitation and run `npx tsc --noEmit` to verify relocation and aliases independently; lint cleanup is the first task in the second plan.

- [ ] **Step 4: Verify generated output and ignored state**

Run:

```bash
git status --short --ignored
git diff --exit-code -- . ':!web/package-lock.json'
```

Expected: `web/.next`, `web/node_modules`, local environments, and editor state are ignored. No tracked files except `web/package-lock.json` differ.

- [ ] **Step 5: Remove temporary backups only after all verification passes**

Run:

```bash
rm -rf /private/tmp/decant-migration-20260702/legacy-working-tree
rm -rf /private/tmp/decant-migration-20260702/flashcard-branch
```

Keep `legacy-app.git`, `legacy-app.bundle`, and the lockfile copy until Project 2 has completed. Expected: the 1.5 GB stale working-tree copy is removed, while compact recovery artifacts remain.
