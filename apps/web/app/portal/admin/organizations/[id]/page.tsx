"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchOrganization } from "@/lib/api/client";
import { PageHeader } from "@/components/portal/page-header";
import { RoleBadge } from "@/components/portal/role-badge";
import { UserCell } from "@/components/portal/user-cell";
import { StatusPill } from "@/components/portal/status-pill";

export default function AdminOrganizationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["organization", params.id],
    queryFn: () => fetchOrganization(params.id),
  });

  if (isLoading) return <p className="text-sm text-ink/50">Loading organization…</p>;
  if (isError || !data) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        Could not load this organization.
      </p>
    );
  }

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

      <div className="overflow-hidden rounded-2xl border-[1.5px] border-pine/30 bg-white shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
        <div className="border-b-2 border-[#b8d5cc] px-5 py-3 text-lg font-bold text-pine">
          Cases
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[#b8d5cc] bg-white">
              <th className="px-4 py-2.5 text-xs font-bold text-ink">Case #</th>
              <th className="px-4 py-2.5 text-xs font-bold text-ink">Matter</th>
              <th className="px-4 py-2.5 text-xs font-bold text-ink">Status</th>
              <th className="px-4 py-2.5 text-xs font-bold text-ink">Created</th>
            </tr>
          </thead>
          <tbody>
            {(!data.cases || data.cases.length === 0) && (
              <tr>
                <td className="px-4 py-6 text-sm text-ink/50" colSpan={4}>
                  No cases yet.
                </td>
              </tr>
            )}
            {data.cases?.map((c) => (
              <tr
                key={c.id}
                className="cursor-pointer border-t border-[#c9ddd6] odd:bg-white even:bg-[#f4f9f6] hover:bg-mint/30"
                onClick={() => router.push(`/portal/admin/cases/${c.id}`)}
              >
                <td className="px-4 py-2.5 text-sm font-semibold text-pine">{c.caseNumber}</td>
                <td className="px-4 py-2.5 text-sm text-ink/80">{c.matterName}</td>
                <td className="px-4 py-2.5 text-sm">
                  <StatusPill status={c.status} />
                </td>
                <td className="px-4 py-2.5 text-sm text-ink/60">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
