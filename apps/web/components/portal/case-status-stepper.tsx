import { Ban } from "lucide-react";
import { Stepper } from "@/components/portal/stepper";
import type { CaseStatus } from "@/lib/types/portal";

const STEPS = [
  { label: "Submitted" },
  { label: "In Progress" },
  { label: "Awaiting Delivery" },
  { label: "Delivered" },
];

// Maps every status onto the linear happy-path stepper above. ON_HOLD sits
// visually at the same step as IN_PROGRESS (work is paused, not advanced),
// flagged separately below rather than inventing an extra step for it.
function currentStepFor(status: CaseStatus) {
  switch (status) {
    case "DRAFT":
      return 0;
    case "NEW":
    case "IN_PROGRESS":
    case "ON_HOLD":
      return 1;
    case "AWAITING_DELIVERY":
      return 2;
    case "DELIVERED":
      return STEPS.length;
    default:
      return 0;
  }
}

export function CaseStatusStepper({ status }: { status: CaseStatus }) {
  if (status === "CANCELED") {
    return (
      <div className="flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
        <Ban size={16} />
        This case was canceled.
      </div>
    );
  }

  return (
    <div>
      <Stepper steps={STEPS} current={currentStepFor(status)} />
      {status === "ON_HOLD" && (
        <p className="mt-3 text-center text-xs font-semibold text-gold">
          On hold — processing is paused.
        </p>
      )}
    </div>
  );
}
