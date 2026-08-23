"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInvoices } from "@/lib/api/client";
import { PageHeader } from "@/components/portal/page-header";
import { InvoiceTable } from "@/components/portal/invoice-table";
import { InvoiceDetailModal } from "@/components/portal/invoice-detail-modal";
import type { Invoice, SortDir } from "@/lib/types/portal";

const PAGE_SIZE = 15;

export default function ClientBillingPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewing, setViewing] = useState<Invoice | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices", "mine", page, sortBy, sortDir],
    queryFn: () => fetchInvoices({ page, pageSize: PAGE_SIZE, sortBy, sortDir }),
  });

  function onSortChange(column: string) {
    if (sortBy === column) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortDir("desc");
    }
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Invoices issued for your organization's cases." />
      {isError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load invoices. Confirm the API is running.
        </p>
      )}
      <InvoiceTable
        invoices={data?.data ?? []}
        showCase
        isLoading={isLoading}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={onSortChange}
        onView={(invoice) => setViewing(invoice)}
      />
      <InvoiceDetailModal invoice={viewing} canEdit={false} onClose={() => setViewing(null)} />
    </div>
  );
}
