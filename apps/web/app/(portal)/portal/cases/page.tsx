"use client";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCases } from "@/lib/api/client";
import { CaseTable } from "@/components/portal/case-table";
import { PageHeading } from "@/components/portal/page-heading";
import { useSession } from "@/lib/auth/session";

const STATUS_FILTERS = [
  ["", "All statuses"],
  ["AWAITING_APPROVAL", "Awaiting approval"],
  ["IN_PROCESSING", "In processing"],
  ["UNDER_REVIEW", "Under review"],
  ["FINAL_AUDIT", "Final audit"],
  ["DELIVERED", "Delivered"],
  ["FOLLOW_UP", "Follow-up"],
  ["PAYMENT_PENDING", "Payment pending"],
  ["CLOSED", "Closed"],
] as const;

export default function Cases() {
  const { session } = useSession();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["cases", q, status],
    queryFn: () => getCases({ q: q || undefined, status: status || undefined }),
  });

  const canCreateCase =
    session?.user.role === "attorney" || session?.user.role === "case-manager" || session?.user.role === "admin";

  return (
    <>
      <PageHeading
        eyebrow="Matter management"
        title="Cases"
        description="Track every case, deliverable, reviewer, and deadline."
        action={
          canCreateCase && (
            <Link
              href="/portal/cases/new"
              className="flex items-center gap-2 rounded-lg bg-emerald px-4 py-3 text-xs font-semibold text-white"
            >
              <Plus size={16} /> Create case
            </Link>
          )
        }
      />
      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border py-2.5 pl-9 pr-4 text-xs outline-none focus:border-emerald"
              placeholder="Search case number, client, service…"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border px-3 py-2.5 text-xs outline-none focus:border-emerald"
          >
            {STATUS_FILTERS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {isLoading ? (
          <div className="px-5 py-14 text-center text-sm text-slate-400">Loading cases…</div>
        ) : (
          <CaseTable cases={data} />
        )}
        <div className="border-t px-5 py-4 text-xs text-slate-400">Showing {data.length} cases</div>
      </div>
    </>
  );
}
