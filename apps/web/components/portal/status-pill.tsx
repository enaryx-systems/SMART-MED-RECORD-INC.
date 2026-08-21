import { CaseStatus } from "@/lib/types/portal";

const COLORS: Record<CaseStatus, string> = {
  AWAITING_APPROVAL: "bg-cream text-[#8a6425]",
  IN_PROCESSING: "bg-mint text-pine",
  UNDER_REVIEW: "bg-gold/15 text-[#8a6425]",
  FINAL_AUDIT: "bg-gold/15 text-[#8a6425]",
  DELIVERED: "bg-emerald/10 text-emerald",
  FOLLOW_UP: "bg-emerald/10 text-emerald",
  PAYMENT_PENDING: "bg-emerald/10 text-emerald",
  CLOSED: "bg-slate-100 text-slate-500",
};

export function StatusPill({
  status,
  label,
  onHold,
}: {
  status: CaseStatus;
  label?: string;
  onHold?: boolean;
}) {
  const classes = onHold ? "bg-amber-50 text-amber-700" : (COLORS[status] ?? "bg-cream text-[#8a6425]");
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes}`}>
      {onHold ? "On hold" : (label ?? status)}
    </span>
  );
}
