"use client";
import Link from "next/link";
import { Download, Filter, Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getCases } from "@/lib/api/client";
import { CaseTable } from "@/components/portal/case-table";
import { PageHeading } from "@/components/portal/page-heading";
export default function Cases() {
  const [q, setQ] = useState("");
  const { data = [] } = useQuery({ queryKey: ["cases"], queryFn: getCases });
  const filtered = useMemo(
    () =>
      data.filter((c: any) =>
        JSON.stringify(c).toLowerCase().includes(q.toLowerCase()),
      ),
    [data, q],
  );
  return (
    <>
      <PageHeading
        eyebrow="Matter management"
        title="Cases"
        description="Track every case, deliverable, reviewer, and deadline."
        action={
          <Link
            href="/portal/cases/new"
            className="flex items-center gap-2 rounded-lg bg-emerald px-4 py-3 text-xs font-semibold text-white"
          >
            <Plus size={16} /> Create case
          </Link>
        }
      />
      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border py-2.5 pl-9 pr-4 text-xs outline-none focus:border-emerald"
              placeholder="Search case number, client, service…"
            />
          </div>
          <button className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs">
            <Filter size={15} /> Filters
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs">
            <Download size={15} /> Export
          </button>
        </div>
        <CaseTable cases={filtered} />
        <div className="border-t px-5 py-4 text-xs text-slate-400">
          Showing {filtered.length} of 128 cases
        </div>
      </div>
    </>
  );
}
