"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { fetchOrganizationOptions, updateUser } from "@/lib/api/client";
import { Dropdown } from "@/components/portal/dropdown";
import { Button } from "@/components/portal/button";
import { TextInput } from "@/components/portal/text-input";
import { ROLE_LABEL, type Role, type UserSummary } from "@/lib/types/portal";

const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as Role[]).map((r) => ({
  value: r,
  label: ROLE_LABEL[r],
}));

const INTERNAL_ROLES: Role[] = ["ADMIN", "REVIEWER", "BILLING"];

export function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: UserSummary | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("CLIENT");
  const [orgId, setOrgId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setRole(user.role);
    setOrgId(user.organizationId ?? "");
    setError("");
  }, [user]);

  const { data: orgOptions } = useQuery({
    queryKey: ["organization-options"],
    queryFn: fetchOrganizationOptions,
    enabled: !!user,
  });

  const orgFormOptions = INTERNAL_ROLES.includes(role)
    ? [{ value: "org_internal", label: "Smart Med Records — Internal" }]
    : (orgOptions ?? []).map((o) => ({ value: o.id, label: o.name }));

  const updateMutation = useMutation({
    mutationFn: () => updateUser(user!.id, { name, role, organizationId: orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user!.id] });
      onSaved?.();
      onClose();
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : "Could not update user."),
  });

  useEffect(() => {
    if (!user) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [user, onClose]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-ink/40 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="z-modal w-full max-w-lg rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_24px_60px_rgba(0,69,58,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-pine">Edit user</h3>
            <p className="mt-1 text-sm text-ink/60">Update this account's name, role, or organization.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-ink/40 transition-colors duration-fast hover:bg-mint/60 hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            updateMutation.mutate();
          }}
        >
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-ink">Name</label>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-ink">Email</label>
            <TextInput value={user.email} disabled className="cursor-not-allowed opacity-60" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Role</label>
            <Dropdown
              value={role}
              onChange={(v) => {
                const nextRole = v as Role;
                setRole(nextRole);
                setOrgId(INTERNAL_ROLES.includes(nextRole) ? "org_internal" : "");
              }}
              options={ROLE_OPTIONS}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Organization</label>
            <Dropdown
              value={orgId}
              onChange={setOrgId}
              options={orgFormOptions}
              placeholder="Choose organization"
            />
          </div>

          {error && <p className="sm:col-span-2 text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
