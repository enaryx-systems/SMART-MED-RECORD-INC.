import { PageHeading } from "./page-heading";
import { ArrowUpRight, CheckCircle2, Clock3, FileText, Search } from "lucide-react";
export function ModulePage({
  eyebrow,
  title,
  description,
  stats,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  stats: [string, string][];
  items: [string, string, string][];
}) {
  const tints = ["bg-[#F7F9F9]", "bg-[#DCE9E2]", "bg-[#EAF2EE]"];
  return (
    <>
      <PageHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(([a, b], i) => (
          <div
            className={`rounded-2xl border border-[#B8D5CC] ${tints[i]} p-5 shadow-card`}
            key={a}
          >
            <span className="text-xs text-slate-500">{a}</span>
            <b className="mt-2 block text-2xl text-pine">{b}</b>
          </div>
        ))}
      </div>
      <section className="mt-6 overflow-hidden rounded-2xl border border-[#B8D5CC] bg-white shadow-table">
        <div className="flex items-center justify-between border-b border-mint bg-mint p-5">
          <b className="text-sm">Recent</b>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              className="rounded-lg border bg-cream py-2 pl-8 pr-3 text-xs"
              placeholder="Search…"
            />
          </div>
        </div>
        {items.map(([a, b, c], i) => (
          <div
            className={`flex items-center gap-4 border-b border-mint px-5 py-4 last:border-0 ${i % 2 ? "bg-[#F7F9F9]" : "bg-cream"}`}
            key={a}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-pine/10 bg-mint text-pine shadow-sm">
              {i % 2 ? <Clock3 size={18} /> : <FileText size={18} />}
            </span>
            <div className="min-w-0 flex-1">
              <b className="block text-xs">{a}</b>
              <span className="mt-1 block text-[11px] text-slate-500">{b}</span>
            </div>
            <span className="hidden rounded-full border border-emerald/15 bg-emerald/10 px-3 py-1 text-[10px] font-semibold text-emerald sm:block">
              {c}
            </span>
            <ArrowUpRight size={16} className="text-slate-400" />
          </div>
        ))}
      </section>
    </>
  );
}
