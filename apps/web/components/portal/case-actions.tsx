"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Pause, Play } from "lucide-react";
import { ApiError, CaseAction, createInvoice, listUsers, transitionCase } from "@/lib/api/client";
import { CaseRecord, Role } from "@/lib/types/portal";
import { useSession } from "@/lib/auth/session";

function Btn({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const styles = {
    primary: "bg-emerald text-white hover:bg-emerald/90",
    secondary: "border border-pine/20 text-pine hover:bg-cream",
    danger: "border border-red-200 text-red-600 hover:bg-red-50",
  } as const;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export function CaseActions({ caseRecord }: { caseRecord: CaseRecord }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDue, setInvoiceDue] = useState("");

  const role = session?.user.role;
  const userId = session?.user.id;

  const { data: staff = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => listUsers(),
    enabled: caseRecord.status === "AWAITING_APPROVAL" && (role === "case-manager" || role === "admin"),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["case", caseRecord.id] });
    qc.invalidateQueries({ queryKey: ["cases"] });
    qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    qc.invalidateQueries({ queryKey: ["case-activity", caseRecord.id] });
    qc.invalidateQueries({ queryKey: ["invoices"] });
  };

  const transition = useMutation({
    mutationFn: (params: { action: CaseAction; payload?: Record<string, string> }) =>
      transitionCase(caseRecord.id, params.action, params.payload),
    onSuccess: () => {
      setError("");
      setNote("");
      invalidate();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Something went wrong"),
  });

  const invoiceMutation = useMutation({
    mutationFn: () =>
      createInvoice({
        caseId: caseRecord.id,
        amountCents: Math.round(Number(invoiceAmount) * 100),
        dueAt: new Date(invoiceDue).toISOString(),
      }),
    onSuccess: () => {
      setError("");
      setInvoiceAmount("");
      setInvoiceDue("");
      invalidate();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not issue invoice"),
  });

  if (!role || !userId) return null;

  const isOps = role === "case-manager" || role === "admin";
  const isAssignee = caseRecord.assignee?.id === userId;
  const isReviewer = caseRecord.reviewer?.id === userId;
  const canReview = ["reviewer", "physician", "admin"].includes(role);
  const isBilling = role === "billing" || isOps;

  const blocks: React.ReactNode[] = [];

  if (caseRecord.onHold) {
    if (isOps) {
      blocks.push(
        <Btn key="resume" onClick={() => transition.mutate({ action: "resume" })} variant="secondary">
          <Play size={14} /> Resume case
        </Btn>,
      );
    }
  } else {
    switch (caseRecord.status) {
      case "AWAITING_APPROVAL": {
        if (!caseRecord.approvedAt && (role === "attorney" || isOps)) {
          blocks.push(
            <Btn key="approve" onClick={() => transition.mutate({ action: "approve" })}>
              Approve & proceed <ArrowRight size={14} />
            </Btn>,
          );
        }
        if (caseRecord.approvedAt && isOps) {
          blocks.push(
            <div key="assign" className="flex flex-wrap items-center gap-2">
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="rounded-lg border px-3 py-2.5 text-xs outline-none focus:border-emerald"
              >
                <option value="">Assign to…</option>
                {staff
                  .filter((u) => u.role !== "attorney" && u.role !== "billing")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} · {u.role}
                    </option>
                  ))}
              </select>
              <Btn
                onClick={() => transition.mutate({ action: "assign", payload: { assigneeId } })}
                disabled={!assigneeId}
              >
                Assign & start processing <ArrowRight size={14} />
              </Btn>
            </div>,
          );
        }
        break;
      }
      case "IN_PROCESSING": {
        if (isAssignee && !caseRecord.acknowledgedAt) {
          blocks.push(
            <Btn key="ack" onClick={() => transition.mutate({ action: "acknowledge" })} variant="secondary">
              Acknowledge assignment
            </Btn>,
          );
        }
        if (isAssignee || isOps) {
          blocks.push(
            <Btn key="submit" onClick={() => transition.mutate({ action: "submitForReview" })}>
              Submit for review <ArrowRight size={14} />
            </Btn>,
          );
        }
        break;
      }
      case "UNDER_REVIEW": {
        if (isReviewer || (!caseRecord.reviewer && canReview) || role === "admin") {
          blocks.push(
            <Btn key="rapprove" onClick={() => transition.mutate({ action: "reviewerApprove" })}>
              Approve for final audit <ArrowRight size={14} />
            </Btn>,
            <Btn
              key="rreturn"
              variant="secondary"
              onClick={() => transition.mutate({ action: "reviewerReturn", payload: note ? { note } : undefined })}
            >
              Return for correction
            </Btn>,
          );
        }
        break;
      }
      case "FINAL_AUDIT": {
        if (isOps) {
          blocks.push(
            <Btn key="qapprove" onClick={() => transition.mutate({ action: "qcApprove" })}>
              Approve & deliver <ArrowRight size={14} />
            </Btn>,
            <Btn
              key="qreturn"
              variant="secondary"
              onClick={() => transition.mutate({ action: "qcReturn", payload: note ? { note } : undefined })}
            >
              Return for correction
            </Btn>,
          );
        }
        break;
      }
      case "DELIVERED": {
        if (isBilling) {
          blocks.push(
            <Btn key="followup" onClick={() => transition.mutate({ action: "markFollowUp" })}>
              Record follow-up sent <ArrowRight size={14} />
            </Btn>,
          );
        }
        break;
      }
      case "FOLLOW_UP":
      case "PAYMENT_PENDING": {
        if (isOps) {
          blocks.push(
            <Btn key="close" onClick={() => transition.mutate({ action: "close" })}>
              Close case <ArrowRight size={14} />
            </Btn>,
          );
        }
        break;
      }
    }
    if (isOps && caseRecord.status !== "CLOSED") {
      blocks.push(
        <Btn key="hold" variant="secondary" onClick={() => transition.mutate({ action: "hold" })}>
          <Pause size={14} /> Place on hold
        </Btn>,
      );
    }
  }

  const showInvoiceForm =
    isBilling && ["DELIVERED", "FOLLOW_UP", "PAYMENT_PENDING"].includes(caseRecord.status);

  if (blocks.length === 0 && !showInvoiceForm) return null;

  return (
    <section className="rounded-2xl border border-gold/30 bg-cream p-5">
      <b className="text-xs font-bold uppercase tracking-wider text-pine/60">Next step</b>
      <div className="mt-3 flex flex-wrap gap-2">{blocks}</div>
      {(caseRecord.status === "UNDER_REVIEW" || caseRecord.status === "FINAL_AUDIT") && isOps === false && canReview && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note if returning for correction…"
          rows={2}
          className="mt-3 w-full resize-none rounded-lg border p-3 text-xs outline-none"
        />
      )}
      {showInvoiceForm && (
        <div className="mt-4 border-t border-gold/30 pt-4">
          <b className="text-[11px] font-bold uppercase tracking-wider text-pine/60">Issue invoice</b>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={1}
              step="0.01"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
              placeholder="Amount (USD)"
              className="w-32 rounded-lg border px-3 py-2.5 text-xs outline-none focus:border-emerald"
            />
            <input
              type="date"
              value={invoiceDue}
              onChange={(e) => setInvoiceDue(e.target.value)}
              className="rounded-lg border px-3 py-2.5 text-xs outline-none focus:border-emerald"
            />
            <Btn
              onClick={() => invoiceMutation.mutate()}
              disabled={!invoiceAmount || !invoiceDue || invoiceMutation.isPending}
            >
              Issue invoice
            </Btn>
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </section>
  );
}

export function roleCanUpload(role?: Role) {
  return !!role && role !== "billing";
}
