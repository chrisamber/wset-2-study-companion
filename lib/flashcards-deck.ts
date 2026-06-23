// Auto-generates flashcards from the verified data. Pure — no React, no DOM.
// NOTHING here invents wine facts: cards derive only from VARIETIES / TERMS / GI_TO_GRAPE.
import { VARIETIES } from "@/data/varieties";
import { TERMS, GI_TO_GRAPE } from "@/data/terms";
import { normalize } from "@/lib/fuzzy";

export interface Card {
  id: string;
  deck: "assoc" | "terms";
  prompt: string;
  kicker?: string;
  canonical: string;
  accepted: string[];
  note?: string;
}

export type DeckId = "assoc" | "terms" | "all";

export function buildAssocCards(): Card[] {
  const map = new Map<string, { display: string; kicker: string; grapes: string[] }>();
  const add = (gi: string, kicker: string, grape: string) => {
    const key = normalize(gi);
    if (!key) return;
    let e = map.get(key);
    if (!e) {
      e = { display: gi, kicker, grapes: [] };
      map.set(key, e);
    }
    if (!e.kicker && kicker) e.kicker = kicker;
    if (!e.grapes.includes(grape)) e.grapes.push(grape);
  };
  for (const v of VARIETIES) for (const r of v.regions) add(r.gi, r.country, v.name);
  for (const g of GI_TO_GRAPE) add(g.gi, g.note, g.grape);

  const cards: Card[] = [];
  for (const [key, e] of map) {
    cards.push({
      id: `assoc:${key}`,
      deck: "assoc",
      prompt: `Which grape is associated with ${e.display}?`,
      kicker: e.kicker || undefined,
      canonical: e.grapes[0],
      accepted: e.grapes,
      note: e.grapes.length > 1 ? `Also valid: ${e.grapes.join(", ")}` : undefined,
    });
  }
  return cards;
}

export function buildTermCards(): Card[] {
  return TERMS.map((t) => ({
    id: `terms:${normalize(t.term)}`,
    deck: "terms" as const,
    prompt: t.meaning,
    kicker: `${t.country} · ${t.category}`,
    canonical: t.term,
    accepted: [t.term],
    note: t.note,
  }));
}

export const ASSOC_CARDS: Card[] = buildAssocCards();
export const TERM_CARDS: Card[] = buildTermCards();
export const ALL_CARDS: Card[] = [...ASSOC_CARDS, ...TERM_CARDS];

export function cardsForDeck(deck: DeckId): Card[] {
  if (deck === "assoc") return ASSOC_CARDS;
  if (deck === "terms") return TERM_CARDS;
  return ALL_CARDS;
}

export const DECKS: { id: DeckId; label: string }[] = [
  { id: "assoc", label: "Region → Grape" },
  { id: "terms", label: "Label terms" },
  { id: "all", label: "Everything" },
];
