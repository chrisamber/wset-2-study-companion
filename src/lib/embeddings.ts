const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = process.env.VOYAGE_MODEL || "voyage-4-lite";

type VoyageResponse = {
  data: { index: number; embedding: number[] }[];
};

export async function voyageEmbed(
  input: string[],
  inputType: "query" | "document"
): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY is not set");
  }

  const response = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input,
      model: VOYAGE_MODEL,
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Voyage embeddings request failed (${response.status}): ${body}`);
  }

  const json = (await response.json()) as VoyageResponse;
  return json.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}
