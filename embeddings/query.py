#!/usr/bin/env python3
"""Query the vault: hybrid vector+FTS search -> RRF -> rerank -> print
results plus one-hop wikilinked notes (the /vq CLI).

Usage:
  query.py <question> [--variant <rephrasing>]... [--no-hybrid]
           [--top N] [--context N] [--max-chars N] [--brief]

Pass 1-2 --variant rephrasings of the same question to widen recall; all
phrasings are embedded in one batched call and rank-fused before the rerank.

Detail knobs (default to a richer view than the matched-chunk-only legacy):
  --top N         number of reranked hits to show (default 8)
  --context N     neighbour chunks shown each side of a hit (default 1; 0 = off)
  --max-chars N   cap on printed chars per hit (default 4000; 0 = uncapped)
  --brief         legacy terse output: matched chunk only, 1000-char cap, no titles
"""

import argparse
import json
import sys

from retrieval import (
    DEFAULT_SCOPE,
    DEFAULT_TIER_WEIGHTS,
    chunk_window,
    connect,
    linked_pages,
    page_titles,
    retrieve,
)


def _fusion_rank(pre, slug, chunk_index):
    """1-based position of (slug, chunk_index) in the pre-rerank fusion list."""
    for i, h in enumerate(pre, 1):
        if h.slug == slug and h.chunk_index == chunk_index:
            return i
    return None


def _source_tier(slug: str) -> str:
    """Top-level corpus tier a slug belongs to (wiki or raw)."""
    return slug.split("/", 1)[0] if "/" in slug else slug


def _dedup_by_page(hits):
    """Collapse to one hit per page, keeping the highest-ranked chunk."""
    seen: set[str] = set()
    out = []
    for h in hits:
        if h.slug in seen:
            continue
        seen.add(h.slug)
        out.append(h)
    return out


def _body(hit, conn, context: int, max_chars: int, printed: set) -> str:
    """Hit text, optionally widened with neighbouring chunks and length-capped.
    The matched chunk is marked so it stays distinguishable from its context.
    `printed` tracks already-shown (slug, chunk_index) pairs so overlapping
    neighbour windows don't re-emit the same chunk text twice."""
    if context > 0:
        lo = max(0, hit.chunk_index - context)
        rows = chunk_window(conn, hit.slug, lo, hit.chunk_index + context)
        parts = []
        for idx, text in rows:
            if (hit.slug, idx) in printed:
                continue
            printed.add((hit.slug, idx))
            marker = f">>> chunk {idx} (matched)" if idx == hit.chunk_index \
                else f"--- chunk {idx}"
            parts.append(f"{marker} ---\n{text.strip()}")
        body = "\n\n".join(parts) if parts else "[chunks already shown above]"
    else:
        printed.add((hit.slug, hit.chunk_index))
        body = hit.text.strip()

    if max_chars and len(body) > max_chars:
        body = body[:max_chars] + "\n... [truncated]"
    return body


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("question", nargs="+", help="the question to ask")
    ap.add_argument("--variant", action="append", default=[],
                    help="alternative phrasing of the question (repeatable)")
    ap.add_argument("--no-hybrid", action="store_true",
                    help="vector-only retrieval (skip the FTS leg)")
    ap.add_argument("--scope", default=DEFAULT_SCOPE,
                    help="restrict results to a slug prefix (default: whole "
                         "indexed corpus). Use e.g. 'wiki/' for curated notes "
                         "or 'raw/' for source material.")
    ap.add_argument("--all", action="store_true",
                    help="search the whole indexed corpus — shorthand for "
                         "--scope all")
    ap.add_argument("--tier-weights", action="store_true",
                    help="apply the configured source-tier weights so curated "
                         "notes win close rankings; off by default")
    ap.add_argument("--top", type=int, default=8,
                    help="number of reranked hits to show (default 8)")
    ap.add_argument("--context", type=int, default=1,
                    help="neighbour chunks shown each side of a hit "
                         "(default 1; 0 = matched chunk only)")
    ap.add_argument("--max-chars", type=int, default=4000,
                    help="cap on printed chars per hit (default 4000; 0 = uncapped)")
    ap.add_argument("--brief", action="store_true",
                    help="legacy terse output: matched chunk only, 1000-char cap")
    ap.add_argument("--dedup", action="store_true",
                    help="collapse to one result per page (over-fetches to fill "
                         "--top distinct pages)")
    ap.add_argument("--json", action="store_true",
                    help="emit results as JSON (for piping to jq); disables prose")
    ap.add_argument("--debug", action="store_true",
                    help="print retrieval diagnostics (FTS-leg participation, "
                         "scope, candidate counts)")
    args = ap.parse_args()
    query = " ".join(args.question).strip()
    scope = "all" if args.all else args.scope

    if args.brief:
        args.context = 0
        args.max_chars = 1000

    # Over-fetch when deduping so we can still fill --top distinct pages.
    rerank_k = args.top * 3 if args.dedup else args.top

    try:
        conn = connect()
        result = retrieve(query, conn=conn, rerank_k=rerank_k,
                          variants=args.variant, hybrid=not args.no_hybrid,
                          scope=scope,
                          tier_weights=DEFAULT_TIER_WEIGHTS if args.tier_weights
                          else None)
    except RuntimeError as e:  # missing env/config — clean exit, not a traceback
        sys.exit(str(e))

    hits = result.post_rerank
    if args.dedup:
        hits = _dedup_by_page(hits)[:args.top]

    if args.json:
        titles = page_titles(conn, [h.slug for h in hits])
        payload = {
            "query": result.query,
            "scope": scope,
            "diagnostics": result.diagnostics,
            "results": [
                {
                    "slug": h.slug,
                    "title": titles.get(h.slug),
                    "chunk_index": h.chunk_index,
                    "rerank_score": h.score,
                    "fusion_rank": _fusion_rank(result.pre_rerank, h.slug,
                                                h.chunk_index),
                    "source_tier": _source_tier(h.slug),
                    "text": h.text,
                }
                for h in hits
            ],
        }
        conn.close()
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        return

    if not hits:
        print("No results.")
        conn.close()
        return

    titles = {} if args.brief else page_titles(conn, [h.slug for h in hits])

    print(f"Query: {query}  [scope: {scope}]\n")
    if args.debug:
        print(f"diagnostics: {result.diagnostics}\n")
    printed: set = set()
    for i, hit in enumerate(hits, 1):
        header = f"[{i}] {hit.slug} (chunk {hit.chunk_index}, rerank {hit.score:.4f}"
        if not args.brief:
            frank = _fusion_rank(result.pre_rerank, hit.slug, hit.chunk_index)
            if frank:
                header += f", fusion #{frank}"
        header += ")"
        print(header)
        title = titles.get(hit.slug)
        if title:
            print(f"    — {title}")
        print("-" * 80)
        print(_body(hit, conn, args.context, args.max_chars, printed))
        print("-" * 80)
        print()

    linked = linked_pages(hits, conn)
    conn.close()
    if linked:
        print("Linked notes (1 hop from the hits above):")
        for slug, title in linked:
            print(f"  - {slug} — {title}")


if __name__ == "__main__":
    main()
