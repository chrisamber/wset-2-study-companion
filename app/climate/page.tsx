"use client";
import { useState } from "react";
import { CLIMATE_VARIETIES } from "@/data/varieties";

export default function ClimatePage() {
  const [id, setId] = useState(CLIMATE_VARIETIES[0].id);
  const v = CLIMATE_VARIETIES.find((x) => x.id === id)!;
  const c = v.climate!;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Climate comparator</h1>
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
          <h2 className="font-display text-2xl font-semibold">{v.name}</h2>
          <span className="text-sm text-muted">{v.summary}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="chip">Body: {v.body}</span>
          <span className="chip">Acidity: {v.acidity}</span>
          {v.tannin !== "—" && <span className="chip">Tannin: {v.tannin}</span>}
          {v.sweetness && <span className="chip">{v.sweetness}</span>}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-xl" aria-hidden>❄️</span>
            <h3 className="font-display text-lg font-semibold">Cool climate</h3>
          </div>
          <p className="mt-2 text-sm text-slate-700">{c.cool}</p>
          {c.coolExample && (
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
              e.g. {c.coolExample}
            </p>
          )}
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="text-xl" aria-hidden>☀️</span>
            <h3 className="font-display text-lg font-semibold">Warm climate</h3>
          </div>
          <p className="mt-2 text-sm text-amber-900">{c.warm}</p>
          {c.warmExample && (
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-amber-700">
              e.g. {c.warmExample}
            </p>
          )}
        </article>
      </div>

      <p className="text-xs text-muted">
        Showing the {CLIMATE_VARIETIES.length} principal varieties whose sources explicitly contrast cool
        and warm styles. Heat-only grapes (e.g. Grenache) aren&apos;t shown here.
      </p>
    </div>
  );
}
