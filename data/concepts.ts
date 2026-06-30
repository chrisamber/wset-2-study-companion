import type { Concept } from "@/lib/types";

// Per-Learning-Outcome study content, grounded in the RAG corpus. Numbers are the
// exam weighting (MCQs per LO out of 50).

export const CONCEPTS: Concept[] = [
  {
    lo: 1,
    title: "Vineyard, grape & climate",
    questions: 5,
    blurb: "What a grape and a vine need, how grapes ripen, how climate shapes style, and how origin is regulated by Geographical Indications.",
    sections: [
      {
        heading: "Parts of a grape",
        points: [
          "Skin → colour, tannins, flavours.",
          "Pulp → sugar, acids, water, flavours.",
          "Seeds & stems → tannins.",
        ],
      },
      {
        heading: "What a vine needs & how grapes ripen",
        points: [
          "A vine needs warmth, sunlight, water, nutrients and carbon dioxide (CO₂).",
          "Grape formation: flowering → fruit set → véraison (colour change, ripening begins).",
          "As grapes ripen: sugar rises, acid falls, colour & tannins develop, green aromas turn to riper fruit.",
        ],
      },
      {
        heading: "Climate & weather",
        points: [
          "Climate categories: cool, moderate, warm.",
          "Influences: latitude, altitude, slope, aspect, soils, seas/rivers, fog/cloud.",
          "Cool climate → higher acid, lighter body, less ripe fruit; warm → riper fruit, fuller body, more alcohol.",
        ],
      },
      {
        heading: "Geographical Indications (GIs)",
        points: [
          "PDO = tighter, smaller, place-specific rules; PGI = broader area, looser rules.",
          "France: AOC/AOP (PDO), Vin de Pays/IGP (PGI).",
          "Italy: DOCG → DOC (PDO), IGT (PGI). Spain: DOCa → DO (PDO), Vino de la Tierra (PGI).",
          "Germany: Qualitätswein, Prädikatswein (PDO), Landwein (PGI).",
        ],
      },
    ],
  },
  {
    lo: 2,
    title: "Winemaking & bottle ageing",
    questions: 4,
    blurb: "Fermentation, the choices that shape style (temperature, oak, malolactic conversion, lees, blending), and how wine changes in bottle.",
    sections: [
      {
        heading: "Fermentation & process",
        points: [
          "Alcoholic fermentation: yeast converts grape sugar into alcohol + carbon dioxide.",
          "Stages: crushing → fermentation → pressing → storage/maturation → blending → packaging.",
          "Red ferments with skins (colour & tannin); white without; rosé = short skin maceration or blending.",
        ],
      },
      {
        heading: "Options that shape style",
        points: [
          "Cool fermentation preserves fresh fruity aromas (typical whites); warm extracts more (typical reds).",
          "Oak vessels add flavour by size/age/toast — new small oak gives the most (vanilla, spice, toast); steel & concrete are neutral.",
          "Malolactic conversion (MLC): sharp malic acid → softer lactic acid (buttery).",
          "Lees ageing adds body and bready/savoury complexity. Blending gives consistency, complexity or style.",
          "Sweet wine: stop fermentation early (leaving sugar) or add sweetness.",
        ],
      },
      {
        heading: "Bottle ageing",
        points: [
          "Red: colour shifts ruby → garnet/brown; tannins soften; fresh fruit → dried fruit, leather, earth.",
          "White: colour deepens toward gold; fresh fruit → honey & nutty notes.",
        ],
      },
    ],
  },
  {
    lo: 3,
    title: "The eight principal grape varieties",
    questions: 19,
    blurb: "The biggest slice of the exam. Four black (Merlot, Cabernet Sauvignon, Syrah/Shiraz, Pinot Noir) and four white (Chardonnay, Pinot Gris/Grigio, Riesling, Sauvignon Blanc) — their characteristics, key regions/GIs, and how cool vs warm climate changes the style.",
    sections: [
      {
        heading: "How to study it",
        points: [
          "For each grape, learn: characteristics (body/acid/tannin/aromas), its key regions/GIs, and the cool→warm style shift.",
          "Drill both directions: grape → region and region → grape.",
          "Use the Explorer and Climate tabs — and Practice mode filtered to LO3.",
        ],
      },
    ],
  },
  {
    lo: 4,
    title: "Regionally important varieties",
    questions: 12,
    blurb: "Around 22 further varieties tied to specific regions and labelling terms — Tempranillo (Rioja), Sangiovese (Chianti), Nebbiolo (Barolo), Malbec (Mendoza), Gamay (Beaujolais), Chenin Blanc, Gewürztraminer and more.",
    sections: [
      {
        heading: "How to study it",
        points: [
          "These are mostly region → grape recall plus a labelling term each (Crianza, Classico, Cape Blend, Aszú…).",
          "Browse them in the Explorer; check terms in the Label Decoder.",
        ],
      },
    ],
  },
  {
    lo: 5,
    title: "Sparkling & fortified wines",
    questions: 6,
    blurb: "How the bubbles get in (traditional vs tank method) and the key distinction between Sherry and Port — the timing of fortification.",
    sections: [
      {
        heading: "Sparkling — two methods",
        points: [
          "Traditional method: 2nd fermentation in the bottle → fine, persistent bubbles + bready complexity (Champagne, Cava; South Africa = Méthode Cap Classique).",
          "Tank method (Charmat): 2nd fermentation in a pressurised tank → fresh primary fruit (Prosecco from Glera, Asti from Moscato).",
          "Terms: Brut (dry), Demi-Sec (medium-sweet), Vintage/NV.",
        ],
      },
      {
        heading: "Fortified — Sherry vs Port (the timing is everything)",
        points: [
          "Fortification = adding grape spirit to raise alcohol.",
          "Sherry (Jerez, Spain): fortified AFTER fermentation → dry base; aged under flor (Fino) or oxidatively (Oloroso). Sweet styles: Cream, PX.",
          "Port (Douro, Portugal): fortified to INTERRUPT fermentation → leaves residual sweetness. Styles: Ruby, Tawny, LBV, Vintage.",
        ],
      },
    ],
  },
  {
    lo: 6,
    title: "Storage, service & food pairing",
    questions: 4,
    blurb: "Looking after wine, serving it at the right temperature, spotting faults, and how food and wine interact.",
    sections: [
      {
        heading: "Storage & service",
        points: [
          "Store cool, at constant temperature, away from light; cork-sealed bottles on their side (keeps the cork moist).",
          "Service temps: sparkling & sweet — well chilled; light/medium white & rosé — chilled; full white — lightly chilled; light red — room temp or lightly chilled; medium/full red — room temp.",
          "Chilling raises perceived acidity/tannin and hides fruit; warmth raises perceived alcohol and aromatics.",
        ],
      },
      {
        heading: "Faults & food interactions",
        points: [
          "Cork taint (TCA): musty, wet-cardboard smell. Heat damage: flat, stewed character. Failed closure → premature oxidation.",
          "Match the weight of food and wine; use acidity to cut fat; pair tannin with protein/fat.",
          "Sweet/umami food makes wine seem harder (more bitter/acidic); salt & acid in food make wine seem softer — and food should not be sweeter than the wine.",
        ],
      },
    ],
  },
];
