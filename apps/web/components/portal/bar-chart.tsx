interface Bar {
  label: string;
  value: number;
  color: string;
}

export function BarChart({ bars }: { bars: Bar[] }) {
  const max = Math.max(1, ...bars.map((b) => b.value));

  return (
    <div className="flex h-56 items-end gap-4 sm:gap-6">
      {bars.map((b) => (
        <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-sm font-semibold text-pine">{b.value}</span>
          <div className="flex h-40 w-full items-end rounded-lg bg-mint/50">
            <div
              className="w-full rounded-lg transition-[height] duration-slow"
              style={{
                height: `${(b.value / max) * 100}%`,
                backgroundColor: b.color,
                minHeight: b.value > 0 ? "6px" : 0,
              }}
            />
          </div>
          <span className="text-center text-xs text-ink/60">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
