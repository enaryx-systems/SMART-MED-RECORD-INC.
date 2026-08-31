"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCase, fetchInvoices } from "@/lib/api/client";
import { PageHeader } from "@/components/portal/page-header";
import { CaseOverview } from "@/components/portal/case-overview";
import { CaseProgressCard } from "@/components/portal/case-progress-card";
import { DocumentList } from "@/components/portal/document-list";
import { CaseTimeline } from "@/components/portal/case-timeline";
import { InvoiceTable } from "@/components/portal/invoice-table";
import { InvoiceDetailModal } from "@/components/portal/invoice-detail-modal";
import type { Invoice } from "@/lib/types/portal";

const TERMINAL = new Set(["DELIVERED", "CANCELED"]);

export default function ClientCaseDetailPage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [invoicePage, setInvoicePage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => fetchCase(caseId),
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices", "case", caseId, invoicePage],
    queryFn: () => fetchInvoices({ caseId, page: invoicePage, pageSize: 15 }),
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
        title="Case detail"
        description="Track documents, delivery, and billing for this matter."
      />
      <CaseOverview data={data} />
      <CaseProgressCard status={data.status} />
      <DocumentList
        caseId={caseId}
        canUpload={!TERMINAL.has(data.status)}
        uploadLabel="Upload additional records"
      />
      {invoices && invoices.total > 0 && (
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <h3 className="mb-4 text-lg font-semibold text-pine">Invoices</h3>
          <InvoiceTable
            invoices={invoices.data}
            page={invoices.page}
            pageSize={invoices.pageSize}
            total={invoices.total}
            onPageChange={setInvoicePage}
            onView={(invoice) => setViewing(invoice)}
          />
        </div>
      )}
      <CaseTimeline caseId={caseId} />
      <InvoiceDetailModal invoice={viewing} canEdit={false} onClose={() => setViewing(null)} />
    </div>
  );
}
