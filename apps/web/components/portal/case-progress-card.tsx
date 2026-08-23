import { CaseStatusStepper } from "@/components/portal/case-status-stepper";
import type { CaseStatus } from "@/lib/types/portal";

export function CaseProgressCard({ status }: { status: CaseStatus }) {
  return (
    <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
      <h3 className="mb-5 text-xs font-bold uppercase tracking-wide text-emerald">Case progress</h3>
      <CaseStatusStepper status={status} />
    </div>
  );
}
