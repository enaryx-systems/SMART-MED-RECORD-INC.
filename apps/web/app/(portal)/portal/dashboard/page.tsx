"use client";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BriefcaseMedical,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Plus,
  Sparkles,
  Timer,
  UploadCloud,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCases } from "@/lib/api/client";
import { CaseTable } from "@/components/portal/case-table";
import { PageHeading } from "@/components/portal/page-heading";
const stats = [
  ["Total cases", "128", "+12 this month", BriefcaseMedical],
  ["In progress", "45", "8 due this week", Timer],
  ["Completed", "83", "96% on time", CheckCircle2],
  ["Avg. turnaround", "31 hrs", "4 hrs faster", Clock3],
] as const;
export default function Dashboard() {
  const { data = [] } = useQuery({ queryKey: ["cases"], queryFn: getCases });
  const cardTints = [
    "bg-[#F7F9F9]",
    "bg-[#DCE9E2]",
    "bg-[#F7F9F9]",
    "bg-[#EAF2EE]",
  ];
  return (
    <>
      <PageHeading
        eyebrow="Thursday, July 16"
        title="Good morning, Jordan."
        description="Here’s what is happening across your matters today."
        action={
          <div className="flex gap-2">
            <Link
              href="/portal/upload"
              className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-xs font-semibold shadow-sm"
            >
              <UploadCloud size={16} /> Upload
            </Link>
            <Link
              href="/portal/cases/new"
              className="flex items-center gap-2 rounded-lg bg-emerald px-4 py-2.5 text-xs font-semibold text-white shadow-lg"
            >
              <Plus size={16} /> New case
            </Link>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([a, b, c, I], i) => (
          <div
            className={`rounded-2xl border border-[#B8D5CC] ${cardTints[i]} p-5 shadow-card`}
            key={a}
          >
            <div className="flex justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-pine/10 bg-cream text-pine shadow-sm">
                <I size={19} />
              </span>
              <span className="text-[11px] font-semibold text-emerald">
                {c}
              </span>
            </div>
            <div className="mt-5 text-3xl font-bold text-pine">{b}</div>
            <div className="mt-1 text-xs text-slate-600">{a}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="overflow-hidden rounded-2xl border border-[#B8D5CC] bg-white shadow-table">
          <div className="flex items-center justify-between border-b border-mint bg-mint px-5 py-4">
            <div>
              <b className="text-sm text-pine">Active cases</b>
              <span className="ml-2 text-xs text-slate-500">
                Most recently updated
              </span>
            </div>
            <Link
              href="/portal/cases"
              className="flex items-center gap-1 text-xs font-semibold text-emerald"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <CaseTable cases={data} />
        </section>
        <div className="space-y-6">
          <section className="rounded-2xl border border-emerald/30 bg-pine p-6 text-white shadow-card">
            <div className="flex items-center gap-2 text-mint">
              <Sparkles size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">
                AI case signal
              </span>
            </div>
            <h3 className="mt-5 font-sans text-lg font-semibold">
              Three treatment gaps need review.
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/60">
              SMR-2026-1274 contains gaps longer than 45 days between documented
              visits.
            </p>
            <Link
              href="/portal/intelligence"
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-white"
            >
              Review findings <ArrowRight size={14} />
            </Link>
          </section>
          <section className="rounded-2xl border bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Activity size={17} className="text-emerald" />
              <b className="text-sm">Recent activity</b>
            </div>
            <div className="mt-5 space-y-5">
              {[
                ["Physician review completed", "SMR-2026-1269", "18 min"],
                ["312 pages indexed", "SMR-2026-1274", "1 hr"],
                ["Attorney comment added", "SMR-2026-1273", "2 hrs"],
              ].map((x) => (
                <div className="relative border-l border-mint pl-4" key={x[0]}>
                  <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-emerald" />
                  <b className="block text-xs">{x[0]}</b>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    {x[1]} · {x[2]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
