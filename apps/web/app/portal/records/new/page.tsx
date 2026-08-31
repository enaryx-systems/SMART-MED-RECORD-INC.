"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ApiError,
  createCase,
  fetchCase,
  submitCase,
  updateCase,
  uploadDocument,
  type CaseInput,
} from "@/lib/api/client";
import { getSession } from "@/lib/auth/session";
import type { CaseType } from "@/lib/types/portal";
import { Stepper } from "@/components/portal/stepper";
import { PageHeader } from "@/components/portal/page-header";
import { StepCaseDetails } from "./step-case-details";
import { StepServiceDetails } from "./step-service-details";
import { StepUploadRecords } from "./step-upload-records";
import { EMPTY_WIZARD_STATE, isStep1Valid, isStep2Valid, type WizardState } from "./wizard-types";

const STEPS = [
  { label: "Case Details" },
  { label: "Service Details" },
  { label: "Upload Records" },
];
const DRAFT_KEY = "smr_case_wizard_draft";

function buildPayload(state: WizardState): CaseInput {
  return {
    matterName: state.matterName,
    caseType: (state.caseType || undefined) as CaseType | undefined,
    attorneyName: state.attorneyName || undefined,
    contactName: state.contactName || undefined,
    contactEmail: state.contactEmail || undefined,
    contactPhone: state.contactPhone || undefined,
    caseOverview: state.caseOverview || undefined,
    caseIssues: state.caseIssues || undefined,
    specificInstructions: state.specificInstructions || undefined,
    servicesDesired: state.servicesDesired.length ? state.servicesDesired : undefined,
    additionalServices: state.additionalServices.length ? state.additionalServices : undefined,
    otherServicesNote: state.otherServicesNote || undefined,
    deliverySpeed: state.deliverySpeed,
    pdfReference: state.pdfReference,
    batesReference: state.batesReference,
  };
}

function NewRecordWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("caseId");

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>(EMPTY_WIZARD_STATE);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (resumeId) {
        try {
          const found = await fetchCase(resumeId);
          if (cancelled) return;
          if (found.status !== "DRAFT") {
            router.replace("/portal/cases");
            return;
          }
          setCaseId(found.id);
          setState({
            matterName: found.matterName,
            caseType: found.caseType,
            attorneyName: found.attorneyName ?? "",
            contactName: found.contactName ?? "",
            contactEmail: found.contactEmail ?? "",
            contactPhone: found.contactPhone ?? "",
            caseOverview: found.caseOverview ?? "",
            caseIssues: found.caseIssues ?? "",
            specificInstructions: found.specificInstructions ?? "",
            servicesDesired: found.servicesDesired,
            additionalServices: found.additionalServices,
            otherServicesNote: found.otherServicesNote ?? "",
            deliverySpeed: found.deliverySpeed,
            pdfReference: found.pdfReference,
            batesReference: found.batesReference,
          });
        } catch {
          router.replace("/portal/cases");
          return;
        }
      } else {
        const saved = typeof window !== "undefined" ? window.localStorage.getItem(DRAFT_KEY) : null;
        if (saved) {
          try {
            setState({ ...EMPTY_WIZARD_STATE, ...JSON.parse(saved) });
          } catch {
            // ignore corrupt scratch data
          }
        } else {
          const session = getSession();
          if (session) setState((s) => ({ ...s, contactName: session.user.name }));
        }
      }
      if (!cancelled) setHydrated(true);
    }

    hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  useEffect(() => {
    if (!hydrated || resumeId) return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  }, [state, hydrated, resumeId]);

  function onChange(patch: Partial<WizardState>) {
    setError("");
    setState((s) => ({ ...s, ...patch }));
  }

  function goNext() {
    if (step === 0 && !isStep1Valid(state)) {
      setError("Case Name and Case Type are required.");
      return;
    }
    if (step === 1 && !isStep2Valid(state)) {
      setError("Select at least one service desired.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function persistCase() {
    const payload = buildPayload(state);
    if (caseId) {
      await updateCase(caseId, payload);
      return caseId;
    }
    const created = await createCase(payload);
    setCaseId(created.id);
    return created.id;
  }

  async function uploadStagedFiles(id: string) {
    if (files.length === 0) return;
    await Promise.all(files.map((file) => uploadDocument(id, file)));
    setFiles([]);
  }

  async function onSaveDraft() {
    if (!isStep1Valid(state)) {
      setError("Case Name and Case Type are required, even to save a draft.");
      setStep(0);
      return;
    }
    setError("");
    setDraftMessage("");
    setSavingDraft(true);
    try {
      const id = await persistCase();
      await uploadStagedFiles(id);
      setDraftMessage("Draft saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the draft.");
    } finally {
      setSavingDraft(false);
    }
  }

  async function onSubmit() {
    if (!isStep1Valid(state)) {
      setError("Case Name and Case Type are required.");
      setStep(0);
      return;
    }
    if (!isStep2Valid(state)) {
      setError("Select at least one service desired.");
      setStep(1);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const id = await persistCase();
      await uploadStagedFiles(id);
      await submitCase(id);
      window.localStorage.removeItem(DRAFT_KEY);
      router.push("/portal/cases");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit the case.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <p className="text-ink/50">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Add New Records"
        description="Submit a new matter for intake. You'll be able to track it from the Cases page."
      />

      <div className="mt-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      {draftMessage && (
        <p className="mt-4 rounded-lg bg-mint/50 px-4 py-2.5 text-sm text-pine">{draftMessage}</p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6">
        {step === 0 && <StepCaseDetails state={state} onChange={onChange} />}
        {step === 1 && <StepServiceDetails state={state} onChange={onChange} />}
        {step === 2 && (
          <StepUploadRecords
            files={files}
            onAdd={(added) => setFiles((f) => [...f, ...added])}
            onRemove={(i) => setFiles((f) => f.filter((_, idx) => idx !== i))}
          />
        )}
      </div>

      <div className="mt-8 flex justify-between border-t border-mint pt-6">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="rounded-xl border-2 border-pine/25 px-4 py-3 text-sm font-semibold text-ink/70 transition-colors duration-fast hover:bg-mint/40 disabled:opacity-0"
        >
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={savingDraft}
            className="shrink-0 rounded-xl border-2 border-emerald px-4 py-3 text-sm font-semibold text-emerald transition-colors duration-fast hover:bg-mint/40 disabled:opacity-60"
          >
            {savingDraft ? "Saving…" : "Save as Draft"}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-xl border-2 border-pine bg-emerald px-6 py-3 text-sm font-semibold text-white transition-colors duration-fast hover:bg-pine"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="rounded-xl border-2 border-pine bg-emerald px-6 py-3 text-sm font-semibold text-white transition-colors duration-fast hover:bg-pine disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewRecordPage() {
  return (
    <Suspense fallback={<p className="text-ink/50">Loading…</p>}>
      <NewRecordWizard />
    </Suspense>
  );
}
