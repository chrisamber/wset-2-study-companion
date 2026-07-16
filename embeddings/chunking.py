#!/usr/bin/env python3
"""Pure chunking core for the WSET-2 study vault: scan roots, ignore policy,
heading split, breadcrumb prefix, and large-chunk split. Imported by ingest.py
(the embed pipeline), so it must stay dependency-light: stdlib + re only, no
psycopg2/voyageai/dotenv."""

import re
from pathlib import Path

# This file lives at embeddings/chunking.py, so the vault root is two
# levels up (embeddings -> decant vault root).
VAULT_ROOT = Path(__file__).parent.parent

# Only study content belongs in the retrieval corpus. Keeping the roots explicit
# prevents repository docs, web-app Markdown, and agent instructions from being
# embedded when the monorepo grows. raw/ is optional in public clones.
SCOPE_ROOTS = [VAULT_ROOT / "wiki", VAULT_ROOT / "raw"]
IGNORE_PARTS = {
    ".git", ".claude", ".obsidian", ".trash", ".venv", "__pycache__",
    "code", "clippings", "node_modules", "dist",
}

# Per-file ingest exclusions (slugs relative to VAULT_ROOT). Files listed here
# stay on disk but out of the retrieval index. Used for agent-instruction files,
# which are not study content.
IGNORE_FILES = {
    "CLAUDE.md",
    "AGENTS.md",
}


def iter_markdown(roots: list[Path], ignore_parts: set[str]) -> list[Path]:
    """All *.md under the given roots, skipping any path that contains an
    ignored directory component. Deterministic (sorted)."""
    found: set[Path] = set()
    for root in roots:
        if not root.exists():
            continue
        for p in root.rglob("*.md"):
            if ignore_parts.isdisjoint(p.parts):
                found.add(p)
    return sorted(found)


def parse_title(content: str, path: Path) -> str:
    m = re.search(r"^title:\s*['\"]?(.+?)['\"]?\s*$", content, re.MULTILINE)
    if m:
        return m.group(1).strip()
    m = re.search(r"^# (.+)$", content, re.MULTILINE)
    if m:
        return m.group(1).strip()
    return path.stem


def chunk_by_heading(content: str) -> list[str]:
    """Split on ## headings; keep preamble (frontmatter + intro) as chunk 0."""
    parts = re.split(r"(?m)^(?=## )", content)
    return [p.strip() for p in parts if p.strip()]


def heading_of(chunk_text: str) -> str:
    """The ## heading a chunk starts with, or '' for the preamble chunk."""
    m = re.match(r"## (.+)", chunk_text)
    return m.group(1).strip() if m else ""


def breadcrumb(title: str, heading: str) -> str:
    return f"{title} › {heading}" if heading else title


def build_chunks(title: str, content: str, max_tokens: int = 800) -> list[str]:
    """Heading-split, size-split, then prefix every piece with a
    '{title} › {heading}' breadcrumb so each chunk embeds (and reranks)
    with its document context — contextual-retrieval lite. Sub-pieces of a
    long section all carry the same breadcrumb."""
    final: list[str] = []
    for c in chunk_by_heading(content):
        crumb = breadcrumb(title, heading_of(c))
        for piece in split_large_chunk(c, max_tokens=max_tokens):
            final.append(f"{crumb}\n\n{piece}")
    return final


def split_large_chunk(chunk_text: str, max_tokens: int = 800) -> list[str]:
    """Fallback: split chunks exceeding max_tokens by paragraph, then by line,
    then — as a final word-level guard — by hard word slices. A single atomic
    line longer than max_tokens (no paragraph or line breaks) used to fall
    through unsplit; the closing post-pass now slices any still-oversized piece
    on word boundaries, so every returned piece is <= max_tokens words. No words
    are dropped or reordered."""
    words = chunk_text.split()
    if len(words) <= max_tokens:
        return [chunk_text]

    paragraphs = chunk_text.split("\n\n")
    sub_chunks = []
    current_chunk = []
    current_tokens = 0

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        para_tokens = len(para.split())

        if current_tokens + para_tokens > max_tokens and current_chunk:
            sub_chunks.append("\n\n".join(current_chunk))
            current_chunk = [para]
            current_tokens = para_tokens
        else:
            current_chunk.append(para)
            current_tokens += para_tokens

    if current_chunk:
        sub_chunks.append("\n\n".join(current_chunk))

    final_chunks = []
    for sub in sub_chunks:
        sub_words = len(sub.split())
        if sub_words <= max_tokens:
            final_chunks.append(sub)
        else:
            # Paragraph is itself too large: split by lines
            lines = sub.split("\n")
            line_chunk = []
            line_tokens = 0
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                line_toks = len(line.split())
                if line_tokens + line_toks > max_tokens and line_chunk:
                    final_chunks.append("\n".join(line_chunk))
                    line_chunk = [line]
                    line_tokens = line_toks
                else:
                    line_chunk.append(line)
                    line_tokens += line_toks
            if line_chunk:
                final_chunks.append("\n".join(line_chunk))

    # Final word-level guard: a single atomic line longer than max_tokens
    # survives the paragraph/line passes unsplit. Slice any still-oversized
    # piece on word boundaries so every returned chunk is <= max_tokens words.
    bounded = []
    for ch in final_chunks:
        w = ch.split()
        if len(w) <= max_tokens:
            bounded.append(ch)
        else:
            for i in range(0, len(w), max_tokens):
                bounded.append(" ".join(w[i:i + max_tokens]))
    return bounded
