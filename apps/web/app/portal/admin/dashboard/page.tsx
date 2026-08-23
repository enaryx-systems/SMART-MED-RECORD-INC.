"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCaseStats, fetchInvoiceSummary, fetchOrganizationOptions } from "@/lib/api/client";
import { CASE_STATUSES, STATUS_COLOR, STATUS_LABEL } from "@/lib/types/portal";
import { DonutChart } from "@/components/portal/donut-chart";
import { BarChart } from "@/components/portal/bar-chart";
import { StatCard } from "@/components/portal/stat-card";
import { PageHeader } from "@/components/portal/page-header";
import { OrganizationFilter } from "@/components/portal/organization-filter";
import { useAppSelector } from "@/redux/hooks";
import { getColorForKey } from "@/lib/utils/entity-color";

function formatAmount(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function AdminDashboardPage() {
  const organizationId = useAppSelector((state) => state.orgFilter.organizationId);

  const { data: stats, isError } = useQuery({
    queryKey: ["case-stats", organizationId],
    queryFn: () => fetchCaseStats(organizationId ?? undefined),
  });
  const { data: orgOptions } = useQuery({ queryKey: ["organization-options"], queryFn: fetchOrganizationOptions });
  const { data: invoiceSummary } = useQuery({
    queryKey: ["invoices", "summary", organizationId],
    queryFn: () => fetchInvoiceSummary(organizationId ?? undefined),
  });

  const statusSlices = CASE_STATUSES.map((status) => ({
    label: STATUS_LABEL[status],
    value: stats?.counts[status] ?? 0,
    color: STATUS_COLOR[status],
  }));

  const orgSlices = (stats?.byOrganization ?? []).map((row) => ({
    label: row.organizationName,
    value: row.count,
    color: getColorForKey(row.organizationId),
  }));

  const reviewerBars = (stats?.byReviewer ?? []).map((row) => ({
    label: row.reviewerName,
    value: row.count,
    color: getColorForKey(row.reviewerId),
  }));

  const unassigned =
    (stats?.total ?? 0) -
    (stats?.byReviewer.reduce((sum, r) => sum + r.count, 0) ?? 0) -
    (stats?.counts.DRAFT ?? 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin dashboard"
        description="Every organization, every case, one view."
        actions={<OrganizationFilter />}
      />

      {isError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load case statistics. Confirm the API is running.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total cases" value={stats?.total ?? 0} color="#00453A" />
        <StatCard label="Organizations" value={orgOptions?.length ?? 0} color="#00856F" />
        <StatCard label="Needs assignment" value={Math.max(0, unassigned)} color="#B78A3D" />
        <StatCard label="Delivered" value={stats?.counts.DELIVERED ?? 0} color="#8A6425" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <div className="text-sm font-semibold text-ink/75">Outstanding</div>
          <div className="mt-3 text-3xl font-bold text-gold">
            {formatAmount(invoiceSummary?.outstandingCents ?? 0)}
          </div>
        </div>
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <div className="text-sm font-semibold text-ink/75">Collected</div>
          <div className="mt-3 text-3xl font-bold text-emerald">
            {formatAmount(invoiceSummary?.paidCents ?? 0)}
          </div>
        </div>
        <StatCard label="Pending invoices" value={invoiceSummary?.pendingCount ?? 0} color="#B78A3D" />
        <StatCard label="Paid invoices" value={invoiceSummary?.paidCount ?? 0} color="#00856F" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <h3 className="mb-6 text-lg font-bold text-pine">Status distribution</h3>
          <DonutChart slices={statusSlices} />
        </div>
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <h3 className="mb-6 text-lg font-bold text-pine">Cases by status</h3>
          <BarChart bars={statusSlices} />
        </div>
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <h3 className="mb-6 text-lg font-bold text-pine">Cases by organization</h3>
          {orgSlices.length > 0 ? <DonutChart slices={orgSlices} /> : <p className="text-sm text-ink/50">No data yet.</p>}
        </div>
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <h3 className="mb-6 text-lg font-bold text-pine">Reviewer workload</h3>
          {reviewerBars.length > 0 ? <BarChart bars={reviewerBars} /> : <p className="text-sm text-ink/50">No cases assigned yet.</p>}
        </div>
      </div>
    </div>
  );
}
