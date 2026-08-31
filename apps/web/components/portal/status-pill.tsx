import { STATUS_COLOR, STATUS_LABEL, type CaseStatus } from "@/lib/types/portal";

export function StatusPill({ status }: { status: CaseStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: STATUS_COLOR[status] }}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
