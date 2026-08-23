import type { CaseStatus } from "@/lib/types/portal";

export type UrgencyLevel = "overdue" | "urgent" | "upcoming";

export interface DueUrgency {
  level: UrgencyLevel;
  label: string;
}

const RESOLVED_STATUSES = new Set<CaseStatus>(["DELIVERED", "CANCELED"]);

function dayDiff(dueAt: Date, now: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const dueMidnight = new Date(dueAt.getFullYear(), dueAt.getMonth(), dueAt.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((dueMidnight.getTime() - nowMidnight.getTime()) / msPerDay);
}

/**
 * Flags a case's delivery deadline as it approaches, so a 1-week TAT that's
 * about to lapse (or already has) is visible before it becomes a missed SLA
 * rather than only being obvious in hindsight. Returns null once the case is
 * DELIVERED/CANCELED (the deadline no longer matters) or the due date is
 * still comfortably out.
 */
export function getDueUrgency(
  dueAt: string | null,
  status: CaseStatus,
  now: Date = new Date(),
): DueUrgency | null {
  if (!dueAt || RESOLVED_STATUSES.has(status)) return null;

  const diff = dayDiff(new Date(dueAt), now);

  if (diff < 0) {
    return { level: "overdue", label: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"}` };
  }
  if (diff === 0) return { level: "urgent", label: "Due today" };
  if (diff === 1) return { level: "urgent", label: "Due tomorrow" };
  if (diff <= 2) return { level: "urgent", label: `Due in ${diff} days` };
  if (diff <= 4) return { level: "upcoming", label: `Due in ${diff} days` };
  return null;
}
