"use client";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BriefcaseMedical,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Plus,
  Timer,
  UploadCloud,
  Users,
  Workflow,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCases, getDashboardSummary, listUsers } from "@/lib/api/client";
import { CaseTable } from "@/components/portal/case-table";
import { PageHeading } from "@/components/portal/page-heading";
import { formatDate, formatRelative } from "@/lib/format";
import { useSession } from "@/lib/auth/session";
import { ROLE_LABEL } from "@/lib/types/portal";

const BREAKDOWN_COLORS: Record<string, string> = {
  awaitingApproval: "bg-gold",
  inProcessing: "bg-emerald",
  underReview: "bg-[#8a6425]",
  delivered: "bg-pine",
  closed: "bg-slate-300",
};

export default function Dashboard() {
  const { session } = useSession();
  const role = session?.user.role;
  const isStaff = role && role !== "attorney";

  const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: () => getCases() });
  const { data: summary } = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => listUsers(),
    enabled: !!isStaff,
  });

  const firstName = session?.user.name.split(" ")[0] ?? "there";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const stats = [
    ["Total cases", summary?.stats.totalCases ?? "—", BriefcaseMedical],
    ["Awaiting approval", summary?.stats.awaitingApproval ?? "—", Timer],
    ["In processing", summary?.stats.inProcessing ?? "—", Clock3],
    ["Under review", summary?.stats.underReview ?? "—", CheckCircle2],
  ] as const;
  const cardTints = ["bg-[#F7F9F9]", "bg-[#DCE9E2]", "bg-[#F7F9F9]", "bg-[#EAF2EE]"];

  const canCreateCase = role === "attorney" || role === "case-manager" || role === "admin";

  const breakdownTotal = summary
    ? summary.stats.awaitingApproval + summary.stats.inProcessing + summary.stats.underReview + summary.stats.delivered + summary.stats.closed
    : 0;
  const breakdownSegments = summary
    ? ([
        ["Awaiting approval", summary.stats.awaitingApproval, BREAKDOWN_COLORS.awaitingApproval],
        ["In processing", summary.stats.inProcessing, BREAKDOWN_COLORS.inProcessing],
        ["Under review", summary.stats.underReview, BREAKDOWN_COLORS.underReview],
        ["Delivered", summary.stats.delivered, BREAKDOWN_COLORS.delivered],
        ["Closed", summary.stats.closed, BREAKDOWN_COLORS.closed],
      ] as const)
    : [];

  const topStaff = [...users]
    .filter((u) => u.role !== "attorney")
    .sort((a, b) => b.activeCaseCount - a.activeCaseCount)
    .slice(0, 5);

  return (
    <>
      <PageHeading
        eyebrow={today}
        title={`Good morning, ${firstName}.`}
        description="Here’s what is happening across your matters today."
        action={
          <div className="flex gap-2">
            <Link
              href="/portal/upload"
              className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-xs font-semibold shadow-sm"
            >
              <UploadCloud size={16} /> Upload
            </Link>
            {canCreateCase && (
              <Link
                href="/portal/cases/new"
                className="flex items-center gap-2 rounded-lg bg-emerald px-4 py-2.5 text-xs font-semibold text-white shadow-lg"
              >
                <Plus size={16} /> New case
              </Link>
            )}
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([a, b, I], i) => (
          <div
            className={`portal-card-hover rounded-2xl border border-[#B8D5CC] ${cardTints[i]} p-5 shadow-card`}
            key={a}
          >
            <div className="flex justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-pine/10 bg-cream text-pine shadow-sm">
                <I size={19} />
              </span>
            </div>
            <div className="mt-5 text-3xl font-bold text-pine">{b}</div>
            <div className="mt-1 text-xs text-slate-600">{a}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="portal-card-white overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-mint bg-mint px-5 py-4">
              <div>
                <b className="text-sm text-pine">Active cases</b>
                <span className="ml-2 text-xs text-slate-500">Most recently updated</span>
              </div>
              <Link
                href="/portal/cases"
                className="flex items-center gap-1 text-xs font-semibold text-emerald"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <CaseTable cases={cases.slice(0, 6)} />
          </section>

          {breakdownTotal > 0 && (
            <section className="portal-card-white rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <b className="text-sm">Cases by status</b>
                <span className="text-xs text-slate-400">{breakdownTotal} total</span>
              </div>
              <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                {breakdownSegments.map(([label, count, color]) =>
                  count > 0 ? (
                    <div
                      key={label}
                      className={color}
                      style={{ width: `${(count / breakdownTotal) * 100}%` }}
                      title={`${label}: ${count}`}
                    />
                  ) : null,
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {breakdownSegments.map(([label, count, color]) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
                    <span className="text-slate-500">{label}</span>
                    <b className="ml-auto text-pine">{count}</b>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <div className="space-y-6">
          <section className="portal-card-hover rounded-2xl border border-gold/30 bg-cream p-5">
            <div className="flex items-center gap-2 text-pine">
              <CalendarClock size={17} className="text-emerald" />
              <b className="text-sm">Upcoming deadlines</b>
            </div>
            <div className="mt-4 space-y-3">
              {(summary?.upcomingDeadlines ?? []).length === 0 && (
                <p className="text-xs text-slate-400">Nothing due soon.</p>
              )}
              {(summary?.upcomingDeadlines ?? []).map((d) => (
                <Link
                  key={d.id}
                  href={`/portal/cases/${d.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gold/20 bg-white px-3 py-2.5 hover:border-emerald/40"
                >
                  <div className="min-w-0">
                    <b className="block truncate text-xs">{d.caseNumber}</b>
                    <span className="block truncate text-[11px] text-slate-500">{d.matterName}</span>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                      d.priority === "URGENT" ? "bg-red-50 text-red-600" : "bg-mint text-pine"
                    }`}
                  >
                    {formatDate(d.dueAt)}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="portal-card-white rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Activity size={17} className="text-emerald" />
              <b className="text-sm">Recent activity</b>
            </div>
            <div className="mt-5 space-y-5">
              {(summary?.activity ?? []).length === 0 && (
                <p className="text-xs text-slate-400">No activity yet.</p>
              )}
              {(summary?.activity ?? []).map((x) => (
                <div className="relative border-l border-mint pl-4" key={x.id}>
                  <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-emerald" />
                  <b className="block text-xs">{x.action.replaceAll("_", " ").toLowerCase()}</b>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    {x.caseNumber ? `${x.caseNumber} · ` : ""}
                    {formatRelative(x.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {isStaff && topStaff.length > 0 && (
            <section className="portal-card-white rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <Users size={17} className="text-emerald" />
                <b className="text-sm">Workload overview</b>
              </div>
              <div className="mt-4 space-y-4">
                {topStaff.map((u) => {
                  const max = Math.max(...topStaff.map((x) => x.activeCaseCount), 1);
                  return (
                    <div key={u.id}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-pine">{u.name}</span>
                        <span className="text-slate-400">
                          {u.activeCaseCount} case{u.activeCaseCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-mint">
                        <div
                          className="h-full rounded-full bg-emerald"
                          style={{ width: `${(u.activeCaseCount / max) * 100}%` }}
                        />
                      </div>
                      <span className="mt-1 block text-[10px] text-slate-400">{ROLE_LABEL[u.role]}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
      <section className="mt-6 flex flex-col gap-5 rounded-2xl border border-gold/30 bg-cream p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pine text-gold">
            <Workflow size={21} />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald">Case operating flow</span>
            <h2 className="mt-1 text-lg font-semibold text-pine">Keep every case moving with the SOP workflow.</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Track approvals, assignment, review, delivery, payment, and closure from one workspace.</p>
          </div>
        </div>
        <Link href="/portal/workflow" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-pine px-4 py-3 text-xs font-semibold text-white">
          Open workflow <ArrowRight size={15} />
        </Link>
      </section>
    </>
  );
}
