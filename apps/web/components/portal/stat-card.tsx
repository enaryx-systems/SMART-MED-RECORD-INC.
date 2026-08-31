import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)] transition-[transform,box-shadow,border-color] duration-[250ms] ease hover:-translate-y-[3px] hover:border-gold/50 hover:shadow-[0_16px_34px_rgba(0,69,58,0.12),0_3px_8px_rgba(183,138,61,0.1)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold text-ink/75">{label}</span>
        </div>
        {Icon && (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}1A`, color }}
          >
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="mt-4 text-4xl font-bold text-pine">{value}</div>
    </div>
  );
}
