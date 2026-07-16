#!/usr/bin/env python3
"""Embed WSET-2 study notes into pgvector via Voyage AI. Incremental — skips unchanged content.

Pass --force to clear content_hash on all pages and re-embed with the current model.
Required when switching embed models (different models produce incompatible vector spaces).

DATABASE SCOPE — read before changing PGVECTOR_DB_URL:
    This script owns Decant's semantic index, embedded with voyage-4. It indexes
    the wiki/ study notes plus optional raw/ source material (see SCOPE_ROOTS /
    IGNORE_* in chunking.py). Use a database dedicated to this checkout: the
    opt-in prune block deletes indexed rows whose slug is no longer on disk.
"""

import hashlib
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
import psycopg2
import voyageai

from chunking import (
    IGNORE_FILES, IGNORE_PARTS, SCOPE_ROOTS, VAULT_ROOT,
    build_chunks, iter_markdown, parse_title,
)

EMBED_MODEL = "voyage-4"


load_dotenv(Path(__file__).parent / ".env")


def _require_ssl(url: str) -> str:
    """Require TLS unless the connection URL explicitly selects an sslmode."""
    if "sslmode=" in url:
        return url
    sep = "&" if "?" in url else "?"
    return f"{url}{sep}sslmode=require"


def prune_decision(db_count: int, stale_count: int,
                   allow_override: bool = False) -> tuple[bool, str]:
    """Decide whether the prune block may delete `stale_count` rows.
    No rows are deleted without an explicit --allow-prune flag."""
    if stale_count <= 0:
        return True, "nothing to prune"
    if allow_override:
        return True, f"--allow-prune: deleting {stale_count} rows"
    return False, (
        f"REFUSING to prune {stale_count}/{db_count} rows. "
        f"Pruning is opt-in only to protect the authoritative store. "
        f"Re-run with --allow-prune if this shrink is intentional.")


