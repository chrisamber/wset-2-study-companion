"use client";
import { useState } from "react";
import { CLIMATE_VARIETIES } from "@/data/varieties";
import { Scale } from "@/components/Scale";

export default function ClimatePage() {
  const [id, setId] = useState(CLIMATE_VARIETIES[0].id);
  const v = CLIMATE_VARIETIES.find((x) => x.id === id)!;
  const c = v.climate!;

  return (
    <div className="space-y-6">
      <header>
        <p className="kicker">Climate</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Climate comparator</h1>
        <p className="mt-1 text-muted">
          Same grape, two climates. Cooler sites keep acidity and green/restrained fruit; warmer
          sites give riper, fuller, higher-alcohol wines. Pick a variety:
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {CLIMATE_VARIETIES.map((x) => (
          <button
            key={x.id}
            onClick={() => setId(x.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              x.id === id ? "bg-wine text-white" : "border border-line bg-card text-ink hover:border-wine"
            }`}
          >
            {x.name}
          </button>
        ))}
      </div>

      <section className="card p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <h2 className="font-display text-2xl font-semibold text-ink">{v.name}</h2>
          <span className="text-sm text-muted">{v.summary}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Scale label="Body" value={v.body} />
          <Scale label="Acidity" value={v.acidity} />
          <Scale label="Tannin" value={v.tannin === "—" ? "N/A" : v.tannin} />
          <Scale label="Sweetness" value={v.sweetness ?? "Dry"} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-cool/30 bg-cool-bg p-5">
          <h3 className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-cool-dark">
            Cool climate{c.coolExample ? ` · ${c.coolExample}` : ""}
          </h3>
          <p className="mt-2 text-sm text-ink">{c.cool}</p>
        </article>

        <article className="rounded-lg border border-wine/25 bg-blush p-5">
          <h3 className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-wine">
            Warm climate{c.warmExample ? ` · ${c.warmExample}` : ""}
          </h3>
          <p className="mt-2 text-sm text-ink">{c.warm}</p>
        </article>
      </div>

      <p className="text-xs text-muted">
        Showing the {CLIMATE_VARIETIES.length} principal varieties whose sources explicitly contrast cool
        and warm styles. Heat-only grapes (e.g. Grenache) aren&apos;t shown here.
      </p>
    </div>
  );
}
