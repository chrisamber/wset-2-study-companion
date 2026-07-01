export type EmbeddingRecord = {
  name: string;
  embedding: number[];
};

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) {
    throw new Error("Embedding vectors must be non-empty and equal in length");
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function topMatches(
  queryEmbedding: number[],
  records: EmbeddingRecord[],
  k: number
): EmbeddingRecord[] {
  return [...records]
    .map((record) => ({
      record,
      score: cosineSimilarity(queryEmbedding, record.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((entry) => entry.record);
}
