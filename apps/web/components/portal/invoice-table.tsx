"use client";

import { Download, Eye, FileSpreadsheet, Pencil, Trash2 } from "lucide-react";
import type { Invoice, SortDir } from "@/lib/types/portal";
import { DataTable, type DataTableColumn } from "@/components/portal/data-table";
import { downloadInvoicePdf } from "@/lib/api/client";
import { downloadInvoiceExcel } from "@/lib/utils/invoice-excel";

function formatAmount(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function caseSummary(invoice: Invoice) {
  if (invoice.lineItems.length === 1) return invoice.lineItems[0].case.caseNumber;
  return `${invoice.lineItems.length} cases`;
}

export function InvoiceTable({
  invoices,
  showCase = false,
  page,
  pageSize,
  total,
  onPageChange,
  sortBy,
  sortDir,
  onSortChange,
  onView,
  canManage = false,
  onMarkPaid,
  markingId,
  onDelete,
  isLoading = false,
}: {
  invoices: Invoice[];
  showCase?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortDir?: SortDir;
  onSortChange?: (column: string) => void;
  onView: (invoice: Invoice, startEditing?: boolean) => void;
  canManage?: boolean;
  onMarkPaid?: (id: string) => void;
  markingId?: string;
  onDelete?: (invoice: Invoice) => void;
  isLoading?: boolean;
}) {
  const columns: DataTableColumn<Invoice>[] = [
    { key: "number", header: "Invoice #", sortable: true, render: (i) => <span className="font-semibold text-pine">{i.number}</span> },
    ...(showCase
      ? [
          { key: "case", header: "Case", render: (i: Invoice) => caseSummary(i) },
          { key: "org", header: "Organization", render: (i: Invoice) => i.organization?.name ?? "—" },
        ]
      : []),
    { key: "amountCents", header: "Amount", sortable: true, render: (i) => formatAmount(i.amountCents) },
    { key: "dueAt", header: "Due", sortable: true, render: (i) => new Date(i.dueAt).toLocaleDateString() },
    { key: "status", header: "Status", sortable: true, render: (i) => <StatusPillForInvoice status={i.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={invoices}
      rowKey={(i) => i.id}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      sortBy={sortBy}
      sortDir={sortDir}
      onSortChange={onSortChange}
      isLoading={isLoading}
      emptyLabel="No invoices yet."
      renderActions={(invoice) => (
        <>
          <button
            type="button"
            onClick={() => onView(invoice)}
            className="rounded-full p-1.5 text-ink/50 transition-colors duration-fast hover:bg-mint/60 hover:text-emerald"
            aria-label="View invoice"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            onClick={() => downloadInvoicePdf(invoice)}
            className="rounded-full p-1.5 text-ink/50 transition-colors duration-fast hover:bg-mint/60 hover:text-emerald"
            aria-label="Download invoice as PDF"
            title="Download PDF"
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            onClick={() => downloadInvoiceExcel(invoice)}
            className="rounded-full p-1.5 text-ink/50 transition-colors duration-fast hover:bg-mint/60 hover:text-emerald"
            aria-label="Download invoice as Excel"
            title="Download Excel"
          >
            <FileSpreadsheet size={15} />
          </button>
          {canManage && invoice.status === "PENDING" && (
            <button
              type="button"
              onClick={() => onView(invoice, true)}
              className="rounded-full p-1.5 text-ink/50 transition-colors duration-fast hover:bg-mint/60 hover:text-emerald"
              aria-label="Edit invoice"
            >
              <Pencil size={15} />
            </button>
          )}
          {canManage && invoice.status === "PENDING" && onMarkPaid && (
            <button
              type="button"
              onClick={() => onMarkPaid(invoice.id)}
              disabled={markingId === invoice.id}
              className="rounded-lg border border-pine/30 px-2.5 py-1 text-xs font-semibold text-pine transition-colors duration-fast hover:bg-mint/60 disabled:opacity-60"
            >
              {markingId === invoice.id ? "…" : "Mark paid"}
            </button>
          )}
          {canManage && invoice.status === "PENDING" && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(invoice)}
              className="rounded-full p-1.5 text-ink/50 transition-colors duration-fast hover:bg-red-50 hover:text-red-600"
              aria-label="Delete invoice"
            >
              <Trash2 size={15} />
            </button>
          )}
        </>
      )}
    />
  );
}

function StatusPillForInvoice({ status }: { status: "PENDING" | "PAID" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${
        status === "PAID" ? "bg-mint text-emerald" : "bg-gold/15 text-gold"
      }`}
    >
      {status === "PAID" ? "Paid" : "Pending"}
    </span>
  );
}
