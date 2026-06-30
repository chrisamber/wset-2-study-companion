// The signature element: a wine's structure as a 5-step SAT-style readout.
// Colour encodes the exam's core axis — acidity = cool/steel pole,
// body & tannin = warm/wine pole, sweetness = gold.

// Map a WSET structure value ("Medium–high", "Full", "Dry", "—") to 0–5.
// ponytail: covers the fixed Low/Medium/High/Full + sweetness vocab in the
// data; "—"/"N/A" → 0 (no bars). Rendered scales are the check
// (Cab Sauv → body 5, acidity 4, tannin 5; a white → tannin 0).
export function levelOf(value: string): number {
  const t = value.toLowerCase().replace(/[–—]/g, "-").trim();
  if (t === "-" || t === "n/a") return 0;
  if (/lusc/.test(t)) return 5;
  if (/off-dry/.test(t)) return 2;
  if (/\bsweet\b/.test(t)) return 4;
  if (/\bdry\b/.test(t)) return 1;
  const lo = /low/.test(t),
    med = /medium/.test(t),
    hi = /(high|full)/.test(t);
  if (lo && med) return 2;
  if (med && hi) return 4;
  if (hi) return 5;
  if (med) return 3;
  if (lo) return 1;
  return 3;
}

const FILL: Record<string, string> = {
  Body: "bg-wine",
  Tannin: "bg-wine",
  Acidity: "bg-cool",
  Sweetness: "bg-gold",
};

export function Scale({ label, value }: { label: string; value: string }) {
  const lvl = levelOf(value);
  const fill = FILL[label] ?? "bg-wine";
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-left">
      <div className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-0.5 text-sm font-medium leading-tight text-ink">{value}</div>
      <div className="mt-1.5 flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className={`h-1.5 flex-1 rounded-sm ${s <= lvl ? fill : "bg-cream-2"}`} />
        ))}
      </div>
    </div>
  );
}
