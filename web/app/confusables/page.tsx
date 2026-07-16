"use client";

import { useMemo, useState } from "react";
import { VARIETIES } from "@/data/varieties";
import { CONCEPTS } from "@/data/concepts";
import { TERMS } from "@/data/terms";
import type { Variety, Term, Concept } from "@/lib/types";
import { FeatureHero } from "@/components/FeatureHero";

// ────────────────────────────────────────────────────────────────────────────
// CONFUSABLES — a two-way trap trainer.
//
// Each card opposes EXACTLY the two lookalikes WSET uses as distractors. You
// read a clue, pick between the two, and see the one discriminating mechanic.
//
// GROUNDING: no wine fact is authored in this file. Every clue and every reveal
// string is read VERBATIM out of existing data —
//   • grape pairs   → Variety.climate.cool / .warm / .coolExample / .warmExample
//   • concept pairs → CONCEPTS (lo === 5) section bullet strings
//   • term pairs    → Term.meaning
// The PAIRINGS below (which two items are opposed, and which is correct for a
// given clue) are the only thing defined here — structural config, references
// into the data, never new facts.
// ────────────────────────────────────────────────────────────────────────────

// --- helpers to pull verbatim strings out of the data, never authoring them ---

function variety(id: string): Variety {
  const v = VARIETIES.find((x) => x.id === id);
  if (!v) throw new Error(`unknown variety ${id}`);
  return v;
}

function lo5(): Concept {
  const c = CONCEPTS.find((x) => x.lo === 5);
  if (!c) throw new Error("missing LO5 concept");
  return c;
}

/** A bullet string from a named LO5 section (verbatim). */
function lo5Bullet(heading: string, includes: string): string {
  const section = lo5().sections.find((s) => s.heading === heading);
  if (!section) throw new Error(`missing LO5 section ${heading}`);
  const bullet = section.points.find((p) => p.includes(includes));
  if (!bullet) throw new Error(`missing LO5 bullet ${includes} in ${heading}`);
  return bullet;
}

function term(name: string): Term {
  const t = TERMS.find((x) => x.term === name);
  if (!t) throw new Error(`unknown term ${name}`);
  return t;
}

// --- card model: two shapes, one renderer ------------------------------------

interface Answer {
  label: string; // the button text (verbatim from data)
  reveal: string; // the discriminating mechanic (verbatim from data)
}

interface Card {
  key: string;
  kind: "grape" | "concept" | "term";
  pair: string; // home-screen name of the confusable, e.g. "Cool vs Warm Cabernet"
  context: string; // small label above the clue (the grape/topic)
  clue: string; // the prompt line (verbatim from data)
  left: Answer;
  right: Answer;
  correct: "left" | "right";
}

// A grape-pair card: clue is ONE climate-style line; the two answers are the
// grape's own cool vs warm examples. The reveal quotes the OTHER style line.
function grapeCard(id: string, ask: "cool" | "warm"): Card {
  const v = variety(id);
  const c = v.climate!;
  const coolEg = c.coolExample ?? "Cool climate";
  const warmEg = c.warmExample ?? "Warm climate";
  return {
    key: `grape-${id}-${ask}`,
    kind: "grape",
    pair: `Cool vs Warm ${v.name}`,
    context: v.name,
    clue: ask === "cool" ? c.cool : c.warm,
    left: { label: coolEg, reveal: c.cool },
    right: { label: warmEg, reveal: c.warm },
    correct: ask === "cool" ? "left" : "right",
  };
}

