import { Banknote, ClipboardList, ShieldCheck, User } from "lucide-react";
import { ROLE_LABEL, type Role } from "@/lib/types/portal";

// Every role gets its own designated color, distinct from the case-status
// palette (STATUS_COLOR in lib/types/portal.ts) so a role pill is never
// mistaken for a status pill in the same table.
const ROLE_STYLE: Record<
  Role,
  { bg: string; text: string; icon: React.ComponentType<{ size?: number }> }
> = {
  CLIENT: { bg: "bg-emerald/20", text: "text-emerald", icon: User },
  ADMIN: { bg: "bg-pine/20", text: "text-pine", icon: ShieldCheck },
  REVIEWER: { bg: "bg-gold/15", text: "text-gold", icon: ClipboardList },
  BILLING: { bg: "bg-[#7C5295]/20", text: "text-[#7C5295]", icon: Banknote },
};

export function RoleBadge({ role }: { role: Role }) {
  const { bg, text, icon: Icon } = ROLE_STYLE[role];
  return (
    <span
      className={`inline-flex w-24 items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${bg} ${text}`}
    >
      <Icon size={12} />
      {ROLE_LABEL[role]}
    </span>
  );
}
