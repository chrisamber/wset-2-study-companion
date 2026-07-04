export function Bar({
  label,
  pct,
  value,
  dim,
}: {
  label: string;
  pct: number;
  value: string;
  dim?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 text-sm ${dim ? "opacity-50" : ""}`}>
      <span className="w-32 shrink-0 truncate text-muted">{label}</span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-2">
        <span
          className="bar-fill block h-full rounded-full bg-gradient-to-r from-wine to-wine-light"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="w-20 shrink-0 text-right tabular-nums">{value}</span>
    </div>
  );
}
