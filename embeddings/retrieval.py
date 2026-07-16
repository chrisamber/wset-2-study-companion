#!/usr/bin/env python3
"""Reusable retrieval for the Decant study index: embed the query (plus any
variants, one batched call) -> pgvector cosine top-K AND Postgres FTS top-K
per query -> reciprocal-rank fusion -> rerank-2.5 top-N against the original
query. Imported by query.py (the /vq CLI).

Pre-rerank Hit.score is the RRF fusion score (rank-based, ~0.016 max), not a
cosine similarity; post-rerank Hit.score is the rerank-2.5 relevance score.
"""

import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv
import psycopg2
import voyageai

EMBED_MODEL = "voyage-4"
RERANK_MODEL = "rerank-2.5"
RETRIEVE_K = 20
RERANK_K = 5
RRF_K = 60  # standard reciprocal-rank-fusion damping constant
# Variant rank-lists count for less than the original query's in fusion, so an
# off-intent rephrasing can ADD recall but not EVICT the original's hits from
# the candidate pool. 1.0 would restore equal-weight behaviour.
VARIANT_RRF_WEIGHT = 0.5

# Opt-in source-tier weights let curated wiki/ answers win close rankings
# without pushing dense raw/ sources out of the candidate pool.
DEFAULT_TIER_WEIGHTS = {
    "wiki": 1.1,
    "raw": 0.9,
}

load_dotenv(Path(__file__).parent / ".env")

# [[target]] / [[target|alias]] / [[target#heading]] — group 1 is the target.
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]")


@dataclass
class Hit:
    slug: str
    chunk_index: int
    score: float
    text: str = ""


@dataclass
class RetrieveResult:
    query: str
    pre_rerank: list[Hit]
    post_rerank: list[Hit]
    diagnostics: dict = field(default_factory=dict)


def rrf_fuse(rankings: list[list], k: int = RRF_K,
             weights: list[float] | None = None) -> list[tuple]:
    """Reciprocal-rank fusion: each ranking contributes weight/(k + rank + 1)
    per key. `weights` (parallel to `rankings`, default all 1.0) lets variant
    rank-lists count for less than the original query's, so an off-intent
    variant can add recall without evicting the original's hits. Returns
    (key, score) sorted by fused score desc, key for stable ties."""
    if weights is None:
        weights = [1.0] * len(rankings)
    scores: dict = {}
    for ranking, w in zip(rankings, weights):
        for rank, key in enumerate(ranking):
            scores[key] = scores.get(key, 0.0) + w / (k + rank + 1)
    return sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))


def tier_of(slug: str) -> str:
    """Return the top-level corpus tier (wiki or raw)."""
    return slug.split("/", 1)[0] if "/" in slug else slug


def tier_weight(slug: str, weights: dict | None) -> float:
    """Tier multiplier for `slug`; 1.0 for an unlisted tier or falsy `weights`."""
    if not weights:
        return 1.0
    return weights.get(tier_of(slug), 1.0)


def reweight_by_tier(scored: list, weights: dict | None) -> list:
    """Scale each ((slug, idx), score) by its source-tier weight and re-sort
    descending. No-op when `weights` is falsy. Pure — does not mutate input.
    Applied PRE-rerank (before the RETRIEVE_K cut), so it shapes the candidate
    pool the reranker sees and can change which chunks survive."""
    if not weights:
        return scored
    rescored = [(key, score * tier_weight(key[0], weights)) for key, score in scored]
    rescored.sort(key=lambda kv: (-kv[1], kv[0]))
    return rescored


def apply_tier_weights(hits: list, weights: dict | None) -> list:
    """Scale each Hit.score by its source-tier weight and re-sort descending.
    No-op when `weights` is falsy. Pure — returns a new list. Applied post-rerank;
    re-sorting the final K changes only order, never the top-K set."""
    if not weights:
        return hits
    rescored = [Hit(h.slug, h.chunk_index, h.score * tier_weight(h.slug, weights),
                    h.text) for h in hits]
    rescored.sort(key=lambda h: (-h.score, h.slug, h.chunk_index))
    return rescored


def resolve_links(names: set[str], pages: list[tuple[str, str]],
                  exclude: set[str]) -> list[tuple[str, str]]:
    """Match wikilink targets against (slug, title) pages by filename stem or
    title, skipping slugs in `exclude`. Pure; returns sorted (slug, title)."""
    out = []
    for slug, title in pages:
        if slug in exclude:
            continue
        stem = slug.rsplit("/", 1)[-1].removesuffix(".md")
        if stem in names or (title or "") in names:
            out.append((slug, title))
    return sorted(out)


