"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCaseStats } from "@/lib/api/client";
import { getSession } from "@/lib/auth/session";
import { CASE_STATUSES, STATUS_COLOR, STATUS_LABEL, type CaseStatus } from "@/lib/types/portal";
import { DonutChart } from "@/components/portal/donut-chart";
import { BarChart } from "@/components/portal/bar-chart";
import { StatCard } from "@/components/portal/stat-card";
import { StatusFilterDropdown } from "@/components/portal/status-filter-dropdown";
import { PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/portal/button";

export default function PortalDashboardPage() {
  const session = getSession();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "">("");
  const { data, isError } = useQuery({
    queryKey: ["case-stats"],
    queryFn: () => fetchCaseStats(),
  });

  const slices = CASE_STATUSES.map((status) => ({
    label: STATUS_LABEL[status],
    value: data?.counts[status] ?? 0,
    color: STATUS_COLOR[status],
  }));

  const active =
    (data?.counts.NEW ?? 0) + (data?.counts.IN_PROGRESS ?? 0) + (data?.counts.ON_HOLD ?? 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome${session ? `, ${session.user.name.split(" ")[0]}` : ""}. Here's where your cases stand today.`}
        actions={
          <>
            <StatusFilterDropdown
              value={statusFilter}
              onChange={(status) => {
                setStatusFilter(status);
                router.push(status ? `/portal/cases?status=${status}` : "/portal/cases");
              }}
            />
            <Link href="/portal/records/new">
              <Button size="md">Add New Records</Button>
            </Link>
          </>
        }
      />

      {isError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load case statistics. Confirm the API is running.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total cases" value={data?.total ?? 0} color="#00453A" />
        <StatCard label="Active" value={active} color="#00856F" />
        <StatCard label="Awaiting delivery" value={data?.counts.AWAITING_DELIVERY ?? 0} color="#4FB39E" />
        <StatCard label="Delivered" value={data?.counts.DELIVERED ?? 0} color="#8A6425" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <h3 className="mb-6 text-lg font-bold text-pine">Status distribution</h3>
          <DonutChart slices={slices} />
        </div>
        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <h3 className="mb-6 text-lg font-bold text-pine">Cases by status</h3>
          <BarChart bars={slices} />
        </div>
      </div>
    </div>
  );
}
