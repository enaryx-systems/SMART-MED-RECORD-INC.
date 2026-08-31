export type CreatedRangePreset = "" | "today" | "yesterday" | "last_week" | "last_month";

export const CREATED_RANGE_OPTIONS: { value: CreatedRangePreset; label: string }[] = [
  { value: "", label: "All time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_week", label: "Last week" },
  { value: "last_month", label: "Last month" },
];

export function getCreatedRange(preset: CreatedRangePreset): { from?: string; to?: string } {
  if (!preset) return {};

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return { from: startOfToday.toISOString(), to: now.toISOString() };
    case "yesterday": {
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      return { from: startOfYesterday.toISOString(), to: startOfToday.toISOString() };
    }
    case "last_week": {
      const from = new Date(startOfToday);
      from.setDate(from.getDate() - 7);
      return { from: from.toISOString(), to: now.toISOString() };
    }
    case "last_month": {
      const from = new Date(startOfToday);
      from.setMonth(from.getMonth() - 1);
      return { from: from.toISOString(), to: now.toISOString() };
    }
    default:
      return {};
  }
}

// A specific calendar month, e.g. "2026-01" -> Jan 1 through Jan 31 (local time).
export function getMonthRange(monthKey: string): { from: string; to: string } {
  const [year, month] = monthKey.split("-").map(Number);
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function monthKeyLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

// Distinct past (before the current calendar month) year-month keys found in
// the given createdAt timestamps, newest first — so a specific-month filter
// chip is only ever offered when that month actually has records.
export function pastMonthsWithData(createdAtDates: string[]): string[] {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const keys = new Set<string>();
  for (const iso of createdAtDates) {
    const d = new Date(iso);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key < currentKey) keys.add(key);
  }
  return Array.from(keys).sort().reverse();
}
