"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  FileCheck2,
  FileInput,
  FileSearch,
  Mail,
  Pause,
  ReceiptText,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeading } from "@/components/portal/page-heading";
import { CaseActions } from "@/components/portal/case-actions";
import { getCases } from "@/lib/api/client";
import { CaseRecord, CaseStatus } from "@/lib/types/portal";

const stages: {
  number: number;
  name: string;
  shortName: string;
  owner: string;
  control: string;
  evidence: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  { number: 1, name: "Client Arrival / Lead Generation", shortName: "Client arrival", owner: "Operations / Client Coordinator", control: "Record the lead source and client contact details.", evidence: "Lead source + contact record", description: "Capture how the client arrived, the requested service, and enough contact context to prevent duplicate cases.", Icon: Users },
  { number: 2, name: "Service Introduction & Recognition", shortName: "Service introduction", owner: "Client Coordinator", control: "Document interest, requested service, and initial requirements.", evidence: "Service request record", description: "Explain the service, scope, expected deliverables, and general process so the client understands what will happen next.", Icon: FileSearch },
  { number: 3, name: "Agreement to Submit Records", shortName: "Agreement", owner: "Client + Operations", control: "Provide secure submission instructions.", evidence: "Submission instructions sent", description: "Confirm the client agrees to provide the records and clarify any supporting documents needed for intake.", Icon: ShieldCheck },
  { number: 4, name: "Portal Record Submission", shortName: "Record submission", owner: "Client / Operations", control: "Link records to the correct case.", evidence: "Records linked to case", description: "The client uploads medical records and relevant case information through the secure portal. Check that files are identifiable and accessible.", Icon: FileInput },
  { number: 5, name: "Record Submission Acknowledgement", shortName: "Acknowledgement", owner: "Operations", control: "Log receipt date/time and missing records.", evidence: "Acknowledgement email + intake log", description: "Send the approved acknowledgement template and flag missing, unreadable, or incomplete records before processing begins.", Icon: Mail },
  { number: 6, name: "Client Approval to Proceed", shortName: "Client approval", owner: "Operations + Client", control: "Approval must be documented before processing.", evidence: "Recorded client approval", description: "Request clarification where needed and obtain the client's approval to proceed. Without approval, place the case on hold.", Icon: UserCheck },
  { number: 7, name: "Case Assignment", shortName: "Assignment", owner: "Operations / Case Coordinator", control: "Record assignee, scope, and target date.", evidence: "Assignment record", description: "Assign the approved case based on workload, expertise, and requirements. Capture the assignment date and agreed scope.", Icon: Users },
  { number: 8, name: "Staff Acknowledgement", shortName: "Staff acknowledgement", owner: "Assigned Staff", control: "Confirm receipt and identify escalations.", evidence: "Staff acknowledgement", description: "The assigned staff member confirms receipt, understands the scope, and immediately flags missing information or risks.", Icon: UserCheck },
  { number: 9, name: "Case Processing", shortName: "Processing", owner: "Assigned Staff", control: "Complete the approved scope and maintain working files.", evidence: "Working file + draft deliverable", description: "Process the records according to the approved scope, document material issues, and prepare the requested deliverable.", Icon: FileSearch },
  { number: 10, name: "Reviewer Review", shortName: "Reviewer review", owner: "Reviewer / Senior Reviewer", control: "Check accuracy, logic, completeness, and scope.", evidence: "Reviewer sign-off", description: "A reviewer performs the substantive review and confirms the work meets the client's requested scope before final audit.", Icon: ClipboardCheck },
  { number: 11, name: "Final Audit / Quality Control", shortName: "Final audit", owner: "Final Auditor / QC", control: "Verify final file, identifiers, formatting, and approval.", evidence: "QC checklist + approval", description: "Complete the independent final quality check. Corrections must be resolved before the final version can be released.", Icon: CheckCircle2 },
  { number: 12, name: "Case Delivery", shortName: "Delivery", owner: "Operations / Delivery Team", control: "Record recipient, date/time, and final version.", evidence: "Delivery confirmation", description: "Deliver only the final approved version using the standard delivery email template and record the delivery internally.", Icon: FileCheck2 },
  { number: 13, name: "One-Week Follow-up", shortName: "Follow-up", owner: "Operations / Billing", control: "Request feedback and follow up on invoice status.", evidence: "Feedback + invoice follow-up", description: "Approximately one week after delivery, confirm receipt, request feedback, handle clarifications, and follow up on payment.", Icon: Mail },
  { number: 14, name: "Payment", shortName: "Payment", owner: "Billing / Accounts", control: "Match payment to invoice and case.", evidence: "Reconciled payment", description: "Record and reconcile the client's payment against the invoice and update the financial status.", Icon: ReceiptText },
  { number: 15, name: "Case Closure", shortName: "Closure", owner: "Operations", control: "Retain required records and set status to Closed.", evidence: "Closed case record", description: "Close the case after deliverables are accepted and payment is confirmed. Retain approvals, communications, delivery confirmation, and payment details.", Icon: CheckCircle2 },
];

