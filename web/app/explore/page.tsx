"use client";
import { useMemo, useState } from "react";
import { VARIETIES, regionIndex, varietyById } from "@/data/varieties";
import type { Variety } from "@/lib/types";
import { Scale } from "@/components/Scale";

type Colour = "all" | "black" | "white";
type Tier = "all" | "principal" | "regional";
type View = "grapes" | "regions";

function Dot({ colour }: { colour: "black" | "white" }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${colour === "black" ? "bg-wine" : "bg-gold"}`}
      aria-hidden
    />
  );
}

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [colour, setColour] = useState<Colour>("all");
  const [tier, setTier] = useState<Tier>("all");
  const [view, setView] = useState<View>("grapes");
  const [selected, setSelected] = useState<string | null>(null);

  const grapes = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return VARIETIES.filter((v) => {
      if (colour !== "all" && v.colour !== colour) return false;
      if (tier !== "all" && v.tier !== tier) return false;
      if (!needle) return true;
      return (
        v.name.toLowerCase().includes(needle) ||
        v.summary.toLowerCase().includes(needle) ||
        v.aromas.some((a) => a.toLowerCase().includes(needle)) ||
        v.regions.some((r) => r.gi.toLowerCase().includes(needle) || r.country.toLowerCase().includes(needle))
      );
    });
  }, [q, colour, tier]);

  const regions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const idx = regionIndex();
    if (!needle) return idx;
    return idx.filter(
      (r) =>
        r.gi.toLowerCase().includes(needle) ||
        r.country.toLowerCase().includes(needle) ||
        r.varieties.some((v) => v.name.toLowerCase().includes(needle))
    );
  }, [q]);

  const detail = selected ? varietyById(selected) : undefined;

  return (
    <div className="space-y-5 rise">
      <header>
        <div className="eyebrow mb-2">Explore</div>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Grape &amp; region explorer</h1>
        <p className="mt-1 text-muted">
          Every variety in the syllabus — its style, key regions and label terms. Switch to{" "}
          <em>Regions</em> to go the other way: pick a place, see its grapes.
        </p>
      </header>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-line bg-card p-0.5">
            {(["grapes", "regions"] as View[]).map((vw) => (
              <button
                key={vw}
                onClick={() => setView(vw)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                  view === vw ? "bg-wine text-white" : "text-muted hover:text-wine"
                }`}
              >
                {vw}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={view === "grapes" ? "Search grapes, aromas, regions…" : "Search regions or grapes…"}
            className="min-w-[12rem] flex-1 rounded-xl border border-line bg-card px-4 py-2 text-sm outline-none focus:border-wine"
          />
        </div>

        {view === "grapes" && (
          <div className="flex flex-wrap gap-3 text-xs">
            <Filter label="Colour" value={colour} setValue={setColour} options={["all", "black", "white"]} />
            <Filter label="Tier" value={tier} setValue={setTier} options={["all", "principal", "regional"]} />
            <span className="self-center text-muted">{grapes.length} grapes</span>
          </div>
        )}
      </div>

      {/* Grapes grid */}
      {view === "grapes" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {grapes.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelected(v.id)}
              className="card group relative overflow-hidden p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-wine hover:shadow-[0_14px_30px_-18px_rgba(122,34,54,0.45)]"
            >
              <span className="absolute left-0 top-0 h-full w-[3px] scale-y-0 bg-wine transition-transform duration-200 ease-out group-hover:scale-y-100" aria-hidden />
              <div className="flex items-center gap-2">
                <Dot colour={v.colour} />
                <h3 className="font-display text-lg font-semibold text-ink group-hover:text-wine">{v.name}</h3>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{v.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {v.regions.slice(0, 3).map((r) => (
                  <span key={r.gi} className="chip">{r.gi}</span>
                ))}
                {v.regions.length > 3 && <span className="chip">+{v.regions.length - 3}</span>}
              </div>
            </button>
          ))}
          {grapes.length === 0 && <p className="text-sm text-muted">No grapes match your filters.</p>}
        </div>
      )}

      {/* Regions view */}
      {view === "regions" && (
        <div className="space-y-3">
          {regions.map((r) => (
            <div key={`${r.gi}|${r.country}`} className="card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold">{r.gi}</h3>
                <span className="chip shrink-0">{r.country}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.varieties.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelected(v.id)}
                    className="flex items-center gap-1.5 rounded-full bg-cream-2 px-2.5 py-1 text-xs font-medium transition hover:bg-blush hover:text-wine"
                  >
                    <Dot colour={v.colour} />
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {regions.length === 0 && <p className="text-sm text-muted">No regions match your search.</p>}
        </div>
      )}

      {detail && <VarietyDetail v={detail} onClose={() => setSelected(null)} />}
    </div>
  );
}

function Filter<T extends string>({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: T;
  setValue: (v: T) => void;
  options: T[];
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-muted">{label}:</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => setValue(o)}
          className={value === o ? "btn-primary capitalize" : "btn-ghost capitalize text-muted"}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function VarietyDetail({ v, onClose }: { v: Variety; onClose: () => void }) {
  const byCountry = new Map<string, string[]>();
  for (const r of v.regions) {
    if (!byCountry.has(r.country)) byCountry.set(r.country, []);
    byCountry.get(r.country)!.push(r.gi);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-card p-6 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Dot colour={v.colour} />
              <h2 className="font-display text-2xl font-semibold text-ink">{v.name}</h2>
            </div>
            <span className="chip mt-1">
              {v.tier === "principal" ? "Principal (LO3)" : "Regional (LO4)"} · {v.colour}
            </span>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted hover:bg-cream-2" aria-label="Close">
            ✕
          </button>
        </div>

        <p className="mt-3 text-muted">{v.summary}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Scale label="Body" value={v.body} />
          <Scale label="Acidity" value={v.acidity} />
          <Scale label="Tannin" value={v.tannin} />
          <Scale label="Sweetness" value={v.sweetness ?? "Dry"} />
        </div>

        <div className="mt-4">
          <h3 className="kicker">Aromas &amp; flavours</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {v.aromas.map((a) => (
              <span key={a} className="chip">{a}</span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="kicker">Key regions &amp; GIs</h3>
          <div className="mt-1.5 space-y-1 text-sm">
            {[...byCountry.entries()].map(([country, gis]) => (
              <div key={country} className="flex gap-2">
                <span className="w-28 shrink-0 text-muted">{country}</span>
                <span>{gis.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>

        {v.terms && v.terms.length > 0 && (
          <div className="mt-4">
            <h3 className="kicker">Labelling terms</h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {v.terms.map((t) => (
                <span key={t} className="chip border-wine/30 bg-blush text-wine">{t}</span>
              ))}
            </div>
          </div>
        )}

        {v.climate && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-cool/30 bg-cool-bg p-3 text-sm text-ink">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-cool-dark">
                Cool climate · {v.climate.coolExample}
              </p>
              <p className="mt-1.5">{v.climate.cool}</p>
            </div>
            <div className="rounded-lg border border-wine/25 bg-blush p-3 text-sm text-ink">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-wine">
                Warm climate · {v.climate.warmExample}
              </p>
              <p className="mt-1.5">{v.climate.warm}</p>
            </div>
          </div>
        )}

        <button onClick={onClose} className="btn-ghost mt-5 w-full">Close</button>
      </div>
    </div>
  );
}