def content_hash(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


def batch_texts(texts: list[str], max_docs: int = 128,
                max_tokens: int = 100_000) -> list[list[str]]:
    """Group texts into sub-batches bounded by doc count AND an estimated
    token budget, so a single Voyage request never overflows. A lone text
    larger than max_tokens still gets its own batch."""
    batches: list[list[str]] = []
    cur: list[str] = []
    cur_tokens = 0
    for t in texts:
        est = int(len(t.split()) * 1.3) + 1
        if cur and (len(cur) >= max_docs or cur_tokens + est > max_tokens):
            batches.append(cur)
            cur, cur_tokens = [], 0
        cur.append(t)
        cur_tokens += est
    if cur:
        batches.append(cur)
    return batches


def embed_all(vc, texts: list[str], max_docs: int = 128,
              max_tokens: int = 100_000) -> list[list[float]]:
    """Embed all texts in size-safe batches, preserving input order."""
    out: list[list[float]] = []
    for batch in batch_texts(texts, max_docs, max_tokens):
        result = vc.embed(batch, model=EMBED_MODEL, input_type="document")
        out.extend(result.embeddings)
    return out


def vec_literal(emb: list[float]) -> str:
    return "[" + ",".join(str(x) for x in emb) + "]"


# Lexical half of hybrid retrieval (see retrieval.py): a generated tsvector
# column stays in sync with chunk_text automatically, so ingest never has to
# populate it. Idempotent — safe to run on every ingest.
FTS_DDL = (
    """ALTER TABLE content_chunks ADD COLUMN IF NOT EXISTS chunk_tsv tsvector
       GENERATED ALWAYS AS (to_tsvector('english', chunk_text)) STORED""",
    """CREATE INDEX IF NOT EXISTS content_chunks_chunk_tsv_idx
       ON content_chunks USING gin (chunk_tsv)""",
)


def ensure_fts_schema(conn) -> None:
    cur = conn.cursor()
    for stmt in FTS_DDL:
        cur.execute(stmt)
    conn.commit()


def main() -> None:
    force = "--force" in sys.argv

    api_key = os.environ.get("VOYAGE_API_KEY")
    db_url = os.environ.get("PGVECTOR_DB_URL")
    if not api_key:
        sys.exit("VOYAGE_API_KEY not set in embeddings/.env")
    if not db_url:
        sys.exit("PGVECTOR_DB_URL not set in embeddings/.env")

    vc = voyageai.Client(api_key=api_key)
    conn = psycopg2.connect(_require_ssl(db_url))
    ensure_fts_schema(conn)
    cur = conn.cursor()

    if force:
        cur.execute("UPDATE pages SET content_hash = NULL")
        conn.commit()
        print(f"--force: cleared content_hash on all pages (model={EMBED_MODEL})")

    md_files = iter_markdown(SCOPE_ROOTS, IGNORE_PARTS)
    # Drop per-file exclusions: they're removed from the scan so any existing
    # row is pruned, while the file itself stays on disk.
    md_files = [p for p in md_files
                if str(p.relative_to(VAULT_ROOT)) not in IGNORE_FILES]
    print(f"Scanning {len(md_files)} markdown files across {len(SCOPE_ROOTS)} roots …")

    updated = skipped = errors = 0

    for path in md_files:
        slug = str(path.relative_to(VAULT_ROOT))
        try:
            content = path.read_text(encoding="utf-8")
        except Exception as e:
            print(f"  SKIP {slug}: read error — {e}")
            errors += 1
            continue

        title = parse_title(content, path)
        chash = content_hash(content)

        cur.execute(
            """
            INSERT INTO pages (slug, title, content, content_hash)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (slug) DO UPDATE
              SET title        = EXCLUDED.title,
                  content      = EXCLUDED.content,
                  content_hash = EXCLUDED.content_hash,
                  updated_at   = now()
            WHERE pages.content_hash IS DISTINCT FROM EXCLUDED.content_hash
            RETURNING id
            """,
            (slug, title, content, chash),
        )
        row = cur.fetchone()
        if row is None:
            skipped += 1
            continue

        page_id = row[0]

        final_chunks = build_chunks(title, content)
        if not final_chunks:
            conn.commit()
            updated += 1
            continue

        try:
            embeddings = embed_all(vc, final_chunks)
        except Exception as e:
            print(f"  ERROR {slug}: embed failed — {e}")
            conn.rollback()
            errors += 1
            continue

        cur.execute("DELETE FROM content_chunks WHERE page_id = %s", (page_id,))
        for i, (chunk, emb) in enumerate(zip(final_chunks, embeddings)):
            cur.execute(
                """
                INSERT INTO content_chunks
                    (page_id, slug, chunk_index, chunk_text, embedding, token_count)
                VALUES (%s, %s, %s, %s, %s::vector, %s)
                ON CONFLICT (slug, chunk_index) DO UPDATE
                  SET chunk_text  = EXCLUDED.chunk_text,
                      embedding   = EXCLUDED.embedding,
                      token_count = EXCLUDED.token_count
                """,
                (page_id, slug, i, chunk, vec_literal(emb), len(chunk.split())),
            )

        conn.commit()
        updated += 1
        print(f"  {slug} ({len(final_chunks)} chunks)")

    # Prune rows for pages no longer on disk (renames, deletions, old slug
    # schemes) — guarded so an incomplete local checkout cannot mass-delete.
    disk_slugs = {str(p.relative_to(VAULT_ROOT)) for p in md_files}
    cur.execute("SELECT slug FROM pages")
    db_slugs = [r[0] for r in cur.fetchall()]
    stale = [s for s in db_slugs if s not in disk_slugs]
    pruned = 0
    if stale:
        ok, reason = prune_decision(len(db_slugs), len(stale),
                                    allow_override="--allow-prune" in sys.argv)
        print(f"Prune: {len(stale)} DB rows absent from disk "
              f"(disk={len(disk_slugs)}, db={len(db_slugs)}) — {reason}")
        if not ok:
            conn.close()
            sys.exit("Aborting before prune (see message above).")

        # Loud warning banner for an actual prune.
        print("\n" + "!" * 80)
        print("!!! WARNING: EXECUTING DESTRUCTIVE PRUNE IN CONFIGURED INDEX !!!")
        print(f"!!! Deleting {len(stale)} pages and their content chunks from the store.")
        print("!" * 80 + "\n")

        cur.execute("DELETE FROM content_chunks WHERE slug = ANY(%s)", (stale,))
        cur.execute("DELETE FROM pages WHERE slug = ANY(%s)", (stale,))
        conn.commit()
        pruned = len(stale)

    conn.close()
    print(f"\nDone — {updated} updated, {skipped} unchanged, {errors} errors, {pruned} pruned")


if __name__ == "__main__":
    main()
