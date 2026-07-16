"use client";
import { useMemo, useState } from "react";
import { TERMS, GI_TO_GRAPE } from "@/data/terms";
import type { Term } from "@/lib/types";
import { FeatureHero } from "@/components/FeatureHero";

const GROUPS = ["EU", "France", "Italy", "Spain", "Germany", "Sparkling", "Fortified", "Vineyard"];

export default function DecodePage() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string>("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TERMS.filter((t) => {
      if (group !== "All" && t.country !== group) return false;
      if (!needle) return true;
      return (
        t.term.toLowerCase().includes(needle) ||
        t.meaning.toLowerCase().includes(needle) ||
        (t.note ?? "").toLowerCase().includes(needle)
      );
    });
  }, [q, group]);

  const byGroup = useMemo(() => {
    const m = new Map<string, Term[]>();
    for (const t of filtered) {
      if (!m.has(t.country)) m.set(t.country, []);
      m.get(t.country)!.push(t);
    }
    return GROUPS.filter((g) => m.has(g)).map((g) => [g, m.get(g)!] as const);
  }, [filtered]);

  return (
    <div className="space-y-6 rise">
      <FeatureHero
        eyebrow="Decode"
        title="Label decoder"
        image="/feature-visuals/decode.jpg"
        alt="A magnifying glass resting against a blank wine-bottle label"
      >
        <p>
          What the words on the bottle guarantee — quality tiers, ageing terms, sweetness and
          ripeness levels. Search or filter by country.
        </p>
      </FeatureHero>

      <div className="space-y-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search terms… (e.g. Crianza, Prädikat, Brut)"
          className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm outline-none focus:border-wine"
        />
        <div className="flex flex-wrap gap-1.5">
          {["All", ...GROUPS].map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                group === g ? "bg-wine text-white" : "border border-line bg-card text-muted hover:border-wine"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {byGroup.length === 0 && <p className="text-sm text-muted">No terms match “{q}”.</p>}

      <div className="space-y-6">
        {byGroup.map(([g, terms]) => (
          <section key={g}>
            <p className="kicker mb-2">{g}</p>
            <dl className="divide-y divide-line">
              {terms.map((t) => (
                <div key={t.term} className="grid gap-1 py-3 sm:grid-cols-[200px_1fr]">
                  <dt className="font-semibold text-ink">
                    {t.term} <span className="chip ml-1 align-middle">{t.category}</span>
                  </dt>
                  <dd className="text-sm text-muted">
                    {t.meaning}
                    {t.note && <span className="mt-1 block text-xs text-muted/80">{t.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      {/* GI → grape cross-reference */}
      <section className="card p-5">
        <p className="kicker">Cross-reference</p>
        <h2 className="mt-2 font-display text-lg font-semibold text-ink">When the place names the grape</h2>
        <p className="mt-1 text-sm text-muted">
          Many European labels show a region, not a grape. These GIs effectively tell you the variety:
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {GI_TO_GRAPE.map((g) => (
            <div key={g.gi} className="flex items-center gap-2 rounded-lg bg-cream-2 px-3 py-2 text-sm">
              <span className="font-medium">{g.gi}</span>
              <span className="text-wine" aria-hidden>→</span>
              <span className="font-semibold text-wine">{g.grape}</span>
              <span className="ml-auto text-xs text-muted">{g.note}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
