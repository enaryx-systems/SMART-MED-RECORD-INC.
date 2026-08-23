"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInvoices, fetchInvoiceSummary } from "@/lib/api/client";
import { StatCard } from "@/components/portal/stat-card";
import { PageHeader } from "@/components/portal/page-header";
import { OrganizationFilter } from "@/components/portal/organization-filter";
import { InvoiceTable } from "@/components/portal/invoice-table";
import { InvoiceDetailModal } from "@/components/portal/invoice-detail-modal";
import { getSession } from "@/lib/auth/session";
import { useAppSelector } from "@/redux/hooks";
import { useState } from "react";
import type { Invoice } from "@/lib/types/portal";

function formatAmount(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function FinanceDashboardPage() {
  const session = getSession();
  const organizationId = useAppSelector((state) => state.orgFilter.organizationId);
  const [viewing, setViewing] = useState<Invoice | null>(null);

  const { data: summary, isError } = useQuery({
    queryKey: ["invoices", "summary", organizationId],
    queryFn: () => fetchInvoiceSummary(organizationId ?? undefined),
  });
  const { data: pending, isLoading } = useQuery({
    queryKey: ["invoices", "pending", organizationId],
    queryFn: () =>
      fetchInvoices({
        pageSize: 10,
        sortBy: "dueAt",
        sortDir: "asc",
        status: "PENDING",
        organizationId: organizationId ?? undefined,
      }),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finance dashboard"
        description={`Welcome${session ? `, ${session.user.name.split(" ")[0]}` : ""}. Invoice status across every organization.`}
        actions={<OrganizationFilter />}
      />

      {isError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Could not load invoices.</p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <div className="text-sm font-semibold text-ink/75">Outstanding</div>
          <div className="mt-3 text-3xl font-bold text-gold">{formatAmount(summary?.outstandingCents ?? 0)}</div>
        </div>
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <div className="text-sm font-semibold text-ink/75">Collected</div>
          <div className="mt-3 text-3xl font-bold text-emerald">{formatAmount(summary?.paidCents ?? 0)}</div>
        </div>
        <StatCard label="Pending invoices" value={summary?.pendingCount ?? 0} color="#B78A3D" />
        <StatCard label="Paid invoices" value={summary?.paidCount ?? 0} color="#00856F" />
      </div>

      <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
        <h3 className="mb-4 text-lg font-bold text-pine">Pending invoices</h3>
        <p className="-mt-3 mb-4 text-xs text-ink/50">Not yet paid, soonest due first — paid invoices aren&rsquo;t shown here.</p>
        <InvoiceTable
          invoices={pending?.data ?? []}
          showCase
          isLoading={isLoading}
          page={1}
          pageSize={pending?.pageSize ?? 10}
          total={pending?.data.length ?? 0}
          onPageChange={() => {}}
          onView={(invoice) => setViewing(invoice)}
        />
      </div>

      <InvoiceDetailModal invoice={viewing} canEdit={false} onClose={() => setViewing(null)} />
    </div>
  );
}
