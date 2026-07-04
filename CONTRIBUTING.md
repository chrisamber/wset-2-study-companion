# Contributing to Decant

Thanks for helping improve this WSET Level 2 study pack! This guide covers what you need to get started.

## Prerequisites

- **Node.js** (LTS) and **Python 3.11+**
- **PostgreSQL** with pgvector (for semantic search only — optional)
- An Obsidian-compatible editor is helpful but not required

## Development Setup

```sh
git clone <repo-url> && cd decant
```

The `raw/` directory is gitignored — it contains copyrighted WSET material and won't be in your clone. You can still contribute to code and verify notes against publicly available WSET resources.

## Wiki Contributions

Study notes live in `wiki/`. Each note must stay **traceable to its source** in `raw/`. Since you won't have `raw/`, ground any factual additions in publicly available WSET Level 2 material and cite your source.

**Do not** invent regions, grape characteristics, tasting notes, or technical terms. If you can't verify a claim, flag it for review instead.

## Code Contributions

### Web App (`app/`)

Has its own git repo, README, and CLAUDE.md — read those first.

```sh
cd app && npm install && npm run dev
npm run lint
```

### Semantic Search (`embeddings/`)

Requires Python 3.11 and a local Postgres database with pgvector.

```sh
# After editing wiki notes, reindex:
embeddings/.venv/bin/python embeddings/ingest.py
# After moving/renaming notes:
embeddings/.venv/bin/python embeddings/ingest.py --force --allow-prune
```

## Testing

```sh
cd app && npm run lint       # web app linting
```

## Pull Requests

- Keep wiki edits and code changes in separate PRs when possible.
- For wiki PRs, note the source you used to verify the facts.
- For code PRs, make sure relevant tests pass before submitting.

## License

By contributing you agree your work is released under the project's [MIT License](LICENSE).
