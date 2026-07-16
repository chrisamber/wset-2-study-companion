CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS pages (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_chunks (
    id BIGSERIAL PRIMARY KEY,
    page_id BIGINT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1024) NOT NULL,
    token_count INTEGER NOT NULL,
    chunk_tsv TSVECTOR GENERATED ALWAYS AS
        (to_tsvector('english', chunk_text)) STORED,
    UNIQUE (slug, chunk_index)
);

CREATE INDEX IF NOT EXISTS content_chunks_page_id_idx
    ON content_chunks (page_id);
CREATE INDEX IF NOT EXISTS content_chunks_embedding_idx
    ON content_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS content_chunks_chunk_tsv_idx
    ON content_chunks USING gin (chunk_tsv);
