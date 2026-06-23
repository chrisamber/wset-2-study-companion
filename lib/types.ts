// Shared domain types for the WSET L2 learning app.

export type Colour = "black" | "white";
export type Tier = "principal" | "regional";
export type Letter = "a" | "b" | "c" | "d";

export interface Region {
  gi: string;
  country: string;
}

export interface ClimateStyle {
  cool: string;
  warm: string;
  coolExample?: string;
  warmExample?: string;
}

export interface Variety {
  id: string;
  name: string; // display name, e.g. "Syrah / Shiraz"
  colour: Colour;
  tier: Tier; // principal = LO3, regional = LO4
  body: string;
  acidity: string;
  tannin: string; // "—" for whites
  sweetness?: string;
  aromas: string[];
  summary: string; // one-line characteristic, grounded in the RAG corpus
  regions: Region[];
  terms?: string[]; // labelling terms associated with this variety
  climate?: ClimateStyle;
}

export type TermCategory =
  | "EU origin"
  | "classification"
  | "quality"
  | "ageing"
  | "ripeness"
  | "sweetness"
  | "sparkling"
  | "fortified"
  | "vineyard";

export interface Term {
  term: string;
  country: string; // EU, France, Italy, Spain, Germany, …
  category: TermCategory;
  meaning: string;
  note?: string;
}

export interface Question {
  id: string;
  paper: number;
  lo: number;
  stem: string;
  options: Record<Letter, string>;
  answer: Letter;
  explanation: string;
}

export interface Concept {
  lo: number;
  title: string;
  questions: number; // exam weight (number of MCQs)
  blurb: string;
  sections: { heading: string; points: string[] }[];
}

export const LO_NAMES: Record<number, string> = {
  1: "Vineyard & climate",
  2: "Winemaking & ageing",
  3: "Principal varieties",
  4: "Regional varieties",
  5: "Sparkling & fortified",
  6: "Storage, service & pairing",
};
