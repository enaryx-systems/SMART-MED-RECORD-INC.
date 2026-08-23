"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvoice,
  deleteInvoice,
  fetchInvoiceCaseOptions,
  fetchInvoices,
  fetchOrganizationOptions,
  markInvoicePaid,
} from "@/lib/api/client";
import { Dropdown } from "@/components/portal/dropdown";
import { Button } from "@/components/portal/button";
import { TextInput } from "@/components/portal/text-input";
import { InvoiceTable } from "@/components/portal/invoice-table";
import { InvoiceDetailModal } from "@/components/portal/invoice-detail-modal";
import { ConfirmModal } from "@/components/portal/confirm-modal";
import { STATUS_LABEL, type Invoice, type SortDir } from "@/lib/types/portal";
import { useAppSelector } from "@/redux/hooks";

const PAGE_SIZE = 15;

type Mode = "single" | "consolidated";

function defaultDescription(caseNumber: string) {
  return `Medical records review — ${caseNumber}`;
}

function InvoiceCreateForm({ onCreated }: { onCreated: () => void }) {
  const [mode, setMode] = useState<Mode>("single");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState("");

  // single-case mode
  const [singleCaseId, setSingleCaseId] = useState("");
  const [singleDescription, setSingleDescription] = useState("");
  const [singleAmount, setSingleAmount] = useState("");

  // consolidated mode
  const [consolidatedOrgId, setConsolidatedOrgId] = useState("");
  const [selected, setSelected] = useState<Record<string, { description: string; amount: string }>>({});

  const { data: allCaseOptions } = useQuery({
    queryKey: ["invoice-case-options", "all"],
    queryFn: () => fetchInvoiceCaseOptions(),
    enabled: mode === "single",
  });
  const { data: orgOptions } = useQuery({ queryKey: ["organization-options"], queryFn: fetchOrganizationOptions });
  const { data: orgCaseOptions } = useQuery({
    queryKey: ["invoice-case-options", consolidatedOrgId],
    queryFn: () => fetchInvoiceCaseOptions(consolidatedOrgId),
    enabled: mode === "consolidated" && !!consolidatedOrgId,
  });

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      setSingleCaseId("");
      setSingleDescription("");
      setSingleAmount("");
      setConsolidatedOrgId("");
      setSelected({});
      setDueAt("");
      setError("");
      onCreated();
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : "Could not issue invoice."),
  });

  function toggleCase(caseId: string, caseNumber: string) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[caseId]) delete next[caseId];
      else next[caseId] = { description: defaultDescription(caseNumber), amount: "" };
      return next;
    });
  }

  function submitSingle() {
    setError("");
    const chosen = allCaseOptions?.find((c) => c.id === singleCaseId);
    if (!chosen || !singleAmount || !dueAt) {
      setError("Choose a case, amount, and due date.");
      return;
    }
    createMutation.mutate({
      organizationId: chosen.organization.id,
      dueAt,
      lineItems: [
        {
          caseId: singleCaseId,
          description: singleDescription || defaultDescription(chosen.caseNumber),
          amountCents: Math.round(Number(singleAmount) * 100),
        },
      ],
    });
  }

  function submitConsolidated() {
    setError("");
    const entries = Object.entries(selected);
    if (!consolidatedOrgId || entries.length === 0 || !dueAt) {
      setError("Choose an organization, at least one case, and a due date.");
      return;
    }
    if (entries.some(([, v]) => !v.amount)) {
      setError("Enter an amount for every selected case.");
      return;
    }
    createMutation.mutate({
      organizationId: consolidatedOrgId,
      dueAt,
      lineItems: entries.map(([caseId, v]) => ({
        caseId,
        description: v.description,
        amountCents: Math.round(Number(v.amount) * 100),
      })),
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border-[1.5px] border-pine/30 bg-white p-5 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors duration-fast ${
            mode === "single" ? "bg-emerald text-white" : "bg-mint/50 text-pine hover:bg-mint"
          }`}
        >
          Single case
        </button>
        <button
          type="button"
          onClick={() => setMode("consolidated")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors duration-fast ${
            mode === "consolidated" ? "bg-emerald text-white" : "bg-mint/50 text-pine hover:bg-mint"
          }`}
        >
          Consolidated (organization)
        </button>
      </div>

      {mode === "single" ? (
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            submitSingle();
          }}
        >
          <div className="min-w-[240px]">
            <label className="mb-1.5 block text-xs font-semibold text-ink/60">Case</label>
            <Dropdown
              value={singleCaseId}
              onChange={setSingleCaseId}
              options={(allCaseOptions ?? []).map((c) => ({
                value: c.id,
                label: `${c.caseNumber} — ${c.organization.name} (${STATUS_LABEL[c.status]})`,
              }))}
              placeholder="Choose a case"
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-ink/60">Description</label>
            <TextInput
              value={singleDescription}
              onChange={(e) => setSingleDescription(e.target.value)}
              placeholder="Medical records review services"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink/60">Amount (USD)</label>
            <TextInput
              type="number"
              min="1"
              step="0.01"
              value={singleAmount}
              onChange={(e) => setSingleAmount(e.target.value)}
              className="w-28"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink/60">Due date</label>
            <TextInput type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Issuing…" : "Issue invoice"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px]">
              <label className="mb-1.5 block text-xs font-semibold text-ink/60">Organization</label>
              <Dropdown
                value={consolidatedOrgId}
                onChange={(v) => {
                  setConsolidatedOrgId(v);
                  setSelected({});
                }}
                options={(orgOptions ?? []).map((o) => ({ value: o.id, label: o.name }))}
                placeholder="Choose organization"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink/60">Due date</label>
              <TextInput type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>
          </div>

          {consolidatedOrgId && (
            <div className="space-y-2">
              {(orgCaseOptions ?? []).length === 0 && (
                <p className="text-sm text-ink/50">This organization has no un-invoiced cases.</p>
              )}
              {orgCaseOptions?.map((c) => {
                const isSelected = !!selected[c.id];
                return (
                  <div
                    key={c.id}
                    className={`flex flex-wrap items-center gap-3 rounded-xl border-2 p-3 ${
                      isSelected ? "border-emerald bg-mint/30" : "border-pine/15 bg-cream"
                    }`}
                  >
                    <label className="flex min-w-[160px] items-center gap-2 text-sm font-semibold text-pine">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCase(c.id, c.caseNumber)}
                        className="h-4 w-4 rounded border-2 border-pine/40 accent-emerald"
                      />
                      {c.caseNumber}
                    </label>
                    {isSelected && (
                      <>
                        <TextInput
                          value={selected[c.id].description}
                          onChange={(e) =>
                            setSelected((prev) => ({ ...prev, [c.id]: { ...prev[c.id], description: e.target.value } }))
                          }
                          className="min-w-[200px] flex-1"
                        />
                        <TextInput
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="Amount"
                          value={selected[c.id].amount}
                          onChange={(e) =>
                            setSelected((prev) => ({ ...prev, [c.id]: { ...prev[c.id], amount: e.target.value } }))
                          }
                          className="w-28"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Button onClick={submitConsolidated} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Issuing…" : `Issue consolidated invoice${Object.keys(selected).length ? ` (${Object.keys(selected).length} cases)` : ""}`}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function InvoiceManager() {
  const organizationId = useAppSelector((state) => state.orgFilter.organizationId);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [viewingEdit, setViewingEdit] = useState(false);
  const [deleting, setDeleting] = useState<Invoice | null>(null);
  const [markingId, setMarkingId] = useState<string | undefined>();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["invoice-case-options"] });
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices", "manage", page, sortBy, sortDir, organizationId],
    queryFn: () =>
      fetchInvoices({
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDir,
        organizationId: organizationId ?? undefined,
      }),
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => {
      setMarkingId(id);
      return markInvoicePaid(id);
    },
    onSuccess: () => {
      setMarkingId(undefined);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      setDeleting(null);
      invalidate();
    },
  });

  function onSortChange(column: string) {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("desc");
    }
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <InvoiceCreateForm onCreated={invalidate} />

      {isError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Could not load invoices.</p>
      )}

      <InvoiceTable
        invoices={data?.data ?? []}
        showCase
        canManage
        isLoading={isLoading}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={onSortChange}
        onView={(invoice, startEditing) => {
          setViewing(invoice);
          setViewingEdit(!!startEditing);
        }}
        onMarkPaid={(id) => payMutation.mutate(id)}
        markingId={markingId}
        onDelete={(invoice) => setDeleting(invoice)}
      />

      <InvoiceDetailModal
        invoice={viewing}
        canEdit
        initialEditing={viewingEdit}
        onClose={() => setViewing(null)}
      />

      <ConfirmModal
        open={!!deleting}
        title="Delete invoice?"
        description={`This permanently removes invoice ${deleting?.number} (${deleting?.lineItems.length ?? 0} case${deleting && deleting.lineItems.length > 1 ? "s" : ""}). This cannot be undone.`}
        confirmLabel="Delete"
        danger
        pending={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