function buildCards(): Card[] {
  const cards: Card[] = [];

  // ── Grape confusables: same grape, opposite climate (LO3) ──────────────────
  // The cool clue points to the cool example; the warm clue to the warm one.
  const grapePairs: { id: string }[] = [
    { id: "cabernet-sauvignon" },
    { id: "merlot" },
    { id: "chardonnay" },
    { id: "riesling" },
    { id: "syrah-shiraz" },
    { id: "pinot-noir" },
    { id: "sauvignon-blanc" },
    { id: "chenin-blanc" },
  ];
  for (const { id } of grapePairs) {
    cards.push(grapeCard(id, "cool"));
    cards.push(grapeCard(id, "warm"));
  }

  // ── Sherry vs Port: the timing of fortification (LO5) ──────────────────────
  const sherryBullet = lo5Bullet("Fortified — Sherry vs Port (the timing is everything)", "Sherry (Jerez");
  const portBullet = lo5Bullet("Fortified — Sherry vs Port (the timing is everything)", "Port (Douro");
  cards.push({
    key: "concept-fortify-after",
    kind: "concept",
    pair: "Sherry vs Port",
    context: "Fortified wine — timing",
    clue: "Fortified AFTER fermentation, on a dry base — which wine?",
    left: { label: "Sherry", reveal: sherryBullet },
    right: { label: "Port", reveal: portBullet },
    correct: "left",
  });
  cards.push({
    key: "concept-fortify-interrupt",
    kind: "concept",
    pair: "Sherry vs Port",
    context: "Fortified wine — timing",
    clue: "Fortified to INTERRUPT fermentation, leaving residual sweetness — which wine?",
    left: { label: "Sherry", reveal: sherryBullet },
    right: { label: "Port", reveal: portBullet },
    correct: "right",
  });

  // ── Traditional vs Tank method: where the 2nd fermentation happens (LO5) ────
  const tradBullet = lo5Bullet("Sparkling — two methods", "Traditional method");
  const tankBullet = lo5Bullet("Sparkling — two methods", "Tank method");
  cards.push({
    key: "concept-bubbles-bottle",
    kind: "concept",
    pair: "Traditional vs Tank method",
    context: "Sparkling — the bubbles",
    clue: "Second fermentation in the bottle, giving bready complexity — which method?",
    left: { label: "Traditional method", reveal: tradBullet },
    right: { label: "Tank method", reveal: tankBullet },
    correct: "left",
  });
  cards.push({
    key: "concept-bubbles-tank",
    kind: "concept",
    pair: "Traditional vs Tank method",
    context: "Sparkling — the bubbles",
    clue: "Second fermentation in a pressurised tank, keeping fresh primary fruit — which method?",
    left: { label: "Traditional method", reveal: tradBullet },
    right: { label: "Tank method", reveal: tankBullet },
    correct: "right",
  });

  // ── Crianza vs Gran Reserva: the Spanish ageing ladder (LO4) ───────────────
  const crianza = term("Crianza");
  const granReserva = term("Gran Reserva");
  cards.push({
    key: "term-crianza-vs-granreserva",
    kind: "term",
    pair: "Crianza vs Gran Reserva",
    context: "Spanish ageing ladder",
    clue: "Aged a moderate time in oak and bottle — the shorter of the two — which tier?",
    left: { label: "Crianza", reveal: crianza.meaning },
    right: { label: "Gran Reserva", reveal: granReserva.meaning },
    correct: "left",
  });
  cards.push({
    key: "term-granreserva-vs-crianza",
    kind: "term",
    pair: "Crianza vs Gran Reserva",
    context: "Spanish ageing ladder",
    clue: "The longest ageing before release, only in the best vintages — which tier?",
    left: { label: "Crianza", reveal: crianza.meaning },
    right: { label: "Gran Reserva", reveal: granReserva.meaning },
    correct: "right",
  });

  // ── Crianza vs Reserva: the middle of the ladder (LO4) ─────────────────────
  const reserva = term("Reserva");
  cards.push({
    key: "term-crianza-vs-reserva",
    kind: "term",
    pair: "Crianza vs Reserva",
    context: "Spanish ageing ladder",
    clue: "Longer oak and bottle ageing than Crianza — which tier?",
    left: { label: "Crianza", reveal: crianza.meaning },
    right: { label: "Reserva", reveal: reserva.meaning },
    correct: "right",
  });

  return cards;
}

// ────────────────────────────────────────────────────────────────────────────

const KIND_LABEL: Record<Card["kind"], string> = {
  grape: "Climate style",
  concept: "Sparkling & fortified",
  term: "Ageing terms",
};

