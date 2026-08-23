"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCases, fetchCaseStats } from "@/lib/api/client";
import {
  CASE_TYPE_LABEL,
  type Case,
  type CaseStatus,
  type CaseType,
  type SortDir,
} from "@/lib/types/portal";
import { PageHeader } from "@/components/portal/page-header";
import { OrganizationFilter } from "@/components/portal/organization-filter";
import { DataTable, type DataTableColumn } from "@/components/portal/data-table";
import { StatusPill } from "@/components/portal/status-pill";
import { StatusFilterCards } from "@/components/portal/status-filter-cards";
import { Dropdown } from "@/components/portal/dropdown";
import { OrgBadge } from "@/components/portal/org-badge";
import { DueBadge } from "@/components/portal/due-badge";
import { useAppSelector } from "@/redux/hooks";

const PAGE_SIZE = 15;

const CASE_TYPE_OPTIONS = (Object.keys(CASE_TYPE_LABEL) as CaseType[]).map((t) => ({
  value: t,
  label: CASE_TYPE_LABEL[t],
}));

function ReviewerCasesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as CaseStatus | null) ?? undefined;
  const organizationId = useAppSelector((state) => state.orgFilter.organizationId);
  const [caseType, setCaseType] = useState<CaseType | "">("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cases", "assigned", status ?? "all", caseType, page, sortBy, sortDir, organizationId],
    queryFn: () =>
      fetchCases({
        status,
        caseType: caseType || undefined,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDir,
        organizationId: organizationId ?? undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ["case-stats", "assigned", organizationId],
    queryFn: () => fetchCaseStats(organizationId ?? undefined),
  });

  function onSortChange(column: string) {
    if (sortBy === column) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortDir("desc");
    }
    setPage(1);
  }

  const columns: DataTableColumn<Case>[] = [
    { key: "caseNumber", header: "Case #", sortable: true, render: (c) => <span className="font-semibold text-pine">{c.caseNumber}</span> },
    { key: "matterName", header: "Matter", sortable: true, render: (c) => c.matterName },
    { key: "organization", header: "Organization", render: (c) => c.organization && <OrgBadge id={c.organization.id} name={c.organization.name} /> },
    { key: "caseType", header: "Case Type", render: (c) => CASE_TYPE_LABEL[c.caseType] },
    { key: "status", header: "Status", sortable: true, render: (c) => <StatusPill status={c.status} /> },
    {
      key: "dueAt",
      header: "Due",
      sortable: true,
      render: (c) => (
        <span className="flex flex-wrap items-center gap-2">
          {c.dueAt ? new Date(c.dueAt).toLocaleDateString() : "—"}
          <DueBadge dueAt={c.dueAt} status={c.status} />
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My queue"
        description="Cases assigned to you for review and delivery."
        actions={<OrganizationFilter />}
      />

      <StatusFilterCards baseHref="/portal/reviewer/cases" status={status} stats={stats} />

      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-emerald">Case type</span>
        <div className="w-56">
          <Dropdown
            value={caseType}
            onChange={(v) => {
              setCaseType(v as CaseType | "");
              setPage(1);
            }}
            options={[{ value: "", label: "All case types" }, ...CASE_TYPE_OPTIONS]}
            placeholder="All case types"
          />
        </div>
      </div>

      {isError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load cases. Confirm the API is running.
        </p>
      )}

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(c) => c.id}
        isLoading={isLoading}
        emptyLabel="No cases assigned to you yet."
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={onSortChange}
        onRowClick={(c) => router.push(`/portal/reviewer/cases/${c.id}`)}
      />
    </div>
  );
}

export default function ReviewerCasesPage() {
  return (
    <Suspense fallback={<p className="text-ink/50">Loading…</p>}>
      <ReviewerCasesTable />
    </Suspense>
  );
}
