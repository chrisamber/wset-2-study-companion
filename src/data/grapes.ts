export type Grape = {
  name: string;
  tier: "principal" | "regional" | "sparkling";
  color: "white" | "red";
  dot: string;
  body: string;
  acidity: string;
  tannin?: string;
  aromas: string;
  regions: string;
  pairings: string;
  notes: string;
};

export const GRAPES: Grape[] = [
  // ─── WHITE · PRINCIPAL ─────────────────────────────────
  {
    name: "Chardonnay",
    tier: "principal",
    color: "white",
    dot: "#D4B896",
    body: "Light to full",
    acidity: "Medium",
    aromas: "Apple, citrus, melon; butter, vanilla if oaked",
    regions: "Burgundy · California · Australia",
    pairings: "Roast chicken, lobster, creamy pasta, soft cheeses",
    notes: "The chameleon — neutral fruit acts as a canvas for winemaking. Chablis (lean, mineral, unoaked) vs Meursault (rich, buttery, oaked with MLF). Warm-climate: tropical fruit, melon.",
  },
  {
    name: "Sauvignon Blanc",
    tier: "principal",
    color: "white",
    dot: "#A8B87A",
    body: "Light to medium",
    acidity: "High",
    aromas: "Grass, gooseberry, passion fruit, asparagus",
    regions: "Loire · Marlborough · Bordeaux",
    pairings: "Goat cheese, salads, shellfish, green herbs",
    notes: "Unmistakable aromatics. Sancerre (nettles, wet stone, citrus) vs Marlborough (passion fruit, guava, cut grass). Almost never oaked except Pessac-Léognan. Best drunk young.",
  },
  {
    name: "Riesling",
    tier: "principal",
    color: "white",
    dot: "#D6C872",
    body: "Light to medium",
    acidity: "High",
    aromas: "Lime, peach, petrol (aged), floral",
    regions: "Mosel · Alsace · Clare Valley",
    pairings: "Sushi, Thai food, pork, sweet-sour dishes",
    notes: "Many experts' greatest white grape. Mosel: delicate, 7-8% ABV, electric acidity. Alsace: drier, fuller. Clare/Eden Valley: bone-dry, lime juice. Petrol note with age is a hallmark. Dry to sweet. Never oaked.",
  },
  {
    name: "Pinot Grigio / Pinot Gris",
    tier: "principal",
    color: "white",
    dot: "#C8C4AD",
    body: "Light to medium",
    acidity: "Medium",
    aromas: "Lemon, apple (IT); peach, honey (FR)",
    regions: "NE Italy · Alsace",
    pairings: "Charcuterie, roast pork, mildly spiced dishes",
    notes: "Same grape, radically different wines. Pinot Grigio (Veneto/Trentino): light, clean, refreshing, aperitif. Pinot Gris (Alsace): fuller, ripe peach, smoke, honey, sometimes off-dry.",
  },

  // ─── WHITE · REGIONAL ──────────────────────────────────
  {
    name: "Gewürztraminer",
    tier: "regional",
    color: "white",
    dot: "#E8C4A0",
    body: "Medium to full",
    acidity: "Low",
    aromas: "Lychee, rose, ginger, Turkish delight",
    regions: "Alsace",
    pairings: "Spicy food (Thai, Indian, Chinese), Munster cheese, foie gras",
    notes: "Easiest grape to identify blind — lychee + rose petal. Low acidity gives rich, oily mouthfeel. Can be dry, Vendange Tardive (late harvest), or Sélection de Grains Nobles (sweet).",
  },
  {
    name: "Viognier",
    tier: "regional",
    color: "white",
    dot: "#E8D4A0",
    body: "Full",
    acidity: "Low to medium",
    aromas: "Peach, apricot, blossom",
    regions: "Condrieu · Languedoc",
    pairings: "Rich fish, creamy curries, roasted root vegetables",
    notes: "Opulent, intensely perfumed. Condrieu (Northern Rhône) is the benchmark. Sometimes co-fermented with Syrah in Côte-Rôtie to add aromatic lift and stabilise colour.",
  },
  {
    name: "Albariño",
    tier: "regional",
    color: "white",
    dot: "#B8C8A0",
    body: "Light to medium",
    acidity: "High",
    aromas: "Peach, apricot, citrus, saline",
    regions: "Rías Baixas",
    pairings: "Shellfish, grilled fish, ceviche",
    notes: "Distinctive saline/briny quality from Atlantic-influenced vineyards. Always stainless steel, best drunk young. The seafood wine.",
  },
  {
    name: "Chenin Blanc",
    tier: "regional",
    color: "white",
    dot: "#C8D4A0",
    body: "Light to full",
    acidity: "High",
    aromas: "Apple, quince, honey, wet wool",
    regions: "Loire (Vouvray) · South Africa",
    pairings: "Dry: poultry, pork. Sweet: fruit desserts, blue cheese",
    notes: "Most versatile grape for styles — dry (sec), off-dry (demi-sec), sweet (moelleux), or sparkling, all from Vouvray alone. Savennières: austere, mineral. South Africa: simple quaffers to serious barrel-fermented. High acidity = excellent ageing.",
  },
  {
    name: "Sémillon",
    tier: "regional",
    color: "white",
    dot: "#D4C890",
    body: "Medium to full",
    acidity: "Low to medium",
    aromas: "Lemon, lanolin; toast, honey (aged)",
    regions: "Bordeaux · Hunter Valley",
    pairings: "Dry: seafood, chicken. Sauternes: foie gras, Roquefort",
    notes: "Quiet achiever. Blended with Sauvignon Blanc in Bordeaux (dry whites). Dominant in Sauternes (botrytis, honeyed). Hunter Valley: unoaked, starts lean, ages magnificently 10-20 years into toast + marmalade.",
  },
  {
    name: "Muscat",
    tier: "sparkling",
    color: "white",
    dot: "#E8D8B0",
    body: "Light to medium",
    acidity: "Low to medium",
    aromas: "Grape, floral, orange blossom, perfume",
    regions: "Asti · Beaumes-de-Venise · Rutherglen",
    pairings: "Fruit desserts, light pastries, or as aperitif",
    notes: "Unique — actually smells and tastes like grapes. Moscato d'Asti: light, sweet, gently fizzy, low alcohol. Rutherglen Muscat: intensely sweet fortified, aged decades. Immediate appeal.",
  },

  // ─── RED · PRINCIPAL ───────────────────────────────────
  {
    name: "Cabernet Sauvignon",
    tier: "principal",
    color: "red",
    dot: "#6B1D2E",
    body: "Full",
    acidity: "High",
    tannin: "High",
    aromas: "Blackcurrant, cedar, mint, green pepper",
    regions: "Bordeaux · Napa · Coonawarra",
    pairings: "Steak, lamb, hard aged cheeses, rich stews",
    notes: "Most widely planted premium red. Thick skin → deep colour, firm tannin, great ageing. Bordeaux Left Bank: blended with Merlot, French oak, blackcurrant + cedar. Napa: single-variety, riper, more oak. Coonawarra: eucalyptus + mint.",
  },
  {
    name: "Merlot",
    tier: "principal",
    color: "red",
    dot: "#7B2D3E",
    body: "Medium to full",
    acidity: "Medium",
    tannin: "Medium",
    aromas: "Plum, chocolate, herbal",
    regions: "Bordeaux (Right Bank) · Chile",
    pairings: "Roast pork, duck, mushroom dishes, medium cheeses",
    notes: "Soft, fleshy counterpart to Cab Sauv. Right Bank (St-Émilion, Pomerol): silky plum, chocolate, truffle — some of the world's most expensive wines. Chile: excellent value, ripe plum, soft texture.",
  },
  {
    name: "Pinot Noir",
    tier: "principal",
    color: "red",
    dot: "#8B3A4A",
    body: "Light to medium",
    acidity: "Medium",
    tannin: "Low to medium",
    aromas: "Cherry, strawberry, mushroom, earth",
    regions: "Burgundy · Oregon · New Zealand",
    pairings: "Salmon, duck, mushroom risotto, soft cheeses, truffle dishes",
    notes: "Thin-skinned, climate-sensitive, hauntingly complex at best. Burgundy: cherry, raspberry, violet → mushroom, game, truffle. Oregon (Willamette): bright red fruit, earthy. Central Otago: riper, darker, silky.",
  },
  {
    name: "Syrah / Shiraz",
    tier: "principal",
    color: "red",
    dot: "#4A1525",
    body: "Full",
    acidity: "Medium",
    tannin: "Medium to high",
    aromas: "Blackberry, pepper, chocolate, smoke",
    regions: "N. Rhône · Barossa · McLaren Vale",
    pairings: "Rhône Syrah: game, grilled meats. Shiraz: barbecue, ribs, hard cheeses",
    notes: "One grape, two personalities. Syrah (N. Rhône): black pepper, violet, olive, firm tannin, savoury (Hermitage, Côte-Rôtie). Shiraz (Barossa): ripe black fruit, chocolate, mocha, sweet American oak.",
  },

  // ─── RED · REGIONAL ────────────────────────────────────
  {
    name: "Grenache",
    tier: "regional",
    color: "red",
    dot: "#A04040",
    body: "Medium to full",
    acidity: "Low",
    tannin: "Low to medium",
    aromas: "Strawberry, raspberry, white pepper, spice",
    regions: "S. Rhône · Spain · Australia",
    pairings: "Mediterranean cuisine, grilled vegetables, lamb, tomato-based pasta",
    notes: "World's most widely planted red grape. Thin skin → light colour, low tannin, but generous alcohol (14-15%+). Backbone of Châteauneuf-du-Pape. Spanish Garnacha in Priorat. Australian GSM blend.",
  },
  {
    name: "Tempranillo",
    tier: "regional",
    color: "red",
    dot: "#8B4040",
    body: "Medium to full",
    acidity: "Medium",
    tannin: "Medium",
    aromas: "Cherry, leather, vanilla, tobacco",
    regions: "Rioja · Ribera del Duero",
    pairings: "Roast lamb, chorizo, Manchego, paella",
    notes: "Spain's noble grape. Natural affinity for oak — Spanish ageing terms matter: Crianza (2yr/6mo oak), Reserva (3yr/12mo), Gran Reserva (5yr/18mo). American oak: coconut, vanilla. French oak: spice, toast.",
  },
  {
    name: "Sangiovese",
    tier: "regional",
    color: "red",
    dot: "#9B4545",
    body: "Medium to full",
    acidity: "High",
    tannin: "High",
    aromas: "Cherry, dried herb, tomato leaf",
    regions: "Chianti · Brunello di Montalcino",
    pairings: "Pasta with tomato sauces, grilled meats, pizza, Pecorino, Parmigiano",
    notes: "Soul of Tuscan wine. High acidity + firm tannin = supremely food-friendly. Chianti Classico: min 80% Sangiovese, sour cherry, herbs, dusty. Brunello: 100% Sangiovese, 5yr before release, great structure.",
  },
  {
    name: "Nebbiolo",
    tier: "regional",
    color: "red",
    dot: "#7B3535",
    body: "Full",
    acidity: "High",
    tannin: "Very high",
    aromas: "Rose, tar, cherry, leather, truffle",
    regions: "Barolo · Barbaresco",
    pairings: "Braised beef, truffle risotto, aged hard cheeses, game",
    notes: "Deceptively pale colour but fierce tannin + bracing acidity. Name from nebbia (fog). Barolo: min 38mo ageing (18 in wood). Barbaresco: min 26mo (9 in wood). Needs years in bottle to soften.",
  },
  {
    name: "Malbec",
    tier: "regional",
    color: "red",
    dot: "#5B2040",
    body: "Full",
    acidity: "Medium",
    tannin: "Medium to high",
    aromas: "Plum, blackberry, violet, chocolate",
    regions: "Mendoza · Cahors",
    pairings: "Grilled steak (asado), empanadas, smoky barbecue",
    notes: "Minor Bordeaux blending grape → Argentina's calling card. Mendoza (Luján de Cuyo, Uco Valley): high altitude (up to 1500m), UV thickens skins → deep colour, ripe tannins, cool nights preserve acidity. Cahors: leaner, more rustic.",
  },
  {
    name: "Gamay",
    tier: "regional",
    color: "red",
    dot: "#C06060",
    body: "Light to medium",
    acidity: "High",
    tannin: "Low",
    aromas: "Red cherry, banana, bubblegum (if carbonic maceration)",
    regions: "Beaujolais",
    pairings: "Charcuterie, picnic food, roast chicken, light cheese",
    notes: "Antithesis of big, tannic reds. Carbonic maceration → banana, bubblegum (Beaujolais Nouveau). But Cru Beaujolais (Morgon, Fleurie, Moulin-à-Vent) is serious, structured, can age 5-10 years. Often served slightly chilled.",
  },
  {
    name: "Zinfandel / Primitivo",
    tier: "regional",
    color: "red",
    dot: "#6B2535",
    body: "Medium to full",
    acidity: "Medium",
    tannin: "Medium",
    aromas: "Blackberry, jam, spice, dried fruit",
    regions: "California · Puglia",
    pairings: "Barbecue, pizza, spicy sausages, hearty stews",
    notes: "Grape of extremes. California: sweet pink White Zinfandel to massive 15%+ reds. Old-vine Zinfandel (Sonoma, Paso Robles, Lodi) is exceptionally concentrated. Puglia (as Primitivo): slightly more restrained, dried fruit + herb.",
  },
];

export const PRINCIPAL_WHITES = GRAPES.filter(
  (g) => g.color === "white" && g.tier === "principal"
);
export const REGIONAL_WHITES = GRAPES.filter(
  (g) => g.color === "white" && g.tier === "regional"
);
export const SPARKLING_WHITES = GRAPES.filter(
  (g) => g.color === "white" && g.tier === "sparkling"
);
export const PRINCIPAL_REDS = GRAPES.filter(
  (g) => g.color === "red" && g.tier === "principal"
);
export const REGIONAL_REDS = GRAPES.filter(
  (g) => g.color === "red" && g.tier === "regional"
);
