export function SimpleBarChart({
  data,
  valueLabel,
}: {
  data: { label: string; value: number }[];
  valueLabel?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs text-muted-foreground">{d.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-medium text-foreground">
            {valueLabel ? valueLabel(d.value) : d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(1, ...points);
  return (
    <div className="flex h-14 items-end gap-1">
      {points.map((p, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-primary/70"
          style={{ height: `${Math.max(6, (p / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
