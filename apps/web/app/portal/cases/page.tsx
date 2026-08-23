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
import { DataTable, type DataTableColumn } from "@/components/portal/data-table";
import { StatusPill } from "@/components/portal/status-pill";
import { StatusFilterCards } from "@/components/portal/status-filter-cards";
import { Dropdown } from "@/components/portal/dropdown";
import { DueBadge } from "@/components/portal/due-badge";

const PAGE_SIZE = 15;

const CASE_TYPE_OPTIONS = (Object.keys(CASE_TYPE_LABEL) as CaseType[]).map((t) => ({
  value: t,
  label: CASE_TYPE_LABEL[t],
}));

function CasesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as CaseStatus | null) ?? undefined;
  const [caseType, setCaseType] = useState<CaseType | "">("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cases", status ?? "all", caseType, page, sortBy, sortDir],
    queryFn: () =>
      fetchCases({ status, caseType: caseType || undefined, page, pageSize: PAGE_SIZE, sortBy, sortDir }),
  });

  const { data: stats } = useQuery({
    queryKey: ["case-stats"],
    queryFn: () => fetchCaseStats(),
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
    { key: "caseType", header: "Case Type", render: (c) => CASE_TYPE_LABEL[c.caseType] },
    {
      key: "services",
      header: "Services",
      render: (c) =>
        c.servicesDesired.length > 0
          ? `${c.servicesDesired.length} service${c.servicesDesired.length > 1 ? "s" : ""}`
          : "—",
    },
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
    { key: "createdAt", header: "Created", sortable: true, render: (c) => new Date(c.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases"
        description="Browse and filter every case by its current status."
      />

      <StatusFilterCards baseHref="/portal/cases" status={status} stats={stats} />

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
        emptyLabel="No cases found."
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={onSortChange}
        onRowClick={(c) =>
          router.push(c.status === "DRAFT" ? `/portal/records/new?caseId=${c.id}` : `/portal/cases/${c.id}`)
        }
      />
    </div>
  );
}

export default function PortalCasesPage() {
  return (
    <Suspense fallback={<p className="text-ink/50">Loading…</p>}>
      <CasesTable />
    </Suspense>
  );
}
