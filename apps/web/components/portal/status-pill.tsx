export function StatusPill({ status }: { status: string }) {
  const c =
    status === "Completed"
      ? "bg-emerald/10 text-emerald"
      : status.includes("review")
        ? "bg-purple-50 text-purple-700"
        : status === "Processing"
          ? "bg-blue-50 text-blue-700"
          : "bg-amber-50 text-amber-700";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${c}`}
    >
      {status}
    </span>
  );
}