export default function ConfusablesPage() {
  const cards = useMemo(() => buildCards(), []);

  // The home screen lists the curated pairs (deduped by `pair`), in order.
  const pairs = useMemo(() => {
    const seen = new Set<string>();
    const out: { pair: string; kind: Card["kind"] }[] = [];
    for (const c of cards) {
      if (seen.has(c.pair)) continue;
      seen.add(c.pair);
      out.push({ pair: c.pair, kind: c.kind });
    }
    return out;
  }, [cards]);

  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<"left" | "right" | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  function start() {
    setStarted(true);
    setI(0);
    setPicked(null);
    setScore(0);
    setAnswered(0);
  }

  function choose(side: "left" | "right") {
    if (picked) return;
    setPicked(side);
    setAnswered((n) => n + 1);
    if (side === cards[i].correct) setScore((s) => s + 1);
  }

  function next() {
    setPicked(null);
    setI((n) => n + 1);
  }

  const done = started && i >= cards.length;
  const card = !done && started ? cards[i] : null;

  // ── Home screen ────────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="space-y-6 rise">
        <FeatureHero
          eyebrow="Confusables"
          title="The two-way trap trainer"
          image="/feature-visuals/confusables.jpg"
          alt="Two similar red wines side by side with a two-way marker between them"
        >
          <p>
            WSET writes its hardest distractors as <em className="not-italic text-ink">lookalikes</em> — Sherry
            beside Port, cool Cabernet beside warm. Read a clue, pick between exactly the two, then see the one
            mechanic that tells them apart.
          </p>
        </FeatureHero>

        <section className="card p-5">
          <p className="kicker">The {pairs.length} pairs you&apos;ll drill</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {pairs.map((p) => (
              <li key={p.pair} className="flex items-center gap-2 text-sm text-ink">
                <span aria-hidden className="font-mono text-cool">↔</span>
                <span className="font-medium">{p.pair}</span>
                <span className="chip ml-auto">{KIND_LABEL[p.kind]}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={start} className="btn-primary">
            Start drill →
          </button>
          <span className="text-sm text-muted">{cards.length} cards · grapes, fortified, sparkling &amp; ageing</span>
        </div>
      </div>
    );
  }

  // ── Done screen ──────────────────────────────────────────────────────────
  if (done) {
    const pct = answered ? Math.round((score / answered) * 100) : 0;
    return (
      <div className="space-y-6 rise">
        <header>
          <div className="eyebrow mb-2">Confusables</div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Drill complete</h1>
        </header>
        <section className="card p-6 text-center">
          <p className="kicker">Your score</p>
          <p className="mt-2 font-display text-5xl font-semibold text-ink tabular-nums">
            {score}
            <span className="text-2xl text-muted"> / {cards.length}</span>
          </p>
          <p className="mt-2 text-sm text-muted">{pct}% of the lookalike traps avoided.</p>
        </section>
        <div className="flex flex-wrap gap-3">
          <button onClick={start} className="btn-primary">
            Retry →
          </button>
        </div>
      </div>
    );
  }

  // ── Card screen (two-shape renderer) ─────────────────────────────────────
  const c = card!;
  const reveal = picked
    ? c[picked].reveal
    : null;
  const gotIt = picked === c.correct;

  function buttonClass(side: "left" | "right") {
    if (!picked) return "border-line bg-card text-ink hover:border-wine";
    const isCorrect = side === c.correct;
    const isPicked = side === picked;
    if (isCorrect) return "border-good bg-good-bg text-ink";
    if (isPicked && !isCorrect) return "border-bad bg-bad-bg text-ink";
    return "border-line bg-card text-muted opacity-70";
  }

  return (
    <div className="space-y-6 rise">
      <header className="flex items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Confusables · {c.pair}</div>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">{c.context}</h1>
        </div>
        <div className="text-right text-sm text-muted tabular-nums">
          <div>
            {i + 1} / {cards.length}
          </div>
          <div className="text-xs">Score {score}</div>
        </div>
      </header>

      {/* progress */}
      <span className="block h-1.5 w-full overflow-hidden rounded-full bg-cream-2">
        <span
          className="bar-fill block h-full rounded-full"
          style={{ width: `${(i / cards.length) * 100}%`, background: "var(--color-wine-light)" }}
        />
      </span>

      <section className="card p-5 sm:p-6">
        <p className="kicker">{KIND_LABEL[c.kind]} · the clue</p>
        <p className="mt-2 text-lg leading-snug text-ink">{c.clue}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(["left", "right"] as const).map((side) => (
            <button
              key={side}
              onClick={() => choose(side)}
              disabled={!!picked}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition disabled:cursor-default ${buttonClass(
                side
              )}`}
            >
              {c[side].label}
            </button>
          ))}
        </div>

        {picked && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="kicker" style={{ color: gotIt ? "var(--color-good)" : "var(--color-bad)" }}>
              {gotIt ? "Correct" : `Not quite — it's ${c[c.correct].label}`}
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">The difference</p>
            <p className="mt-1 text-sm text-muted">{reveal}</p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button onClick={next} disabled={!picked} className="btn-ghost">
            {i + 1 === cards.length ? "See score →" : "Next →"}
          </button>
        </div>
      </section>
    </div>
  );
}
