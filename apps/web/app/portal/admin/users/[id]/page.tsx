"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FolderOpen, Mail } from "lucide-react";
import { fetchCases, fetchUser, setUserStatus } from "@/lib/api/client";
import { ROLE_COLOR } from "@/lib/types/portal";
import { RoleBadge } from "@/components/portal/role-badge";
import { StatusPill } from "@/components/portal/status-pill";
import { Button } from "@/components/portal/button";
import { ConfirmModal } from "@/components/portal/confirm-modal";
import { EditUserModal } from "@/components/portal/edit-user-modal";
import { ResetPasswordModal } from "@/components/portal/reset-password-modal";
import { initials } from "@/lib/utils/initials";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [confirmingSuspend, setConfirmingSuspend] = useState(false);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", params.id],
    queryFn: () => fetchUser(params.id),
  });

  const { data: recentCases } = useQuery({
    queryKey: ["cases", "for-user-org", user?.organizationId],
    queryFn: () => fetchCases({ organizationId: user!.organizationId, pageSize: 5, sortBy: "createdAt", sortDir: "desc" }),
    enabled: !!user?.organizationId,
  });

  const statusMutation = useMutation({
    mutationFn: () => setUserStatus(user!.id, user!.isActive === false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", params.id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setConfirmingSuspend(false);
    },
  });

  if (isLoading) return <p className="text-sm text-ink/50">Loading user…</p>;
  if (isError || !user) {
    return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Could not load this user.</p>;
  }

  const suspended = user.isActive === false;

  return (
    <div className="space-y-4">
      <Link
        href="/portal/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 transition-colors duration-fast hover:text-emerald"
      >
        <ArrowLeft size={15} />
        Back to Users
      </Link>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex flex-col rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <div className="flex flex-col items-center text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-card"
              style={{ backgroundColor: ROLE_COLOR[user.role] }}
            >
              {initials(user.name)}
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink">{user.name}</h2>
            <div className="mt-1.5">
              <RoleBadge role={user.role} />
            </div>
            <span
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                suspended ? "bg-red-50 text-red-600" : "bg-emerald/10 text-emerald"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${suspended ? "bg-red-500" : "bg-emerald"}`} />
              {suspended ? "Suspended" : "Active"}
            </span>
          </div>

          <div className="mt-6 space-y-4 border-t border-mint pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-emerald">Details</h3>
            <div>
              <div className="text-xs text-ink/50">Email</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-ink">
                <Mail size={13} className="text-ink/40" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-ink/50">Organization</div>
              <div className="mt-0.5 text-sm font-medium text-ink">{user.organization?.name ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-ink/50">Cases owned</div>
              <div className="mt-0.5 text-sm font-medium text-ink">{user._count?.cases ?? 0}</div>
            </div>
            {user.role === "REVIEWER" && (
              <div>
                <div className="text-xs text-ink/50">Cases assigned</div>
                <div className="mt-0.5 text-sm font-medium text-ink">{user._count?.assignedCases ?? 0}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-ink/50">Joined</div>
              <div className="mt-0.5 text-sm font-medium text-ink">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-mint pt-5">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant="secondary"
              className={suspended ? "!border-emerald !text-emerald" : "!border-gold !text-gold"}
              onClick={() => setConfirmingSuspend(true)}
            >
              {suspended ? "Activate" : "Suspend"}
            </Button>
            <Button variant="secondary" onClick={() => setResettingPassword(true)}>
              Reset Password
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-pine">
            <FolderOpen size={18} />
            Recent cases {user.organization ? `— ${user.organization.name}` : ""}
          </h3>
          {recentCases && recentCases.data.length > 0 ? (
            <ul className="divide-y divide-mint">
              {recentCases.data.map((c) => (
                <li
                  key={c.id}
                  className="flex cursor-pointer items-center justify-between gap-3 py-3 transition-colors duration-fast hover:bg-mint/20"
                  onClick={() => router.push(`/portal/admin/cases/${c.id}`)}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-pine">{c.caseNumber}</div>
                    <div className="truncate text-xs text-ink/50">{c.matterName}</div>
                  </div>
                  <StatusPill status={c.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/50">No cases for this organization yet.</p>
          )}
        </div>
      </div>

      <EditUserModal user={editing ? user : null} onClose={() => setEditing(false)} />
      <ResetPasswordModal user={resettingPassword ? user : null} onClose={() => setResettingPassword(false)} />
      <ConfirmModal
        open={confirmingSuspend}
        title={suspended ? "Activate this user?" : "Suspend this user?"}
        description={
          suspended
            ? `${user.name} will regain access to the portal.`
            : `${user.name} will lose access to the portal until reactivated.`
        }
        confirmLabel={suspended ? "Activate" : "Suspend"}
        danger={!suspended}
        pending={statusMutation.isPending}
        onConfirm={() => statusMutation.mutate()}
        onClose={() => setConfirmingSuspend(false)}
      />
    </div>
  );
}
