import { initials } from "@/lib/utils/initials";
import { ROLE_COLOR, type Role } from "@/lib/types/portal";

export function UserCell({ name, subtitle, role }: { name: string; subtitle?: string; role?: Role }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
          role ? "" : "bg-gradient-to-br from-pine to-emerald"
        }`}
        style={role ? { backgroundColor: ROLE_COLOR[role] } : undefined}
      >
        {initials(name)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-ink">{name}</div>
        {subtitle && <div className="truncate text-xs text-ink/55">{subtitle}</div>}
      </div>
    </div>
  );
}
