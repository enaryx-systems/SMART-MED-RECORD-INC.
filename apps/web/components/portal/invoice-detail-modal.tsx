"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { downloadInvoicePdf, updateInvoice } from "@/lib/api/client";
import { downloadInvoiceExcel } from "@/lib/utils/invoice-excel";
import { Button } from "@/components/portal/button";
import { TextInput } from "@/components/portal/text-input";
import type { Invoice } from "@/lib/types/portal";

function formatAmount(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

interface LineItemDraft {
  caseId: string;
  caseNumber: string;
  description: string;
  amount: string;
}

export function InvoiceDetailModal({
  invoice,
  canEdit,
  initialEditing = false,
  onClose,
}: {
  invoice: Invoice | null;
  canEdit: boolean;
  initialEditing?: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(initialEditing);
  const [dueAt, setDueAt] = useState("");
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);

  useEffect(() => {
    if (invoice) {
      setDueAt(toDateInput(invoice.dueAt));
      setLineItems(
        invoice.lineItems.map((li) => ({
          caseId: li.caseId,
          caseNumber: li.case.caseNumber,
          description: li.description,
          amount: (li.amountCents / 100).toString(),
        })),
      );
      setEditing(initialEditing && invoice.status === "PENDING");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice]);

  const total = lineItems.reduce((sum, li) => sum + (Number(li.amount) || 0) * 100, 0);

  const mutation = useMutation({
    mutationFn: () =>
      updateInvoice(invoice!.id, {
        dueAt,
        lineItems: lineItems.map((li) => ({
          caseId: li.caseId,
          description: li.description,
          amountCents: Math.round(Number(li.amount) * 100),
        })),
      }),
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  if (!invoice) return null;
  const editable = canEdit && invoice.status === "PENDING";

  return (
    <div className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-ink/40 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="z-modal w-full max-w-lg rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_24px_60px_rgba(0,69,58,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-emerald">Invoice</div>
            <h3 className="mt-1 text-lg font-bold text-ink">{invoice.number}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink/50 hover:bg-mint/60"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 text-sm text-ink/80">
          <span className="font-semibold text-ink">Bill To: </span>
          {invoice.organization?.name ?? "—"}
        </div>

        <div className="mt-5 space-y-2">
          {lineItems.map((li, i) => (
            <div key={li.caseId} className="flex items-center gap-2 rounded-xl border-2 border-pine/15 bg-cream p-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-pine">{li.caseNumber}</div>
                {editing ? (
                  <TextInput
                    value={li.description}
                    onChange={(e) =>
                      setLineItems((prev) => prev.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))
                    }
                    className="mt-1 h-8 text-xs"
                  />
                ) : (
                  <div className="truncate text-sm text-ink/75">{li.description}</div>
                )}
              </div>
              {editing ? (
                <TextInput
                  type="number"
                  min="1"
                  step="0.01"
                  value={li.amount}
                  onChange={(e) =>
                    setLineItems((prev) => prev.map((x, idx) => (idx === i ? { ...x, amount: e.target.value } : x)))
                  }
                  className="h-8 w-24 text-right text-xs"
                />
              ) : (
                <div className="shrink-0 font-semibold text-pine">{formatAmount(Number(li.amount) * 100)}</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border-2 border-pine/20 bg-cream p-4">
          <div>
            <div className="text-3xl font-bold text-pine">{formatAmount(editing ? total : invoice.amountCents)}</div>
            <div className="mt-1 text-xs text-ink/60">
              {invoice.paidAt && `Paid ${new Date(invoice.paidAt).toLocaleDateString()}`}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink/60">Due date</label>
            {editing ? (
              <TextInput type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="w-40" />
            ) : (
              <div className="text-sm text-ink">{new Date(invoice.dueAt).toLocaleDateString()}</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => downloadInvoicePdf(invoice)}>
              <Download size={14} /> PDF
            </Button>
            <Button variant="secondary" onClick={() => downloadInvoiceExcel(invoice)}>
              <FileSpreadsheet size={14} /> Excel
            </Button>
          </div>
          <div className="flex gap-2">
            {editable && !editing && (
              <Button variant="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
            {editing && (
              <>
                <Button variant="secondary" onClick={() => setEditing(false)} disabled={mutation.isPending}>
                  Cancel
                </Button>
                <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving…" : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
