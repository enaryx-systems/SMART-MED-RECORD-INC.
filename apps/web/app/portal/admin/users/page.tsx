"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UploadCloud, UserPlus, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteUser,
  fetchOrganizationOptions,
  fetchUsers,
  setUserStatus,
} from "@/lib/api/client";
import { PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/portal/button";
import { DataTable, type DataTableColumn } from "@/components/portal/data-table";
import { RoleBadge } from "@/components/portal/role-badge";
import { UserCell } from "@/components/portal/user-cell";
import { OrgBadge } from "@/components/portal/org-badge";
import { CreateUserModal } from "@/components/portal/create-user-modal";
import { EditUserModal } from "@/components/portal/edit-user-modal";
import { ResetPasswordModal } from "@/components/portal/reset-password-modal";
import { ConfirmModal } from "@/components/portal/confirm-modal";
import { UserFilterPanel } from "@/components/portal/user-filter-panel";
import { UserRowMenu } from "@/components/portal/user-row-menu";
import { DownloadMenu, type DownloadFormat } from "@/components/portal/download-menu";
import { BulkUploadUsersModal } from "@/components/portal/bulk-upload-users-modal";
import { downloadUsersCsv, downloadUsersExcel, printUsersPdf } from "@/lib/utils/user-export";
import type { Role, SortDir, UserSummary } from "@/lib/types/portal";

const PAGE_SIZE = 15;

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function runExport(format: DownloadFormat, users: UserSummary[]) {
  if (users.length === 0) return;
  if (format === "csv") downloadUsersCsv(users);
  else if (format === "excel") downloadUsersExcel(users);
  else printUsersPdf(users);
}

export default function AdminUsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput, 300);
  const [roles, setRoles] = useState<Role[]>([]);
  const [orgIds, setOrgIds] = useState<string[]>([]);

  const [selected, setSelected] = useState<Map<string, UserSummary>>(new Map());
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null);
  const [resettingUser, setResettingUser] = useState<UserSummary | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserSummary | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => setPage(1), [search, roles, orgIds]);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, sortBy, sortDir, orgIds, roles, search],
    queryFn: () =>
      fetchUsers({
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDir,
        organizationId: orgIds.length ? orgIds : undefined,
        role: roles.length ? roles : undefined,
        search: search || undefined,
      }),
  });
  const { data: orgOptions } = useQuery({ queryKey: ["organization-options"], queryFn: fetchOrganizationOptions });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setUserStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      setDeletingUser(null);
      setDeleteError("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: unknown) => setDeleteError(e instanceof Error ? e.message : "Could not delete this user."),
  });

  function onSortChange(column: string) {
    if (sortBy === column) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortDir("desc");
    }
    setPage(1);
  }

  const rows = data?.data ?? [];
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

  const columns: DataTableColumn<UserSummary>[] = [
    { key: "name", header: "Name", sortable: true, render: (u) => <UserCell name={u.name} role={u.role} /> },
    { key: "email", header: "Email", sortable: true, render: (u) => u.email },
    { key: "role", header: "Role", render: (u) => <RoleBadge role={u.role} /> },
    { key: "organization", header: "Organization", render: (u) => u.organization && <OrgBadge id={u.organization.id} name={u.organization.name} /> },
    {
      key: "status",
      header: "Status",
      render: (u) =>
        u.isActive === false ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Suspended
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Active
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Every account across every organization and internal staff."
        actions={
          <>
            <DownloadMenu
              disabled={rows.length === 0}
              onSelect={async (format) => {
                const full = await fetchUsers({
                  page: 1,
                  pageSize: 1000,
                  sortBy,
                  sortDir,
                  organizationId: orgIds.length ? orgIds : undefined,
                  role: roles.length ? roles : undefined,
                  search: search || undefined,
                });
                runExport(format, full.data);
              }}
            />
            <Button variant="secondary" size="md" onClick={() => setBulkUploadOpen(true)}>
              <UploadCloud size={16} />
              Bulk Upload
            </Button>
            <Button size="md" onClick={() => setModalOpen(true)}>
              <UserPlus size={16} />
              Add user
            </Button>
          </>
        }
      />

      <div className="flex min-w-[260px] items-center gap-1 rounded-lg border-2 border-pine/25 bg-white pl-3 pr-1.5">
        <Search size={16} className="shrink-0 text-ink/40" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name or email…"
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
        <UserFilterPanel
          orgOptions={(orgOptions ?? []).map((o) => ({ value: o.id, label: o.name }))}
          roles={roles}
          orgIds={orgIds}
          onApply={(nextRoles, nextOrgIds) => {
            setRoles(nextRoles);
            setOrgIds(nextOrgIds);
          }}
        />
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-[1.5px] border-emerald/30 bg-mint/30 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-emerald">{selected.size} user{selected.size === 1 ? "" : "s"} selected</span>
            <DownloadMenu label="Export selected" onSelect={(format) => runExport(format, Array.from(selected.values()))} />
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
        rowKey={(u) => u.id}
        isLoading={isLoading}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={onSortChange}
        onRowClick={(u) => router.push(`/portal/admin/users/${u.id}`)}
        selectedIds={selectedIds}
        onToggleRow={toggleRow}
        onToggleAll={toggleAllOnPage}
        renderActions={(u) => (
          <UserRowMenu
            user={u}
            onEdit={() => setEditingUser(u)}
            onResetPassword={() => setResettingUser(u)}
            onToggleActive={() => statusMutation.mutate({ id: u.id, isActive: u.isActive === false })}
            onDelete={() => {
              setDeleteError("");
              setDeletingUser(u);
            }}
          />
        )}
      />

      <CreateUserModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <BulkUploadUsersModal open={bulkUploadOpen} onClose={() => setBulkUploadOpen(false)} />
      <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />
      <ResetPasswordModal user={resettingUser} onClose={() => setResettingUser(null)} />
      <ConfirmModal
        open={!!deletingUser}
        title="Delete user?"
        description={
          deleteError ||
          `This permanently removes ${deletingUser?.name}'s account and identity-provider login. This cannot be undone.`
        }
        confirmLabel="Delete"
        danger
        pending={deleteMutation.isPending}
        onConfirm={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
        onClose={() => setDeletingUser(null)}
      />
    </div>
  );
}
