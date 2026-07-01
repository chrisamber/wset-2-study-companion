export type Question = {
  q: string;
  o: [string, string, string, string];
  c: 0 | 1 | 2 | 3;
  e: string;
};

export const QUESTIONS: Question[] = [
  // ─── GRAPE → REGION ASSOCIATIONS (high-value exam territory) ────
  {
    q: "Sancerre is made predominantly from which grape?",
    o: ["Chardonnay", "Chenin Blanc", "Sauvignon Blanc", "Viognier"],
    c: 2,
    e: "Sancerre is a Loire Valley AOC — 100% Sauvignon Blanc. Crisp acidity, herbaceous and citrus character.",
  },
  {
    q: "Barolo DOCG is made from which grape variety?",
    o: ["Sangiovese", "Barbera", "Nebbiolo", "Tempranillo"],
    c: 2,
    e: "Nebbiolo is the sole grape of Barolo (Piedmont). Pale garnet colour but very high tannin, high acidity, aromas of tar and roses.",
  },
  {
    q: "Marlborough, New Zealand is best known for which grape?",
    o: ["Pinot Noir", "Riesling", "Sauvignon Blanc", "Chardonnay"],
    c: 2,
    e: "Marlborough is the world's most recognised Sauvignon Blanc region — intense passion fruit, gooseberry, cut grass, high acidity.",
  },
  {
    q: "Chablis is made from which grape?",
    o: ["Sauvignon Blanc", "Chardonnay", "Riesling", "Chenin Blanc"],
    c: 1,
    e: "Chablis is 100% Chardonnay — but unoaked, with high acidity and mineral character. Very different from warm-climate oaked Chardonnay.",
  },
  {
    q: "Chianti Classico is made primarily from which grape?",
    o: ["Nebbiolo", "Tempranillo", "Sangiovese", "Merlot"],
    c: 2,
    e: "Chianti Classico requires minimum 80% Sangiovese. High acidity and firm tannin make it supremely food-friendly — especially with tomato-based Italian dishes.",
  },
  {
    q: "Which region is most associated with Albariño?",
    o: ["Rioja", "Rías Baixas", "Ribera del Duero", "Priorat"],
    c: 1,
    e: "Albariño is the signature grape of Rías Baixas in northwest Spain. Atlantic influence gives it a distinctive saline quality — a natural partner for seafood.",
  },
  {
    q: "Vouvray in the Loire Valley is known for which grape?",
    o: ["Sauvignon Blanc", "Muscat", "Chenin Blanc", "Chardonnay"],
    c: 2,
    e: "Vouvray = Chenin Blanc. The most versatile grape for styles: dry (sec), off-dry (demi-sec), sweet (moelleux), and sparkling — all from one appellation.",
  },
  {
    q: "Which grape variety is Pomerol (Bordeaux Right Bank) best known for?",
    o: ["Cabernet Sauvignon", "Merlot", "Syrah", "Grenache"],
    c: 1,
    e: "Bordeaux Right Bank (St-Émilion, Pomerol) = Merlot dominant. Left Bank (Médoc, Pauillac) = Cabernet Sauvignon dominant. This distinction is tested frequently.",
  },
  {
    q: "Condrieu in the Northern Rhône produces wines from which grape?",
    o: ["Marsanne", "Viognier", "Roussanne", "Chardonnay"],
    c: 1,
    e: "Condrieu is Viognier's most celebrated origin — rich apricot and peach with floral elegance. Viognier is sometimes co-fermented with Syrah in nearby Côte-Rôtie.",
  },
  {
    q: "The Barossa Valley in Australia is most associated with which grape?",
    o: ["Cabernet Sauvignon", "Pinot Noir", "Shiraz", "Merlot"],
    c: 2,
    e: "Barossa Valley Shiraz is a blockbuster style: full-bodied, velvety, ripe black fruit, chocolate, mocha, sweet spice from American oak. Old vines are common.",
  },

  // ─── GRAPE CHARACTERISTICS ──────────────────────────────
  {
    q: "Which grape is known for very high tannin but deceptively pale colour?",
    o: ["Cabernet Sauvignon", "Malbec", "Nebbiolo", "Syrah"],
    c: 2,
    e: "Nebbiolo (Barolo, Barbaresco) is pale garnet but delivers fierce tannin and bracing acidity. The name comes from nebbia (fog) in Piedmont.",
  },
  {
    q: "Which white grape typically has LOW acidity?",
    o: ["Riesling", "Sauvignon Blanc", "Gewürztraminer", "Chenin Blanc"],
    c: 2,
    e: "Gewürztraminer has naturally low acidity, giving it a rich, almost oily mouthfeel. It's one of the easiest grapes to identify blind — lychee + rose petal.",
  },
  {
    q: "Which red grape has low tannin and is often served slightly chilled?",
    o: ["Cabernet Sauvignon", "Nebbiolo", "Gamay", "Syrah"],
    c: 2,
    e: "Gamay (Beaujolais) produces light-bodied, low-tannin reds meant to be enjoyed young. Carbonic maceration gives banana and bubblegum aromas. Often served slightly chilled.",
  },
  {
    q: "Pinot Noir is best described as having:",
    o: ["Full body, high tannin", "Light to medium body, low to medium tannin", "Full body, low tannin", "Light body, high tannin"],
    c: 1,
    e: "Pinot Noir is thin-skinned → pale colour, light to medium body, low to medium tannin. Cherry, strawberry, and earthy flavours. Climate-sensitive.",
  },
  {
    q: "Which grape is described as the 'most versatile white' due to its range of styles?",
    o: ["Chardonnay", "Chenin Blanc", "Riesling", "Sauvignon Blanc"],
    c: 1,
    e: "Chenin Blanc produces dry, off-dry, sweet, and sparkling wines — all with high acidity. Loire Valley and South Africa are the key regions.",
  },
  {
    q: "Grenache typically produces wines with:",
    o: ["Low alcohol, high tannin", "High alcohol, low tannin", "Low alcohol, low tannin", "High alcohol, high tannin"],
    c: 1,
    e: "Grenache has thin skins (light colour, low tannin) but ripens to high sugar levels → generous alcohol, often 14-15%+. Backbone of Châteauneuf-du-Pape.",
  },

  // ─── WINEMAKING ─────────────────────────────────────────
  {
    q: "Which best describes the effect of oak ageing on wine?",
    o: ["Increases acidity", "Adds tannin and vanilla flavours", "Makes wine lighter in body", "Reduces alcohol content"],
    c: 1,
    e: "Oak contributes tannin from the wood, plus vanilla, toast, and spice. French oak: fine tannin, spice. American oak: coconut, vanilla. Micro-oxidation softens the wine.",
  },
  {
    q: "Malolactic fermentation (MLF) converts:",
    o: ["Alcohol to sugar", "Malic acid to lactic acid", "Sugar to alcohol", "Tartaric acid to citric acid"],
    c: 1,
    e: "MLF converts sharper malic acid to softer lactic acid — smoother, creamier mouthfeel. Produces diacetyl (buttery flavour). Standard for reds, optional for whites.",
  },
  {
    q: "Carbonic maceration is the technique behind:",
    o: ["Champagne", "Barolo", "Beaujolais Nouveau", "Sauternes"],
    c: 2,
    e: "Whole, uncrushed bunches ferment in sealed CO₂ tank → vivid fruit aromas, low tannin, banana and bubblegum notes. The signature technique of Beaujolais Nouveau.",
  },
  {
    q: "What is the purpose of lees contact (bâtonnage)?",
    o: ["Increase tannin", "Add body, creaminess, and bready/biscuity notes", "Increase acidity", "Add colour"],
    c: 1,
    e: "Lees (dead yeast cells) release proteins and flavour compounds → body, creaminess, bread/biscuit/brioche notes. Essential for Muscadet sur lie, Champagne, and premium white Burgundy.",
  },
  {
    q: "Cool fermentation temperature (12-16°C) is used for white wines primarily to:",
    o: ["Increase tannin extraction", "Speed up fermentation", "Preserve volatile aroma compounds", "Darken the colour"],
    c: 2,
    e: "Slow yeast activity at cool temperatures preserves volatile aromas that would be driven off at higher temperatures. This is why Sauvignon Blanc, Riesling, and Muscat are fermented cool in stainless steel.",
  },

  // ─── CLIMATE ────────────────────────────────────────────
  {
    q: "In a warm climate, wines tend to be:",
    o: ["Higher in acidity, lighter body", "Lower in alcohol, green flavours", "Higher in alcohol, fuller body", "More herbaceous, mineral notes"],
    c: 2,
    e: "More sun → more sugar → higher alcohol. Riper fruit gives fuller body and tropical/jammy flavours. Lower acidity. Cool climate = the opposite.",
  },
  {
    q: "A wine described as having 'green pepper and herbaceous' notes most likely comes from a:",
    o: ["Warm climate", "Cool climate", "Tropical climate", "Desert climate"],
    c: 1,
    e: "Green, herbaceous, and unripe flavours indicate cooler conditions. Warm climates produce riper, tropical, and jammy fruit characters.",
  },

  // ─── SPARKLING WINE ─────────────────────────────────────
  {
    q: "Champagne is made using which method?",
    o: ["Charmat/tank method", "Carbonation", "Transfer method", "Traditional method"],
    c: 3,
    e: "Traditional method = second fermentation in the bottle. This creates fine, persistent bubbles and complex yeasty, biscuity, toasty flavours from extended lees ageing.",
  },
  {
    q: "Prosecco is made using which method?",
    o: ["Traditional method", "Charmat/tank method", "Carbonation", "Ancestral method"],
    c: 1,
    e: "Charmat method = second fermentation in a sealed tank. This preserves fresh, fruity, floral primary aromas (green apple, pear, white flower). The grape is Glera.",
  },
  {
    q: "Non-vintage Champagne must age on lees for a minimum of:",
    o: ["6 months", "12 months", "15 months", "36 months"],
    c: 2,
    e: "Champagne NV: minimum 15 months on lees. Vintage Champagne: minimum 36 months. Extended lees ageing develops yeasty, biscuity, toasty autolytic flavours.",
  },
  {
    q: "Cava is a sparkling wine from Spain made using:",
    o: ["Charmat method", "Carbonation", "Traditional method", "Transfer method"],
    c: 2,
    e: "Cava uses the traditional method (second fermentation in bottle), like Champagne, but with Spanish grapes: Macabeo, Parellada, Xarel·lo.",
  },

  // ─── FORTIFIED WINE ─────────────────────────────────────
  {
    q: "What distinguishes Port from Sherry in terms of when spirit is added?",
    o: ["Port: after fermentation; Sherry: during", "Port: during fermentation; Sherry: after", "Both during fermentation", "Both after fermentation"],
    c: 1,
    e: "Port is fortified DURING fermentation (spirit kills yeast → residual sugar → sweet). Sherry is fortified AFTER (all sugar fermented → naturally dry). This distinction is critical for the exam.",
  },
  {
    q: "Fino Sherry ages under:",
    o: ["Oak barrels without flor", "A layer of flor yeast", "In bottle only", "Solera system only"],
    c: 1,
    e: "Fino ages under flor (a film of yeast on the wine surface) → pale, dry, yeasty, almond, saline. Oloroso ages without flor (fully oxidative) → dark, rich, nutty. Amontillado: starts with flor, then oxidative.",
  },
  {
    q: "Which style of Port is aged in small barrels, developing nutty and caramel flavours?",
    o: ["Ruby Port", "Vintage Port", "Tawny Port", "White Port"],
    c: 2,
    e: "Tawny Port ages in small barrels → oxidative ageing produces nutty, caramel, and dried fruit flavours. Ruby Port ages in large vessels, retaining fresh, fruity character.",
  },

  // ─── WINE LAWS & LABELLING ──────────────────────────────
  {
    q: "In Italy, which classification is higher: DOC or DOCG?",
    o: ["DOC is higher", "DOCG is higher", "They are equal", "Neither — IGT is highest"],
    c: 1,
    e: "DOCG (Denominazione di Origine Controllata e Garantita) is higher than DOC. The 'G' = Garantita (guaranteed). DOCG wines must pass a government tasting panel. Key DOCGs: Barolo, Barbaresco, Brunello, Chianti Classico.",
  },
  {
    q: "In Rioja, a 'Reserva' red wine must be aged for a minimum of:",
    o: ["1 year total", "2 years (6 months in oak)", "3 years (12 months in oak)", "5 years (18 months in oak)"],
    c: 2,
    e: "Crianza: 2yr total (6mo oak). Reserva: 3yr (12mo oak). Gran Reserva: 5yr (18mo oak). These ageing terms are high-value exam content.",
  },
  {
    q: "German Prädikatswein classifies wines by:",
    o: ["Region of origin only", "Grape variety", "Ripeness of grapes at harvest", "Alcohol content"],
    c: 2,
    e: "Prädikatswein grades: Kabinett (lightest) → Spätlese → Auslese → Beerenauslese → Trockenbeerenauslese (richest, sweetest). Eiswein is also a Prädikat level.",
  },
  {
    q: "DOCa is the highest classification in Spain. Which two regions hold it?",
    o: ["Ribera del Duero and Rías Baixas", "Rioja and Priorat", "Navarra and Penedès", "Rioja and Ribera del Duero"],
    c: 1,
    e: "Only Rioja and Priorat have achieved DOCa (Denominación de Origen Calificada) status — Spain's highest wine classification.",
  },
  {
    q: "PDO and PGI are EU-wide terms. PDO is equivalent to:",
    o: ["Vin de France", "IGP / IGT", "AOC / DOC / DOCG / DO", "Table wine"],
    c: 2,
    e: "PDO (Protected Designation of Origin) is the EU umbrella for top-tier national designations: AOC (France), DOC/DOCG (Italy), DO/DOCa (Spain). PGI covers the tier below (IGP, IGT).",
  },

  // ─── BURGUNDY ───────────────────────────────────────────
  {
    q: "The Burgundy classification hierarchy from highest to lowest is:",
    o: ["Village → Premier Cru → Grand Cru → Regional", "Grand Cru → Premier Cru → Village → Regional", "Premier Cru → Grand Cru → Regional → Village", "Regional → Village → Grand Cru → Premier Cru"],
    c: 1,
    e: "Grand Cru (~1% of production) → Premier Cru (~10%) → Village (~35%) → Regional/Bourgogne (~54%). Grand Cru labels show only the vineyard name, not the village.",
  },

  // ─── SERVICE & STORAGE ──────────────────────────────────
  {
    q: "What is the recommended serving temperature for full-bodied red wines?",
    o: ["6-10°C", "7-10°C", "10-13°C", "15-18°C"],
    c: 3,
    e: "Full-bodied reds: 15-18°C. Light whites/rosé: 7-10°C. Sparkling: 6-10°C. Serving too warm makes alcohol more prominent; too cold suppresses aromas.",
  },
  {
    q: "Wine should be stored horizontally primarily to:",
    o: ["Improve flavour development", "Keep the cork moist and prevent oxidation", "Allow sediment to settle", "Reduce light exposure"],
    c: 1,
    e: "Horizontal storage keeps wine in contact with the cork, preventing it from drying out and allowing oxygen ingress. Store at cool, constant temperature (~13°C), away from light and vibration.",
  },

  // ─── FOOD & WINE PAIRING ───────────────────────────────
  {
    q: "When pairing wine with food, the wine should be:",
    o: ["Always dry", "Sweeter than the food", "Lower in acidity than the food", "Always red"],
    c: 1,
    e: "If the food is sweeter than the wine, the wine will taste thin and acidic. The wine should be at least as sweet as the dish. Acidity in wine cuts through fatty/rich foods.",
  },

  // ─── TRICKY DISTINCTIONS ────────────────────────────────
  {
    q: "Syrah and Shiraz are:",
    o: ["Different grape varieties", "The same grape variety", "A blend of two grapes", "Related but different varieties"],
    c: 1,
    e: "Same grape, different names and styles. Syrah (N. Rhône): pepper, violet, firm, savoury. Shiraz (Australia): ripe fruit, chocolate, sweet oak. One grape, two personalities.",
  },
  {
    q: "Which grape is used to make Sauternes?",
    o: ["Chenin Blanc", "Riesling", "Sémillon", "Muscat"],
    c: 2,
    e: "Sauternes is predominantly Sémillon (with Sauvignon Blanc and sometimes Muscadelle). Botrytis (noble rot) concentrates sugars and flavours into luscious, honeyed wines.",
  },
  {
    q: "Brunello di Montalcino requires which percentage of Sangiovese?",
    o: ["80%", "85%", "95%", "100%"],
    c: 3,
    e: "Brunello di Montalcino is 100% Sangiovese with a minimum 5 years ageing before release. Chianti Classico requires minimum 80% Sangiovese.",
  },
  {
    q: "Old oak barrels (used 4+ vintages) contribute:",
    o: ["Strong vanilla and toast flavours", "Gentle oxidation only, no flavour", "Increased acidity", "Fruit-forward character"],
    c: 1,
    e: "Old oak contributes no flavour — it provides a porous environment for gentle, slow oxidation that softens the wine and allows complexity to develop. New oak adds vanilla, toast, and tannin.",
  },
  {
    q: "The appassimento technique is used to make:",
    o: ["Champagne", "Amarone della Valpolicella", "Fino Sherry", "Sancerre"],
    c: 1,
    e: "Appassimento = drying grapes on racks for weeks/months, concentrating sugars and flavours. Amarone: dry, high alcohol, rich. Recioto: sweet version. Both are Corvina-based, from Veneto.",
  },
  {
    q: "Which is NOT one of Alsace's four noble grapes?",
    o: ["Riesling", "Gewürztraminer", "Chardonnay", "Pinot Gris"],
    c: 2,
    e: "Alsace's four noble grapes are Riesling, Gewürztraminer, Pinot Gris, and Muscat. Chardonnay is not planted in Alsace. Alsace wines are labelled by variety, unusual for France.",
  },
];
