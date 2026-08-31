"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCaseStats } from "@/lib/api/client";
import { CASE_STATUSES, STATUS_COLOR, STATUS_LABEL } from "@/lib/types/portal";
import { DonutChart } from "@/components/portal/donut-chart";
import { StatCard } from "@/components/portal/stat-card";
import { PageHeader } from "@/components/portal/page-header";
import { OrganizationFilter } from "@/components/portal/organization-filter";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useAppSelector } from "@/redux/hooks";

export default function ReviewerDashboardPage() {
  const { user } = useCurrentUser();
  const organizationId = useAppSelector((state) => state.orgFilter.organizationId);
  const { data, isError } = useQuery({
    queryKey: ["case-stats", organizationId],
    queryFn: () => fetchCaseStats(organizationId ?? undefined),
  });

  const slices = CASE_STATUSES.map((status) => ({
    label: STATUS_LABEL[status],
    value: data?.counts[status] ?? 0,
    color: STATUS_COLOR[status],
  }));

  const active =
    (data?.counts.IN_PROGRESS ?? 0) + (data?.counts.NEW ?? 0) + (data?.counts.ON_HOLD ?? 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="My queue"
        description={`Welcome${user ? `, ${user.name.split(" ")[0]}` : ""}. Cases assigned to you.`}
        actions={<OrganizationFilter />}
      />

      {isError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load case statistics. Confirm the API is running.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Assigned to me" value={data?.total ?? 0} color="#00453A" />
        <StatCard label="In progress" value={active} color="#00856F" />
        <StatCard label="Awaiting delivery" value={data?.counts.AWAITING_DELIVERY ?? 0} color="#4FB39E" />
        <StatCard label="Delivered" value={data?.counts.DELIVERED ?? 0} color="#8A6425" />
      </div>

      <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
        <h3 className="mb-6 text-lg font-bold text-pine">Status distribution</h3>
        <DonutChart slices={slices} />
      </div>
    </div>
  );
}
