# Decant 🍷

An open-source WSET Level 2 wine study pack — Obsidian vault, web app, and semantic search.

<!-- badges -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## What's inside

| Directory | Description |
|-----------|-------------|
| [`wiki/`](wiki/) | Obsidian study notes — varieties, concepts, foundation, practice exams, reference docs. Start at [`index.md`](wiki/index.md). |
| [`web/`](web/) | Next.js 16 web app (Learn / Explore / Decode / Climate / Quiz). [Live demo](https://decant-wines.vercel.app). Has its own README. |
| [`embeddings/`](embeddings/) | Semantic search over vault notes (Voyage AI + pgvector + Voyage rerank). |
| `raw/` | Source reference material (gitignored — copyrighted). |

## Quick start

### Browse the notes

Open the repo root as a vault in [Obsidian](https://obsidian.md). Notes use wikilinks (`[[note-slug]]`) and resolve by filename.

### Run the web app

```sh
cd web
npm install
npm run dev
```

Opens at `http://localhost:3000`. See [`web/README.md`](web/README.md) for details.

## Semantic search setup

Hybrid vector + full-text search over the vault using Voyage AI embeddings, pgvector, and Voyage rerank.

**Requirements:** Python 3.11 (pinned — `voyageai` needs <3.14), PostgreSQL with pgvector.

1. Create a local Postgres database called `wset2brain` with the pgvector extension enabled.

2. Create `embeddings/.env` with your Voyage AI API key and the Postgres connection URL. See `embeddings/ingest.py` for the expected variables.

3. Index the vault:

```sh
embeddings/.venv/bin/python embeddings/ingest.py
```

Use `--force --allow-prune` after renaming or moving notes.

4. Query:

```sh
embeddings/.venv/bin/python embeddings/query.py "what climate suits Pinot Noir?"
```

## Disclaimer

This project is **not affiliated with, endorsed by, or connected to** the Wine & Spirit Education Trust (WSET). All study material is independently authored. WSET is a registered trademark of the Wine & Spirit Education Trust.

## License

[MIT](LICENSE) — Chris Amber

## Author

**Chris Amber** — [amberaud.io](https://amberaud.io)