def linked_pages(hits: list[Hit], conn) -> list[tuple[str, str]]:
    """One-hop wikilink expansion: [[links]] in the hit texts, resolved to
    indexed pages not already among the hits."""
    names = {m.group(1).strip() for h in hits
             for m in WIKILINK_RE.finditer(h.text)}
    names.discard("")
    if not names:
        return []
    cur = conn.cursor()
    cur.execute("SELECT slug, title FROM pages")
    return resolve_links(names, cur.fetchall(), {h.slug for h in hits})


def chunk_window(conn, slug: str, lo: int, hi: int) -> list[tuple[int, str]]:
    """Fetch (chunk_index, chunk_text) for `slug` with chunk_index in [lo, hi],
    ordered. Used to widen a hit with its neighbouring chunks for context."""
    cur = conn.cursor()
    cur.execute(
        "SELECT chunk_index, chunk_text FROM content_chunks "
        "WHERE slug = %s AND chunk_index BETWEEN %s AND %s "
        "ORDER BY chunk_index",
        (slug, lo, hi),
    )
    return cur.fetchall()


def page_titles(conn, slugs) -> dict[str, str]:
    """Map slug -> title for the given slugs (slugs without a title row omitted)."""
    uniq = list({s for s in slugs})
    if not uniq:
        return {}
    cur = conn.cursor()
    cur.execute("SELECT slug, title FROM pages WHERE slug = ANY(%s)", (uniq,))
    return {slug: title for slug, title in cur.fetchall()}


def _require_ssl(url: str) -> str:
    """Require TLS unless the connection URL explicitly selects an sslmode."""
    if "sslmode=" in url:
        return url
    sep = "&" if "?" in url else "?"
    return f"{url}{sep}sslmode=require"


def connect():
    # RuntimeError lets callers report configuration errors without a traceback.
    db_url = os.environ.get("PGVECTOR_DB_URL")
    if not db_url:
        raise RuntimeError("PGVECTOR_DB_URL not set")
    return psycopg2.connect(_require_ssl(db_url))


def client() -> voyageai.Client:
    api_key = os.environ.get("VOYAGE_API_KEY")
    if not api_key:
        raise RuntimeError("VOYAGE_API_KEY not set")
    return voyageai.Client(api_key=api_key)


def _vec(emb: list[float]) -> str:
    return "[" + ",".join(str(x) for x in emb) + "]"


# Default retrieval scope: the whole indexed corpus, so curated wiki/ notes and
# dense raw/ sources can compete in the candidate pool. Pass scope="wiki/" or
# scope="raw/" to target one layer. Filtering at the SQL leg — not after rerank —
# keeps the RETRIEVE_K pool full of in-scope chunks.
DEFAULT_SCOPE = ""


def _scope_predicate(scope):
    """SQL slug-prefix filter for a scope. Returns (predicate, like_param): the
    predicate is a constant fragment ('cc.slug LIKE %s') and the value is bound
    separately, so this is injection-safe. None / '' / 'all' => no filter."""
    if not scope or scope == "all":
        return "", None
    return "cc.slug LIKE %s", scope + "%"


def _vector_sql(scope):
    pred, param = _scope_predicate(scope)
    where = f"WHERE {pred}\n        " if pred else ""
    sql = f"""
        SELECT cc.slug, cc.chunk_index, cc.chunk_text
        FROM content_chunks cc
        {where}ORDER BY cc.embedding <=> %s::vector
        LIMIT %s
    """
    return sql, ([param] if param is not None else [])


def _fts_sql(scope):
    pred, param = _scope_predicate(scope)
    extra = f" AND {pred}" if pred else ""
    sql = f"""
        SELECT cc.slug, cc.chunk_index, cc.chunk_text,
               ts_rank_cd(cc.chunk_tsv, q) AS score
        FROM content_chunks cc, websearch_to_tsquery('english', %s) q
        WHERE cc.chunk_tsv @@ q{extra}
        ORDER BY score DESC, cc.slug, cc.chunk_index
        LIMIT %s
    """
    return sql, ([param] if param is not None else [])


# Only short keyword-style queries get the OR fallback: ts_rank_cd has no IDF
# weighting, so OR-ing a long conversational question floods the fusion with
# chunks matching only its common words. Short queries are where the lexical
# leg wins (exact names, identifiers, versions).
OR_FALLBACK_MAX_TERMS = 6


