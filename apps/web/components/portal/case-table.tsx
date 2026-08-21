"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CaseRecord } from "@/lib/types/portal";
import { formatDate, formatRelative } from "@/lib/format";
import { StatusPill } from "./status-pill";

export function CaseTable({ cases }: { cases: CaseRecord[] }) {
  if (cases.length === 0) {
    return (
      <div className="px-5 py-14 text-center text-sm text-slate-400">
        No cases to show yet.
      </div>
    );
  }
  return (
    <div className="thin-scroll overflow-x-auto">
      <table className="w-full min-w-[820px] text-left">
        <thead>
            <tr className="border-b border-mint bg-mint/60 text-[10px] uppercase tracking-wider text-pine/55">
            {["Case / matter", "Service", "Status", "Progress", "Due date", "Updated", ""].map(
              (x) => (
                <th className="px-5 py-3 font-semibold" key={x}>
                  {x}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr className="border-b border-mint last:border-0 hover:bg-cream/70" key={c.id}>
              <td className="px-5 py-4">
                <Link
                  href={`/portal/cases/${c.id}`}
                  className="font-semibold text-pine hover:text-emerald"
                >
                  {c.caseNumber}
                </Link>
                <span className="mt-1 block text-xs text-slate-500">{c.matterName}</span>
              </td>
              <td className="px-5 py-4 text-xs">{c.service}</td>
              <td className="px-5 py-4">
                <StatusPill status={c.status} label={c.statusLabel} onHold={c.onHold} />
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-mint">
                    <div
                      className="h-full rounded-full bg-emerald"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">{c.progress}%</span>
                </div>
              </td>
              <td className="px-5 py-4 text-xs">{formatDate(c.dueAt)}</td>
              <td className="px-5 py-4 text-xs text-slate-400">{formatRelative(c.updatedAt)}</td>
              <td className="px-5 py-4">
                <Link href={`/portal/cases/${c.id}`}>
                  <ArrowUpRight size={17} className="text-slate-400" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
