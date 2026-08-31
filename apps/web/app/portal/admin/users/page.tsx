"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, fetchOrganizationOptions, fetchUsers, setUserStatus } from "@/lib/api/client";
import { PageHeader } from "@/components/portal/page-header";
import { OrganizationFilter } from "@/components/portal/organization-filter";
import { Dropdown } from "@/components/portal/dropdown";
import { Button } from "@/components/portal/button";
import { TextInput } from "@/components/portal/text-input";
import { DataTable, type DataTableColumn } from "@/components/portal/data-table";
import { RoleBadge } from "@/components/portal/role-badge";
import { UserCell } from "@/components/portal/user-cell";
import { OrgBadge } from "@/components/portal/org-badge";
import { ROLE_LABEL, type Role, type SortDir, type UserSummary } from "@/lib/types/portal";
import { useAppSelector } from "@/redux/hooks";

const PAGE_SIZE = 15;

const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as Role[]).map((r) => ({
  value: r,
  label: ROLE_LABEL[r],
}));

const INTERNAL_ROLES: Role[] = ["ADMIN", "REVIEWER", "BILLING"];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const organizationId = useAppSelector((state) => state.orgFilter.organizationId);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CLIENT");
  const [newUserOrgId, setNewUserOrgId] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, sortBy, sortDir, organizationId, roleFilter],
    queryFn: () =>
      fetchUsers({
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        sortDir,
        organizationId: organizationId ?? undefined,
        role: roleFilter || undefined,
      }),
  });
  const { data: orgOptions } = useQuery({
    queryKey: ["organization-options"],
    queryFn: fetchOrganizationOptions,
  });

  const orgFormOptions = INTERNAL_ROLES.includes(role)
    ? [{ value: "org_internal", label: "Smart Med Records — Internal" }]
    : (orgOptions ?? []).map((o) => ({ value: o.id, label: o.name }));

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setName("");
      setEmail("");
      setPassword("");
      setNewUserOrgId("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : "Could not create user."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setUserStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  function onSortChange(column: string) {
    if (sortBy === column) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortDir("desc");
    }
    setPage(1);
  }

  const columns: DataTableColumn<UserSummary>[] = [
    { key: "name", header: "Name", sortable: true, render: (u) => <UserCell name={u.name} /> },
    { key: "email", header: "Email", sortable: true, render: (u) => u.email },
    { key: "role", header: "Role", render: (u) => <RoleBadge role={u.role} /> },
    {
      key: "organization",
      header: "Organization",
      render: (u) =>
        u.organization && <OrgBadge id={u.organization.id} name={u.organization.name} />,
    },
    {
      key: "status",
      header: "Status",
      render: (u) =>
        u.isActive ? (
          <span className="text-xs font-bold text-emerald">Active</span>
        ) : (
          <span className="text-xs font-bold text-red-500">Deactivated</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Every account across every organization and internal staff."
        actions={<OrganizationFilter />}
      />

      <form
        className="grid gap-4 rounded-2xl border-[1.5px] border-pine/30 bg-white p-5 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)] sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          const resolvedOrg = INTERNAL_ROLES.includes(role) ? "org_internal" : newUserOrgId;
          if (!resolvedOrg) {
            setError("Choose an organization.");
            return;
          }
          createMutation.mutate({ name, email, password, role, organizationId: resolvedOrg });
        }}
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Name</label>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Email</label>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Temp password</label>
          <TextInput
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Role</label>
          <Dropdown
            value={role}
            onChange={(v) => {
              setRole(v as Role);
              setNewUserOrgId("");
            }}
            options={ROLE_OPTIONS}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Organization</label>
          <Dropdown
            value={INTERNAL_ROLES.includes(role) ? "org_internal" : newUserOrgId}
            onChange={setNewUserOrgId}
            options={orgFormOptions}
            placeholder="Choose organization"
          />
        </div>
        <div className="lg:col-span-5">
          <Button type="submit" size="md" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating…" : "Create user"}
          </Button>
        </div>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-emerald">
          Filter by role
        </span>
        <div className="w-48">
          <Dropdown
            value={roleFilter}
            onChange={(v) => {
              setRoleFilter(v as Role | "");
              setPage(1);
            }}
            options={[{ value: "", label: "All roles" }, ...ROLE_OPTIONS]}
            placeholder="All roles"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={onSortChange}
        renderActions={(u) => (
          <Button
            variant="secondary"
            onClick={() => statusMutation.mutate({ id: u.id, isActive: !u.isActive })}
          >
            {u.isActive ? "Deactivate" : "Activate"}
          </Button>
        )}
      />
    </div>
  );
}
