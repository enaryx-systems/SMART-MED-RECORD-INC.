"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Save,
  ShieldCheck,
} from "lucide-react";
import { fetchDocuments, updateCaseStatus } from "@/lib/api/client";
import { Stepper } from "@/components/portal/stepper";
import { Button } from "@/components/portal/button";
import { DocumentList } from "@/components/portal/document-list";
import { CaseTimeline } from "@/components/portal/case-timeline";
import type { CaseStatus } from "@/lib/types/portal";

const STEPS = [
  { label: "Client Submission" },
  { label: "Processing" },
  { label: "Final Review" },
  { label: "Delivered" },
];

const STEP_TITLES = [
  "Step 1 — Client Submission",
  "Step 2 — Processing",
  "Step 3 — Final Review & QC",
  "Delivered",
];

function stepIndexFor(status: CaseStatus) {
  switch (status) {
    case "NEW":
      return 0;
    case "IN_PROGRESS":
    case "ON_HOLD":
      return 1;
    case "AWAITING_DELIVERY":
      return 2;
    case "DELIVERED":
      return 3;
    default:
      return 0;
  }
}

const QC_ITEMS = [
  "Records match the client's requested scope",
  "Chronology/summary is complete and accurate",
  "Formatting and delivery template checked",
];

// The QC checklist is per-case reviewer working state, not part of the case
// record itself — held in localStorage (per browser) so a reviewer's
// in-progress checklist survives a reload or accidental navigation away
// without needing a new backend field for what is essentially a scratch pad.
const qcDraftKey = (caseId: string) => `smr-qc-draft:${caseId}`;

function loadQcDraft(caseId: string): boolean[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(qcDraftKey(caseId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === QC_ITEMS.length) return parsed as boolean[];
  } catch {
    // corrupted/blocked storage — fall through to a fresh checklist
  }
  return null;
}

function saveQcDraft(caseId: string, checked: boolean[]) {
  try {
    window.localStorage.setItem(qcDraftKey(caseId), JSON.stringify(checked));
  } catch {
    // storage unavailable (private browsing, quota) — draft just won't persist
  }
}

function StepNav({
  onPrevious,
  onNext,
  nextLabel,
  nextIcon,
  nextDisabled,
  showNext = true,
}: {
  onPrevious?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextIcon?: React.ReactNode;
  nextDisabled?: boolean;
  showNext?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {onPrevious && (
        <Button variant="secondary" onClick={onPrevious}>
          <ChevronLeft size={14} />
          Previous
        </Button>
      )}
      {showNext && onNext && (
        <Button onClick={onNext} disabled={nextDisabled}>
          {nextIcon}
          {nextLabel ?? "Save & Next"}
        </Button>
      )}
    </div>
  );
}