def _or_query(query: str) -> str:
    """websearch_to_tsquery ANDs all terms, so multi-word queries often match
    nothing. Fallback: OR the terms — ts_rank_cd still ranks chunks matching
    more of them higher."""
    return " or ".join(query.split())


def _fts_rows(cur, query: str, k: int, scope=DEFAULT_SCOPE) -> list:
    sql, sp = _fts_sql(scope)
    try:
        cur.execute(sql, (query, *sp, k))
        rows = cur.fetchall()
        if not rows and len(query.split()) <= OR_FALLBACK_MAX_TERMS:
            cur.execute(sql, (_or_query(query), *sp, k))
            rows = cur.fetchall()
        return rows
    except psycopg2.errors.UndefinedColumn:
        # chunk_tsv missing (schema drift): degrade to vector-only rather than
        # poison the shared transaction. Roll back so the connection stays usable.
        cur.connection.rollback()
        print("vq: FTS unavailable (chunk_tsv missing) — using vector-only.",
              file=sys.stderr)
        return []


def retrieve(query: str, retrieve_k: int = RETRIEVE_K,
             rerank_k: int = RERANK_K, conn=None, vc=None,
             variants: list[str] | None = None,
             hybrid: bool = True,
             scope: str | None = DEFAULT_SCOPE,
             tier_weights: dict | None = None) -> RetrieveResult:
    query = (query or "").strip()
    clean_variants = [v.strip() for v in (variants or []) if v and v.strip()]
    if not query:
        # Nothing to embed or rerank against — Voyage rejects blank input, so
        # short-circuit before any API or database call.
        return RetrieveResult("", [], [], {"empty_query": True})

    own_conn = conn is None
    if conn is None:
        conn = connect()
    if vc is None:
        vc = client()

    queries = [query] + clean_variants

    cur = conn.cursor()
    embs = vc.embed(queries, model=EMBED_MODEL, input_type="query").embeddings

    rankings: list[list[tuple[str, int]]] = []
    weights: list[float] = []
    texts: dict[tuple[str, int], str] = {}

    # Leg weight: the original query (index 0) counts full; variants are
    # down-weighted so they widen recall without evicting the original's hits.
    def _leg_weight(i: int) -> float:
        return 1.0 if i == 0 else VARIANT_RRF_WEIGHT

    vsql, vparams = _vector_sql(scope)
    vector_rows = 0
    for i, emb in enumerate(embs):
        cur.execute(vsql, (*vparams, _vec(emb), retrieve_k))
        rows = cur.fetchall()
        vector_rows += len(rows)
        rankings.append([(r[0], r[1]) for r in rows])
        weights.append(_leg_weight(i))
        for r in rows:
            texts[(r[0], r[1])] = r[2]

    do_fts = hybrid
    fts_rows_total = 0
    if do_fts:
        for i, q in enumerate(queries):
            rows = _fts_rows(cur, q, retrieve_k, scope)
            fts_rows_total += len(rows)
            rankings.append([(r[0], r[1]) for r in rows])
            weights.append(_leg_weight(i))
            for r in rows:
                texts[(r[0], r[1])] = r[2]

    diagnostics = {
        "scope": scope,
        "tier_weights": bool(tier_weights),
        "n_queries": len(queries),
        "hybrid": hybrid,
        "vector_rows": vector_rows,
        "fts_rows": fts_rows_total,
        "fts_leg": ("empty" if (do_fts and fts_rows_total == 0)
                    else "active" if do_fts else "off"),
    }

    # Apply tier weights before the RETRIEVE_K cut so they can shape the
    # candidate set the reranker sees. No-op by default.
    fused = reweight_by_tier(rrf_fuse(rankings, weights=weights),
                             tier_weights)[:retrieve_k]
    pre = [Hit(slug, idx, score, texts[(slug, idx)])
           for (slug, idx), score in fused]

    post: list[Hit] = []
    if pre:
        docs = [h.text for h in pre]
        reranked = vc.rerank(query, docs, model=RERANK_MODEL,
                             top_k=min(rerank_k, len(docs)))
        for res in reranked.results:
            h = pre[res.index]
            post.append(Hit(h.slug, h.chunk_index,
                            float(res.relevance_score), h.text))

    # Apply the same weights post-rerank. Re-sorting changes order, not the set.
    post = apply_tier_weights(post, tier_weights)

    if own_conn:
        conn.close()
    return RetrieveResult(query, pre, post, diagnostics)
