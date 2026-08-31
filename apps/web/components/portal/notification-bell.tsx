"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Bell, Clock, FilePlus2 } from "lucide-react";
import { fetchCases } from "@/lib/api/client";
import { getDueUrgency, type DueUrgency } from "@/lib/utils/due-urgency";
import type { Case, CaseStatus } from "@/lib/types/portal";

const OPEN_STATUSES: CaseStatus[] = ["NEW", "IN_PROGRESS", "ON_HOLD", "AWAITING_DELIVERY"];
const REFRESH_MS = 60_000;

// Both lists are self-clearing rather than needing a persisted read/unread
// flag: a "new submission" drops off once it's assigned or moved out of NEW,
// and a "due soon" drops off once delivered/canceled or its date passes out
// of getDueUrgency's window — so the badge always reflects what's still
// actually actionable, no separate notification store needed.
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const { data: newCasesPage } = useQuery({
    queryKey: ["notifications", "new-cases"],
    queryFn: () => fetchCases({ status: "NEW", sortBy: "createdAt", sortDir: "desc", pageSize: 8 }),
    refetchInterval: REFRESH_MS,
  });

  const { data: openCasesPage } = useQuery({
    queryKey: ["notifications", "due-soon"],
    queryFn: () => fetchCases({ status: OPEN_STATUSES, sortBy: "dueAt", sortDir: "asc", pageSize: 30 }),
    refetchInterval: REFRESH_MS,
  });

  const newCases = newCasesPage?.data ?? [];
  const dueSoon = (openCasesPage?.data ?? [])
    .map((c) => ({ case: c, urgency: getDueUrgency(c.dueAt, c.status) }))
    .filter((row): row is { case: Case; urgency: DueUrgency } => row.urgency !== null);

  const total = newCases.length + dueSoon.length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Notifications"
        className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-fast ${
          open ? "bg-mint/60 text-emerald" : "text-ink/50 hover:bg-mint/40 hover:text-ink"
        }`}
      >
        <Bell size={19} />
        {total > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-popover w-96 max-w-[92vw] overflow-hidden rounded-2xl border-[1.5px] border-pine/30 bg-white shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <div className="border-b border-mint px-5 py-3">
            <h3 className="text-sm font-bold text-pine">Notifications</h3>
          </div>

          <div className="no-scrollbar max-h-96 overflow-y-auto">
            {total === 0 && <p className="px-5 py-6 text-center text-sm text-ink/50">You&rsquo;re all caught up.</p>}

            {newCases.length > 0 && (
              <div className="px-2 pt-2">
                <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald">
                  New submissions
                </div>
                {newCases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/portal/admin/cases/${c.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-fast hover:bg-mint/30"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald/12 text-emerald">
                      <FilePlus2 size={14} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">{c.matterName}</div>
                      <div className="text-xs text-ink/50">
                        {c.caseNumber} · {c.organization?.name ?? "—"} submitted this case
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {dueSoon.length > 0 && (
              <div className="px-2 pb-2 pt-2">
                <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-gold">Due soon</div>
                {dueSoon.map(({ case: c, urgency }) => (
                  <Link
                    key={c.id}
                    href={`/portal/admin/cases/${c.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-fast hover:bg-mint/30"
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        urgency.level === "overdue" ? "bg-red-50 text-red-600" : "bg-gold/15 text-gold"
                      }`}
                    >
                      {urgency.level === "overdue" ? <AlertTriangle size={14} /> : <Clock size={14} />}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">{c.matterName}</div>
                      <div className={`text-xs ${urgency.level === "overdue" ? "text-red-600" : "text-gold"}`}>
                        {c.caseNumber} · {urgency.label}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
