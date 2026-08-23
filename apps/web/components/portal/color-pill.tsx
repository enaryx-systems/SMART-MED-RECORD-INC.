import { getColorForKey } from "@/lib/utils/entity-color";

export function ColorPill({
  colorKey,
  label,
  icon: Icon,
}: {
  colorKey: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}) {
  const color = getColorForKey(colorKey);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ backgroundColor: `${color}1F`, color }}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}
