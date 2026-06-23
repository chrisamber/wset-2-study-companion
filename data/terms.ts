import type { Term } from "@/lib/types";

// Labelling & GI glossary, grounded in the RAG corpus (LO1 origin labelling,
// LO3/LO4 quality terms, LO5 sparkling/fortified terms).

export const TERMS: Term[] = [
  // EU origin framework
  { term: "PDO", country: "EU", category: "EU origin", meaning: "Protected Designation of Origin — tighter, smaller, place-specific rules. The higher-quality EU origin tier.", note: "France AOC, Italy DOC/DOCG, Spain DO/DOCa, Germany Qualitäts-/Prädikatswein are all PDOs." },
  { term: "PGI", country: "EU", category: "EU origin", meaning: "Protected Geographical Indication — a broader area with looser rules.", note: "France Vin de Pays/IGP, Italy IGT, Spain Vino de la Tierra, Germany Landwein." },

  // France
  { term: "AOC / AOP", country: "France", category: "classification", meaning: "Appellation d'Origine Contrôlée/Protégée — France's top origin tier; equivalent to PDO." },
  { term: "Vin de Pays / IGP", country: "France", category: "classification", meaning: "Broader regional wine; equivalent to PGI." },
  { term: "Premier Cru", country: "France", category: "quality", meaning: "A ranked single vineyard (esp. Burgundy), one tier below Grand Cru." },
  { term: "Grand Cru", country: "France", category: "quality", meaning: "The top vineyard classification in Burgundy and Alsace; also exists in Chablis.", note: "In Bordeaux the comparable top term is Grand Cru Classé." },
  { term: "Bordeaux Supérieur", country: "France", category: "quality", meaning: "Bordeaux wine made to slightly stricter rules (e.g. riper grapes, more ageing) than basic Bordeaux." },
  { term: "Cru Bourgeois", country: "France", category: "quality", meaning: "A Médoc quality tier below the classed growths." },
  { term: "Grand Cru Classé", country: "France", category: "quality", meaning: "A classed-growth estate in Bordeaux's quality rankings." },

  // Italy
  { term: "DOCG", country: "Italy", category: "classification", meaning: "Denominazione di Origine Controllata e Garantita — Italy's top PDO tier." },
  { term: "DOC", country: "Italy", category: "classification", meaning: "Denominazione di Origine Controllata — a PDO tier below DOCG." },
  { term: "IGT", country: "Italy", category: "classification", meaning: "Indicazione Geografica Tipica — equivalent to PGI." },
  { term: "Classico", country: "Italy", category: "quality", meaning: "Wine from the historic heartland of a DOC/DOCG (e.g. Chianti Classico, Soave Classico)." },
  { term: "Riserva", country: "Italy", category: "ageing", meaning: "Extra ageing before release, set by each appellation's rules." },
  { term: "Amarone", country: "Italy", category: "quality", meaning: "Dry, powerful Valpolicella made from dried (passito) Corvina grapes." },
  { term: "Recioto", country: "Italy", category: "quality", meaning: "Sweet wine made from dried grapes (e.g. Recioto della Valpolicella, Recioto di Soave)." },

  // Spain
  { term: "DOCa / DOQ", country: "Spain", category: "classification", meaning: "Denominación de Origen Calificada — Spain's top PDO tier (e.g. Rioja, Priorat)." },
  { term: "DO", country: "Spain", category: "classification", meaning: "Denominación de Origen — a PDO tier below DOCa." },
  { term: "Vino de la Tierra", country: "Spain", category: "classification", meaning: "Regional wine; equivalent to PGI." },
  { term: "Joven", country: "Spain", category: "ageing", meaning: "'Young' wine, released with little or no oak ageing." },
  { term: "Crianza", country: "Spain", category: "ageing", meaning: "Aged a moderate time in oak and bottle before release; less than Reserva." },
  { term: "Reserva", country: "Spain", category: "ageing", meaning: "Longer oak + bottle ageing than Crianza." },
  { term: "Gran Reserva", country: "Spain", category: "ageing", meaning: "The longest ageing before release — only made in the best vintages." },

  // Germany
  { term: "Qualitätswein", country: "Germany", category: "classification", meaning: "Quality wine from one of the 13 regions; equivalent to PDO." },
  { term: "Prädikatswein", country: "Germany", category: "classification", meaning: "Top PDO category, graded by grape ripeness at harvest (the Prädikat ladder)." },
  { term: "Landwein", country: "Germany", category: "classification", meaning: "Regional wine; equivalent to PGI." },
  { term: "Kabinett", country: "Germany", category: "ripeness", meaning: "Lightest Prädikat, from normally ripe grapes." },
  { term: "Spätlese", country: "Germany", category: "ripeness", meaning: "'Late harvest' — riper grapes, more concentration." },
  { term: "Auslese", country: "Germany", category: "ripeness", meaning: "'Select harvest' — riper still, often with some botrytis." },
  { term: "Beerenauslese (BA)", country: "Germany", category: "ripeness", meaning: "Individually selected over-ripe / botrytised berries; sweet." },
  { term: "Trockenbeerenauslese (TBA)", country: "Germany", category: "ripeness", meaning: "Shrivelled botrytis berries — lusciously sweet, the top of the ripeness ladder." },
  { term: "Eiswein", country: "Germany", category: "ripeness", meaning: "Icewine — grapes frozen on the vine, pressed while frozen; sweet and high-acid." },
  { term: "Trocken", country: "Germany", category: "sweetness", meaning: "Dry." },
  { term: "Halbtrocken", country: "Germany", category: "sweetness", meaning: "Off-dry (half-dry)." },

  // Sparkling
  { term: "Traditional Method", country: "Sparkling", category: "sparkling", meaning: "Second fermentation in the bottle — fine, persistent bubbles and bready (autolytic) complexity. Used for Champagne and Cava." },
  { term: "Tank Method (Charmat)", country: "Sparkling", category: "sparkling", meaning: "Second fermentation in a pressurised tank — keeps fresh primary fruit. Used for Prosecco and Asti." },
  { term: "Méthode Cap Classique", country: "Sparkling", category: "sparkling", meaning: "South Africa's name for the traditional method." },
  { term: "Brut", country: "Sparkling", category: "sweetness", meaning: "Dry sparkling wine." },
  { term: "Demi-Sec", country: "Sparkling", category: "sweetness", meaning: "Medium-sweet sparkling wine." },
  { term: "Vintage / Non-Vintage (NV)", country: "Sparkling", category: "sparkling", meaning: "Vintage = single year; NV = a blend of years for a consistent house style." },

  // Fortified
  { term: "Fino", country: "Fortified", category: "fortified", meaning: "Pale, dry Sherry aged under a veil of flor yeast — fresh and saline." },
  { term: "Amontillado", country: "Fortified", category: "fortified", meaning: "Sherry aged first under flor then oxidatively — amber, nutty, dry." },
  { term: "Oloroso", country: "Fortified", category: "fortified", meaning: "Sherry aged oxidatively (no flor) — deep, nutty, full-bodied; dry." },
  { term: "Cream / PX", country: "Fortified", category: "fortified", meaning: "Sweetened Sherry styles; PX (Pedro Ximénez) is intensely sweet and raisined." },
  { term: "Ruby / Reserve", country: "Fortified", category: "fortified", meaning: "Youthful, fruity Port aged briefly to keep fresh red-fruit character." },
  { term: "Tawny", country: "Fortified", category: "fortified", meaning: "Port aged long in cask (oxidative) — dried-fruit, nutty, brown-tinged." },
  { term: "Late Bottled Vintage (LBV)", country: "Fortified", category: "fortified", meaning: "Port from a single year aged ~4–6 years in cask before bottling." },
  { term: "Vintage Port", country: "Fortified", category: "fortified", meaning: "Port from a single declared year, bottled young to age for decades." },

  // Vineyard / grape-growing terms
  { term: "Old Vine / Vieilles Vignes", country: "Vineyard", category: "vineyard", meaning: "Wine from old vines, which give lower yields and often more concentration." },
  { term: "Vintage", country: "Vineyard", category: "vineyard", meaning: "The year the grapes were grown and harvested." },
  { term: "Late Harvest / Vendanges Tardives", country: "Vineyard", category: "vineyard", meaning: "Grapes picked extra-ripe for a richer, often sweeter wine." },
  { term: "Noble Rot / Botrytis", country: "Vineyard", category: "vineyard", meaning: "Beneficial fungus that shrivels grapes and concentrates sugar — for sweet wines (Sauternes, Tokaji, TBA)." },
  { term: "Icewine / Eiswein", country: "Vineyard", category: "vineyard", meaning: "Sweet wine from grapes frozen on the vine and pressed while frozen." },
];

