"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, User, X } from "lucide-react";
import { fetchCases, fetchOrganization, fetchReviewers } from "@/lib/api/client";
import { PageHeader } from "@/components/portal/page-header";
import { RoleBadge } from "@/components/portal/role-badge";
import { UserCell } from "@/components/portal/user-cell";
import { StatusPill } from "@/components/portal/status-pill";
import { ColorPill } from "@/components/portal/color-pill";
import { ReviewerBadge } from "@/components/portal/reviewer-badge";
import { DataTable, type DataTableColumn } from "@/components/portal/data-table";
import { CaseFilterPanel, type CaseFilterState } from "@/components/portal/case-filter-panel";
import { DownloadMenu, type DownloadFormat } from "@/components/portal/download-menu";
import { downloadCasesCsv, downloadCasesExcel, printCasesPdf } from "@/lib/utils/case-export";
import { getCreatedRange, getMonthRange, pastMonthsWithData } from "@/lib/utils/date-range";
import { CASE_TYPE_LABEL, type Case, type SortDir } from "@/lib/types/portal";

const PAGE_SIZE = 15;

const EMPTY_FILTERS: CaseFilterState = {
  statuses: [],
  caseTypes: [],
  ownerIds: [],
  reviewerIds: [],
  createdRange: "",
  createdMonth: null,
};

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function runExport(format: DownloadFormat, cases: Case[], title: string) {
  if (cases.length === 0) return;
  if (format === "csv") downloadCasesCsv(cases, `${title}.csv`);
  else if (format === "excel") downloadCasesExcel(cases, `${title}.xlsx`);
  else printCasesPdf(cases, title);
}

export default function AdminOrganizationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput, 300);
  const [filters, setFilters] = useState<CaseFilterState>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<Map<string, Case>>(new Map());

  useEffect(() => setPage(1), [search, filters]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["organization", params.id],
    queryFn: () => fetchOrganization(params.id),
  });
  const { data: reviewers } = useQuery({ queryKey: ["reviewers"], queryFn: fetchReviewers });

  const clientOptions = (data?.users ?? [])
    .filter((u) => u.role === "CLIENT")
    .map((u) => ({ value: u.id, label: u.name }));
  const reviewerOptions = (reviewers ?? []).map((r) => ({ value: r.id, label: r.name }));
  const monthOptions = pastMonthsWithData((data?.cases ?? []).map((c) => c.createdAt));

  const { from: createdFrom, to: createdTo } = filters.createdMonth
    ? getMonthRange(filters.createdMonth)
    : getCreatedRange(filters.createdRange);

  const { data: casesPage, isLoading: casesLoading } = useQuery({
    queryKey: ["cases", "for-org", params.id, page, sortBy, sortDir, filters, search],
    queryFn: () =>
      fetchCases({
        organizationId: params.id,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDir,
        status: filters.statuses.length ? filters.statuses : undefined,
        caseType: filters.caseTypes.length ? filters.caseTypes : undefined,
        ownerId: filters.ownerIds.length ? filters.ownerIds : undefined,
        reviewerId: filters.reviewerIds.length ? filters.reviewerIds : undefined,
        createdFrom,
        createdTo,
        search: search || undefined,
      }),
    enabled: !!params.id,
  });

  const rows = casesPage?.data ?? [];
  const selectedIds = useMemo(() => new Set(selected.keys()), [selected]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else {
        const row = rows.find((r) => r.id === id);
        if (row) next.set(id, row);
      }
      return next;
    });
  }

  function toggleAllOnPage() {
    const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
    setSelected((prev) => {
      const next = new Map(prev);
      if (allSelected) rows.forEach((r) => next.delete(r.id));
      else rows.forEach((r) => next.set(r.id, r));
      return next;
    });
  }

  function onSortChange(column: string) {
    if (sortBy === column) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortDir("desc");
    }
    setPage(1);
  }

  if (isLoading) return <p className="text-sm text-ink/50">Loading organization…</p>;
  if (isError || !data) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        Could not load this organization.
      </p>
    );
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
      key: "client",
      header: "Client",
      render: (c) =>
        c.owner ? <ColorPill colorKey={c.owner.email} label={c.owner.name} icon={User} /> : "—",
    },
    {
      key: "reviewer",
      header: "Reviewer",
      render: (c) => (
        <ReviewerBadge id={c.assignedReviewerId} name={c.assignedReviewer?.name ?? "Unassigned"} />
      ),
    },
    { key: "caseType", header: "Case Type", render: (c) => CASE_TYPE_LABEL[c.caseType] },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (c) => <StatusPill status={c.status} />,
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
      <PageHeader
        title={data.name}
        description="This firm's users and cases, kept separate from every other organization."
      />

      <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
        <h3 className="mb-4 text-lg font-bold text-pine">Users</h3>
        {data.users && data.users.length > 0 ? (
          <ul className="divide-y divide-mint">
            {data.users.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-3">
                <UserCell name={u.name} subtitle={u.email} />
                <RoleBadge role={u.role} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/50">No users yet.</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-pine">Cases</h3>
          <DownloadMenu
            disabled={rows.length === 0}
            onSelect={async (format) => {
              const full = await fetchCases({
                organizationId: params.id,
                page: 1,
                pageSize: 1000,
                sortBy,
                sortDir,
                status: filters.statuses.length ? filters.statuses : undefined,
                caseType: filters.caseTypes.length ? filters.caseTypes : undefined,
                ownerId: filters.ownerIds.length ? filters.ownerIds : undefined,
                reviewerId: filters.reviewerIds.length ? filters.reviewerIds : undefined,
                createdFrom,
                createdTo,
                search: search || undefined,
              });
              runExport(format, full.data, data.name);
            }}
          />
        </div>

        <div className="flex min-w-[260px] items-center gap-1 rounded-lg border-2 border-pine/25 bg-white pl-3 pr-1.5">
          <Search size={16} className="shrink-0 text-ink/40" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search case # or matter…"
            className="h-10 flex-1 bg-transparent px-2 text-sm text-ink outline-none placeholder:text-ink/40"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="shrink-0 rounded p-1 text-ink/40 transition-colors duration-fast hover:text-ink"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <CaseFilterPanel
            clientOptions={clientOptions}
            reviewerOptions={reviewerOptions}
            monthOptions={monthOptions}
            value={filters}
            onApply={setFilters}
          />
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-[1.5px] border-emerald/30 bg-mint/30 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-emerald">
                {selected.size} case{selected.size === 1 ? "" : "s"} selected
              </span>
              <DownloadMenu
                label="Export selected"
                onSelect={(format) => runExport(format, Array.from(selected.values()), data.name)}
              />
            </div>
            <button
              type="button"
              onClick={() => setSelected(new Map())}
              className="text-sm font-semibold text-ink/60 hover:text-ink"
            >
              Deselect all
            </button>
          </div>
        )}

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          isLoading={casesLoading}
          emptyLabel="No cases yet."
          page={casesPage?.page ?? page}
          pageSize={casesPage?.pageSize ?? PAGE_SIZE}
          total={casesPage?.total ?? 0}
          onPageChange={setPage}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={onSortChange}
          onRowClick={(c) => router.push(`/portal/admin/cases/${c.id}`)}
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAllOnPage}
        />
      </div>
    </div>
  );
}
