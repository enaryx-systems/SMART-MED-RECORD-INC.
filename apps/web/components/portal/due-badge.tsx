import { AlertTriangle, Clock } from "lucide-react";
import { getDueUrgency } from "@/lib/utils/due-urgency";
import type { CaseStatus } from "@/lib/types/portal";

const LEVEL_STYLE = {
  overdue: { bg: "bg-red-50", text: "text-red-600", icon: AlertTriangle },
  urgent: { bg: "bg-red-50", text: "text-red-600", icon: AlertTriangle },
  upcoming: { bg: "bg-gold/15", text: "text-gold", icon: Clock },
} as const;

export function DueBadge({ dueAt, status }: { dueAt: string | null; status: CaseStatus }) {
  const urgency = getDueUrgency(dueAt, status);
  if (!urgency) return null;

  const { bg, text, icon: Icon } = LEVEL_STYLE[urgency.level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${bg} ${text}`}
    >
      <Icon size={12} />
      {urgency.label}
    </span>
  );
}