export function CaseReviewWizard({ caseId, status }: { caseId: string; status: CaseStatus }) {
  const queryClient = useQueryClient();
  const [qcChecked, setQcChecked] = useState<boolean[]>(
    () => loadQcDraft(caseId) ?? QC_ITEMS.map(() => false),
  );
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);

  function updateQcItem(index: number, checked: boolean) {
    setQcChecked((prev) => {
      const next = prev.map((v, idx) => (idx === index ? checked : v));
      saveQcDraft(caseId, next); // hold every field as it changes, not just on explicit save
      return next;
    });
  }

  function handleSaveDraft() {
    saveQcDraft(caseId, qcChecked);
    setDraftSavedAt(Date.now());
  }

  const actualStep = stepIndexFor(status);
  const [viewStep, setViewStep] = useState(actualStep);

  // Only resyncs when the case's real status changes (our own mutation
  // succeeding, or someone else moving it) — never on an unrelated refetch,
  // so a reviewer's "look back" navigation isn't clobbered mid-review.
  useEffect(() => {
    setViewStep(stepIndexFor(status));
  }, [status]);

  const { data: documents } = useQuery({
    queryKey: ["documents", caseId],
    queryFn: () => fetchDocuments(caseId),
  });
  const hasDeliverable = (documents ?? []).some((d) => d.kind === "DELIVERABLE");

  const statusMutation = useMutation({
    mutationFn: (next: CaseStatus) => updateCaseStatus(caseId, next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["case-events", caseId] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });

  if (status === "CANCELED") {
    return (
      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-600">
        This case was canceled — no further processing is required.
      </div>
    );
  }

  const isFrontier = viewStep === actualStep;
  const goPrevious = viewStep > 0 ? () => setViewStep((v) => v - 1) : undefined;
  const goNextReadOnly = !isFrontier ? () => setViewStep((v) => Math.min(3, v + 1)) : undefined;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
        <Stepper steps={STEPS} current={status === "DELIVERED" ? STEPS.length : actualStep} />
        {status === "ON_HOLD" && (
          <p className="mt-4 text-center text-xs font-semibold text-gold">
            On hold — resume to continue processing.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-emerald">
          {STEP_TITLES[viewStep]}
        </h3>
        {!isFrontier && (
          <StepNav onPrevious={goPrevious} onNext={goNextReadOnly} nextLabel="Next" />
        )}
      </div>
      {!isFrontier && (
        <p className="-mt-3 text-xs text-ink/50">
          You&rsquo;re reviewing a completed step. Use Next to catch back up to where this case is
          now.
        </p>
      )}

      {viewStep === 0 && (
        <div className="space-y-6">
          <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
            <p className="text-sm text-ink/70">
              Review everything the client submitted before starting work on this case.
            </p>
          </div>
          <DocumentList caseId={caseId} canUpload={false} />
          {isFrontier && (
            <div className="flex justify-end">
              <Button
                onClick={() => statusMutation.mutate("IN_PROGRESS")}
                disabled={statusMutation.isPending}
              >
                <PlayCircle size={15} />
                {statusMutation.isPending ? "Starting…" : "Begin Processing"}
              </Button>
            </div>
          )}
        </div>
      )}

      {viewStep === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
            <p className="text-sm text-ink/70">
              Work the case against the source records. Log notes below as you go, and upload
              interim files if needed.
            </p>
          </div>
          <DocumentList caseId={caseId} canUpload uploadLabel="Upload a working file" />
          <CaseTimeline caseId={caseId} />
          {isFrontier && (
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={goPrevious} disabled={!goPrevious}>
                <ChevronLeft size={14} />
                Previous
              </Button>
              {status === "ON_HOLD" ? (
                <Button
                  onClick={() => statusMutation.mutate("IN_PROGRESS")}
                  disabled={statusMutation.isPending}
                >
                  Resume Processing
                </Button>
              ) : (
                <Button
                  onClick={() => statusMutation.mutate("AWAITING_DELIVERY")}
                  disabled={statusMutation.isPending}
                >
                  <ChevronRight size={14} />
                  Save &amp; Send for Final Review
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {viewStep === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
            <ul className="space-y-2.5">
              {QC_ITEMS.map((item, i) => (
                <li key={item}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={qcChecked[i]}
                      onChange={(e) => updateQcItem(i, e.target.checked)}
                      className="h-4 w-4 rounded border-2 border-pine/40 accent-emerald"
                    />
                    {item}
                  </label>
                </li>
              ))}
            </ul>
            {isFrontier && (
              <div className="mt-4 flex items-center gap-3 border-t border-mint pt-4">
                <Button variant="secondary" onClick={handleSaveDraft}>
                  <Save size={14} />
                  Save as Draft
                </Button>
                {draftSavedAt && (
                  <span className="text-xs font-semibold text-emerald">
                    Draft saved — held on this device.
                  </span>
                )}
              </div>
            )}
          </div>
          <DocumentList caseId={caseId} canUpload uploadLabel="Upload the reviewed deliverable" />
          {!hasDeliverable && isFrontier && (
            <p className="text-xs font-semibold text-gold">
              Upload the reviewed deliverable above before delivering to the client.
            </p>
          )}
          {isFrontier && (
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={goPrevious} disabled={!goPrevious}>
                <ChevronLeft size={14} />
                Previous
              </Button>
              <Button
                onClick={() => statusMutation.mutate("DELIVERED")}
                disabled={statusMutation.isPending || !hasDeliverable || !qcChecked.every(Boolean)}
              >
                <ShieldCheck size={15} />
                Deliver to Client
              </Button>
            </div>
          )}
        </div>
      )}

      {viewStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald/30 bg-mint/30 p-6">
            <CheckCircle2 className="text-emerald" size={28} />
            <div>
              <div className="text-base font-bold text-pine">Delivered</div>
              <p className="text-sm text-ink/70">
                This case has been delivered. The full activity log below is the record of
                reference.
              </p>
            </div>
          </div>
          {goPrevious && (
            <Button variant="secondary" onClick={goPrevious}>
              <ChevronLeft size={14} />
              Previous
            </Button>
          )}
          <DocumentList caseId={caseId} canUpload={false} />
          <CaseTimeline caseId={caseId} />
        </div>
      )}
    </div>
  );
}