function statusToStage(c: CaseRecord): number {
  const map: Record<CaseStatus, number> = {
    AWAITING_APPROVAL: c.approvedAt ? 7 : 6,
    IN_PROCESSING: 9,
    UNDER_REVIEW: 10,
    FINAL_AUDIT: 11,
    DELIVERED: 12,
    FOLLOW_UP: 13,
    PAYMENT_PENDING: 14,
    CLOSED: 15,
  };
  return map[c.status] ?? 6;
}

export default function WorkflowPage() {
  const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: () => getCases() });
  const [caseId, setCaseId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState(6);

  useEffect(() => {
    if (!caseId && cases.length > 0) setCaseId(cases[0].id);
  }, [cases, caseId]);

  const active = cases.find((c) => c.id === caseId);
  const completedThrough = active ? statusToStage(active) - 1 : 0;

  useEffect(() => {
    if (active) setSelectedStage(statusToStage(active));
    // Only re-sync the selected stage when the case or its status changes,
    // not on every unrelated field update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, active?.status]);

  const stage = stages[selectedStage - 1];
  const completion = Math.round((completedThrough / stages.length) * 100);
  const StageIcon = stage.Icon;

  return (
    <>
      <PageHeading
        eyebrow="Case operations"
        title="Medical records review workflow"
        description="Follow every control from first contact through reconciled closure."
        action={
          <Link href="/portal/cases" className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-xs font-semibold">
            Open cases <ArrowRight size={15} />
          </Link>
        }
      />

      <section className="portal-card-white overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-5 border-b border-gold/25 bg-cream px-5 py-5 text-pine sm:flex-row sm:items-center sm:justify-between lg:px-7">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-gold">
              <ShieldCheck size={16} /> ACTIVE CASE WORKFLOW
            </div>
            <select
              value={caseId ?? ""}
              onChange={(e) => setCaseId(e.target.value)}
              className="mt-2 max-w-full rounded-lg border border-gold/30 bg-white px-3 py-2 text-sm font-semibold text-pine outline-none"
            >
              {cases.length === 0 && <option>No cases yet</option>}
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} · {c.matterName}
                </option>
              ))}
            </select>
            {active && (
              <p className="mt-1 text-xs text-slate-500">
                {active.service} · {active.clientName} · Priority: {active.priority}
                {active.onHold ? " · On hold" : ""}
              </p>
            )}
          </div>
          <div className="min-w-[190px]">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>SOP stage reference</span>
              <b className="text-pine">{completion}%</b>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-mint">
              <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-2 text-right text-[11px] text-slate-400">Stage {selectedStage} of {stages.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border-b border-mint bg-[#F7F9F9] p-4 lg:border-b-0 lg:border-r lg:p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Case stages</span>
              <span className="text-[11px] font-semibold text-emerald">{completedThrough} complete</span>
            </div>
            <div className="space-y-1">
              {stages.map((item) => {
                const complete = item.number <= completedThrough;
                const isActive = item.number === selectedStage;
                const ItemIcon = item.Icon;
                return (
                  <button
                    key={item.number}
                    onClick={() => setSelectedStage(item.number)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${isActive ? "border border-gold/30 bg-cream text-pine shadow-card" : "text-slate-600 hover:bg-white hover:text-pine"}`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${complete ? "border-emerald bg-emerald text-white" : isActive ? "border-gold bg-gold/10 text-pine" : "border-slate-200 bg-white text-slate-400"}`}>
                      {complete ? <Check size={14} /> : <ItemIcon size={14} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400">0{item.number}</span>
                      <span className="block truncate text-xs font-semibold">{item.shortName}</span>
                    </span>
                    {isActive && <ChevronRight size={15} className="text-gold" />}
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="p-5 lg:p-8">
            <div className="flex flex-col gap-5 border-b border-mint pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream text-pine shadow-sm">
                  <StageIcon size={23} />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald">Stage {stage.number} · {stage.shortName}</span>
                  <h3 className="mt-2 text-2xl text-pine">{stage.name}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{stage.description}</p>
                </div>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${active?.onHold ? "bg-amber-50 text-amber-700" : selectedStage <= completedThrough ? "bg-emerald/10 text-emerald" : "bg-mint text-pine"}`}>
                {active?.onHold ? <Pause size={12} /> : selectedStage <= completedThrough ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                {active?.onHold ? "On hold" : selectedStage <= completedThrough ? "Complete" : selectedStage === statusToStage(active ?? ({} as CaseRecord)) ? "Current" : "Upcoming"}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="portal-card-hover rounded-xl border border-mint bg-ivory p-5">
                <span className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Responsible</span>
                <p className="mt-3 text-sm font-semibold text-pine">{stage.owner}</p>
              </div>
              <div className="portal-card-hover rounded-xl border border-mint bg-ivory p-5">
                <span className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Control point</span>
                <p className="mt-3 text-sm font-semibold text-pine">{stage.control}</p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4">
              <FileCheck2 size={18} className="mt-0.5 shrink-0 text-gold" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[.16em] text-pine">Required evidence</span>
                <p className="mt-1 text-sm text-slate-600">{stage.evidence}</p>
              </div>
            </div>

            {active && (
              <div className="mt-7 border-t border-mint pt-6">
                <CaseActions caseRecord={active} />
                <Link
                  href={`/portal/cases/${active.id}`}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald"
                >
                  Open full case record <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
