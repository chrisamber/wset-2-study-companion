import { writeFileSync } from "node:fs";
import { GRAPES } from "../src/data/grapes.ts";
import { voyageEmbed } from "../src/lib/embeddings.ts";

function grapeToText(grape: (typeof GRAPES)[number]): string {
  return [
    grape.name,
    `Regions: ${grape.regions}`,
    `Body: ${grape.body}, Acidity: ${grape.acidity}`,
    grape.tannin ? `Tannin: ${grape.tannin}` : null,
    `Aromas: ${grape.aromas}`,
    `Pairings: ${grape.pairings}`,
    grape.notes,
  ]
    .filter(Boolean)
    .join(". ");
}

async function main() {
  const texts = GRAPES.map(grapeToText);
  const embeddings = await voyageEmbed(texts, "document");

  const records = GRAPES.map((grape, i) => ({
    name: grape.name,
    embedding: embeddings[i],
  }));

  const outPath = new URL("../src/data/grape-embeddings.json", import.meta.url);
  writeFileSync(outPath, JSON.stringify(records, null, 2));

  console.log(`Wrote ${records.length} embeddings to src/data/grape-embeddings.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