// Famous GIs whose name effectively tells you the grape — derived cross-reference
// for the decoder (each entry is supported by the variety data).
export const GI_TO_GRAPE: { gi: string; grape: string; note: string }[] = [
  { gi: "Chablis", grape: "Chardonnay", note: "Unoaked, high-acid white Burgundy." },
  { gi: "Sancerre / Pouilly-Fumé", grape: "Sauvignon Blanc", note: "Loire Valley, France." },
  { gi: "Barolo / Barbaresco", grape: "Nebbiolo", note: "Piedmont, Italy." },
  { gi: "Chianti / Brunello di Montalcino", grape: "Sangiovese", note: "Tuscany, Italy." },
  { gi: "Beaujolais", grape: "Gamay", note: "Southern Burgundy, France." },
  { gi: "Hermitage / Côte-Rôtie", grape: "Syrah", note: "Northern Rhône, France." },
  { gi: "Rioja / Ribera del Duero", grape: "Tempranillo", note: "Spain." },
  { gi: "Vouvray", grape: "Chenin Blanc", note: "Loire Valley, France." },
  { gi: "Condrieu", grape: "Viognier", note: "Northern Rhône, France." },
  { gi: "Gavi", grape: "Cortese", note: "Piedmont, Italy." },
  { gi: "Soave", grape: "Garganega", note: "Veneto, Italy." },
  { gi: "Mosel", grape: "Riesling", note: "Germany." },
];
