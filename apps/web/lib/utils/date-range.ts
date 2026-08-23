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
