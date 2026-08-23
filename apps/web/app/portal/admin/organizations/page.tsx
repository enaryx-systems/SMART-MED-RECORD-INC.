"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrganization, fetchOrganizations } from "@/lib/api/client";
import { PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/portal/button";
import { TextInput } from "@/components/portal/text-input";
import { DataTable, type DataTableColumn } from "@/components/portal/data-table";
import type { Organization, SortDir } from "@/lib/types/portal";

const PAGE_SIZE = 15;

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["organizations", "manage", page, sortBy, sortDir],
    queryFn: () => fetchOrganizations({ page, pageSize: PAGE_SIZE, sortBy, sortDir }),
  });

  const mutation = useMutation({
    mutationFn: (n: string) => createOrganization(n),
    onSuccess: () => {
      setName("");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : "Could not create organization."),
  });

  function onSortChange(column: string) {
    if (sortBy === column) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  }

  const columns: DataTableColumn<Organization>[] = [
    { key: "name", header: "Organization", sortable: true, render: (o) => <span className="font-semibold text-pine">{o.name}</span> },
    { key: "users", header: "Users", render: (o) => o._count?.users ?? 0 },
    { key: "cases", header: "Cases", render: (o) => o._count?.cases ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Every law firm using the portal, managed separately from every other firm's clients and cases."
      />

      <form
        className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-pine/30 bg-white p-5 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)] sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          if (name.trim().length < 2) return;
          mutation.mutate(name.trim());
        }}
      >
        <div className="flex-1">
          <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="org-name">
            New organization name
          </label>
          <TextInput
            id="org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Meridian Law Partners"
          />
        </div>
        <Button type="submit" size="md" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating…" : "Create organization"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}

      {isError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load organizations.
        </p>
      )}

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(o) => o.id}
        isLoading={isLoading}
        emptyLabel="No organizations yet."
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={onSortChange}
        onRowClick={(o) => router.push(`/portal/admin/organizations/${o.id}`)}
      />
    </div>
  );
}
