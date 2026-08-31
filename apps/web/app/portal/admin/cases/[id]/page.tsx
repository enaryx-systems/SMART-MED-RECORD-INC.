"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignCase,
  createInvoice,
  deleteInvoice,
  fetchCase,
  fetchInvoices,
  fetchReviewers,
  markInvoicePaid,
  updateCaseStatus,
} from "@/lib/api/client";
import { PageHeader } from "@/components/portal/page-header";
import { CaseOverview } from "@/components/portal/case-overview";
import { CaseProgressCard } from "@/components/portal/case-progress-card";
import { DocumentList } from "@/components/portal/document-list";
import { CaseTimeline } from "@/components/portal/case-timeline";
import { InvoiceTable } from "@/components/portal/invoice-table";
import { InvoiceDetailModal } from "@/components/portal/invoice-detail-modal";
import { ConfirmModal } from "@/components/portal/confirm-modal";
import { Button } from "@/components/portal/button";
import { Dropdown } from "@/components/portal/dropdown";
import { TextInput } from "@/components/portal/text-input";
import { CASE_STATUSES, STATUS_LABEL, type CaseStatus, type Invoice } from "@/lib/types/portal";

export default function AdminCaseDetailPage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [invoicePage, setInvoicePage] = useState(1);
  const [markingId, setMarkingId] = useState<string | undefined>();
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [viewingEdit, setViewingEdit] = useState(false);
  const [deleting, setDeleting] = useState<Invoice | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => fetchCase(caseId),
  });
  const { data: reviewers } = useQuery({ queryKey: ["reviewers"], queryFn: fetchReviewers });
  const { data: invoices } = useQuery({
    queryKey: ["invoices", "case", caseId, invoicePage],
    queryFn: () => fetchInvoices({ caseId, page: invoicePage, pageSize: 15 }),
  });

  function invalidateCase() {
    queryClient.invalidateQueries({ queryKey: ["case", caseId] });
    queryClient.invalidateQueries({ queryKey: ["case-events", caseId] });
    queryClient.invalidateQueries({ queryKey: ["cases"] });
  }

  function invalidateInvoices() {
    queryClient.invalidateQueries({ queryKey: ["invoices", "case", caseId] });
    queryClient.invalidateQueries({ queryKey: ["case-events", caseId] });
  }

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateCaseStatus(caseId, status as CaseStatus),
    onSuccess: invalidateCase,
  });

  const assignMutation = useMutation({
    mutationFn: (reviewerId: string) => assignCase(caseId, reviewerId || null),
    onSuccess: invalidateCase,
  });

  const invoiceMutation = useMutation({
    mutationFn: () =>
      createInvoice({
        organizationId: data!.organizationId,
        dueAt,
        lineItems: [
          {
            caseId,
            description: description || `Medical records review — ${data!.caseNumber}`,
            amountCents: Math.round(Number(amount) * 100),
          },
        ],
      }),
    onSuccess: () => {
      setDescription("");
      setAmount("");
      setDueAt("");
      invalidateInvoices();
    },
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => {
      setMarkingId(id);
      return markInvoicePaid(id);
    },
    onSuccess: () => {
      setMarkingId(undefined);
      invalidateInvoices();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      setDeleting(null);
      invalidateInvoices();
    },
  });

  if (isLoading) return <p className="text-sm text-ink/50">Loading case…</p>;
  if (isError || !data) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        Could not load this case.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Case workspace"
        description="Full control over status, assignment, and delivery."
      />
      <CaseOverview data={data} showOrganization showAssignee />
      <CaseProgressCard status={data.status} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald">Status</h3>
          <Dropdown
            value={data.status}
            onChange={(v) => statusMutation.mutate(v)}
            options={CASE_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
          />
        </div>
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald">
            Assigned reviewer
          </h3>
          <Dropdown
            value={data.assignedReviewerId ?? ""}
            onChange={(v) => assignMutation.mutate(v)}
            options={[
              { value: "", label: "Unassigned" },
              ...(reviewers ?? []).map((r) => ({ value: r.id, label: r.name })),
            ]}
          />
        </div>
      </div>

      <DocumentList caseId={caseId} canUpload uploadLabel="Upload reviewed deliverable" />

      <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
        <h3 className="mb-4 text-lg font-bold text-pine">Invoices</h3>
        {invoices && invoices.total > 0 ? (
          <p className="mb-5 text-xs text-ink/50">
            This case already has an invoice — a case can only be billed once. Manage the amount
            below, or issue additional cases on a consolidated invoice from the Billing page.
          </p>
        ) : (
          <form
            className="mb-5 flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!amount || !dueAt) return;
              invoiceMutation.mutate();
            }}
          >
            <div className="min-w-[200px] flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-ink/60">Description</label>
              <TextInput
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Medical records review services"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink/60">Amount (USD)</label>
              <TextInput
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-28"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink/60">Due date</label>
              <TextInput type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>
            <Button type="submit" disabled={invoiceMutation.isPending}>
              {invoiceMutation.isPending ? "Issuing…" : "Issue invoice"}
            </Button>
          </form>
        )}
        <InvoiceTable
          invoices={invoices?.data ?? []}
          canManage
          page={invoices?.page ?? invoicePage}
          pageSize={invoices?.pageSize ?? 15}
          total={invoices?.total ?? 0}
          onPageChange={setInvoicePage}
          onView={(invoice, startEditing) => {
            setViewing(invoice);
            setViewingEdit(!!startEditing);
          }}
          onMarkPaid={(id) => payMutation.mutate(id)}
          markingId={markingId}
          onDelete={(invoice) => setDeleting(invoice)}
        />
      </div>

      <CaseTimeline caseId={caseId} />

      <InvoiceDetailModal
        invoice={viewing}
        canEdit
        initialEditing={viewingEdit}
        onClose={() => setViewing(null)}
      />
      <ConfirmModal
        open={!!deleting}
        title="Delete invoice?"
        description={`This permanently removes invoice ${deleting?.number}. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        pending={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
