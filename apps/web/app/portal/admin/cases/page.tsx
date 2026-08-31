"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCases,
  fetchCaseStats,
  fetchOrganizationOptions,
  fetchReviewers,
} from "@/lib/api/client";
import {
  CASE_TYPE_LABEL,
  type Case,
  type CaseStatus,
  type CaseType,
  type SortDir,
} from "@/lib/types/portal";
import { PageHeader } from "@/components/portal/page-header";
import { DataTable, type DataTableColumn } from "@/components/portal/data-table";
import { StatusPill } from "@/components/portal/status-pill";
import { StatusFilterCards } from "@/components/portal/status-filter-cards";
import { SearchFilterBar, type FilterColumn } from "@/components/portal/search-filter-bar";
import { OrgBadge } from "@/components/portal/org-badge";
import { ReviewerBadge } from "@/components/portal/reviewer-badge";
import { DueBadge } from "@/components/portal/due-badge";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setOrganizationFilter } from "@/redux/orgFilterSlice";
import {
  CREATED_RANGE_OPTIONS,
  getCreatedRange,
  type CreatedRangePreset,
} from "@/lib/utils/date-range";

const PAGE_SIZE = 15;

const CASE_TYPE_OPTIONS = (Object.keys(CASE_TYPE_LABEL) as CaseType[]).map((t) => ({
  value: t,
  label: CASE_TYPE_LABEL[t],
}));

function AdminCasesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as CaseStatus | null) ?? undefined;
  const dispatch = useAppDispatch();
  const organizationId = useAppSelector((state) => state.orgFilter.organizationId);
  const [caseType, setCaseType] = useState<CaseType | "">("");
  const [reviewerId, setReviewerId] = useState("");
  const [createdRange, setCreatedRange] = useState<CreatedRangePreset>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { from: createdFrom, to: createdTo } = getCreatedRange(createdRange);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "cases",
      status ?? "all",
      caseType,
      reviewerId,
      createdRange,
      debouncedSearch,
      page,
      sortBy,
      sortDir,
      organizationId,
    ],
    queryFn: () =>
      fetchCases({
        status,
        caseType: caseType || undefined,
        reviewerId: reviewerId || undefined,
        createdFrom,
        createdTo,
        search: debouncedSearch || undefined,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDir,
        organizationId: organizationId ?? undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ["case-stats", organizationId],
    queryFn: () => fetchCaseStats(organizationId ?? undefined),
  });
  const { data: orgOptions } = useQuery({
    queryKey: ["organization-options"],
    queryFn: fetchOrganizationOptions,
  });
  const { data: reviewers } = useQuery({ queryKey: ["reviewers"], queryFn: fetchReviewers });

  function onSortChange(column: string) {
    if (sortBy === column) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortDir("desc");
    }
    setPage(1);
  }

  const columns: DataTableColumn<Case>[] = [
    {
      key: "caseNumber",
      header: "Case #",
      sortable: true,
      render: (c) => <span className="font-semibold text-pine">{c.caseNumber}</span>,
    },
    { key: "matterName", header: "Matter", sortable: true, render: (c) => c.matterName },
    {
      key: "organization",
      header: "Organization",
      render: (c) =>
        c.organization && <OrgBadge id={c.organization.id} name={c.organization.name} />,
    },
    { key: "caseType", header: "Case Type", render: (c) => CASE_TYPE_LABEL[c.caseType] },
    {
      key: "reviewer",
      header: "Reviewer",
      render: (c) => (
        <ReviewerBadge id={c.assignedReviewerId} name={c.assignedReviewer?.name ?? "Unassigned"} />
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (c) => <StatusPill status={c.status} />,
    },
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
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (c) => new Date(c.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Case queue" description="Every case across every organization." />

      <StatusFilterCards baseHref="/portal/admin/cases" status={status} stats={stats} />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by case number or matter name…"
        columns={
          [
            {
              key: "organization",
              label: "Organization",
              dotColor: "#00453A",
              value: organizationId ?? "",
              onChange: (v) => {
                dispatch(setOrganizationFilter(v || null));
                setPage(1);
              },
              options: [
                { value: "", label: "All organizations" },
                ...(orgOptions ?? []).map((o) => ({ value: o.id, label: o.name })),
              ],
            },
            {
              key: "caseType",
              label: "Case type",
              dotColor: "#00856F",
              value: caseType,
              onChange: (v) => {
                setCaseType(v as CaseType | "");
                setPage(1);
              },
              options: [{ value: "", label: "All case types" }, ...CASE_TYPE_OPTIONS],
            },
            {
              key: "reviewer",
              label: "Reviewer",
              dotColor: "#b78a3d",
              value: reviewerId,
              onChange: (v) => {
                setReviewerId(v);
                setPage(1);
              },
              options: [
                { value: "", label: "All reviewers" },
                ...(reviewers ?? []).map((r) => ({ value: r.id, label: r.name })),
              ],
            },
            {
              key: "created",
              label: "Created",
              dotColor: "#384633",
              value: createdRange,
              onChange: (v) => {
                setCreatedRange(v as CreatedRangePreset);
                setPage(1);
              },
              options: CREATED_RANGE_OPTIONS,
            },
          ] satisfies FilterColumn[]
        }
      />

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
        emptyLabel="No cases found."
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={onSortChange}
        onRowClick={(c) => router.push(`/portal/admin/cases/${c.id}`)}
      />
    </div>
  );
}

export default function AdminCasesPage() {
  return (
    <Suspense fallback={<p className="text-ink/50">Loading…</p>}>
      <AdminCasesTable />
    </Suspense>
  );
}
