import Link from "next/link";
import {
  Ban,
  CheckCircle2,
  FileEdit,
  Inbox,
  LayoutGrid,
  Loader,
  PauseCircle,
  Truck,
} from "lucide-react";
import { CASE_STATUSES, STATUS_COLOR, STATUS_LABEL, type CaseStats, type CaseStatus } from "@/lib/types/portal";

const STATUS_ICON: Record<CaseStatus, React.ComponentType<{ size?: number }>> = {
  DRAFT: FileEdit,
  NEW: Inbox,
  IN_PROGRESS: Loader,
  ON_HOLD: PauseCircle,
  AWAITING_DELIVERY: Truck,
  DELIVERED: CheckCircle2,
  CANCELED: Ban,
};

function Card({
  href,
  label,
  count,
  color,
  active,
  icon: Icon,
}: {
  href: string;
  label: string;
  count: number;
  color: string;
  active: boolean;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl border-[1.5px] p-4 transition-[transform,box-shadow,border-color] duration-[250ms] ease hover:-translate-y-[3px] hover:shadow-[0_16px_34px_rgba(0,69,58,0.12),0_3px_8px_rgba(183,138,61,0.1)] ${
        active
          ? "border-emerald bg-white shadow-card ring-1 ring-emerald"
          : "border-pine/30 bg-white shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)] hover:border-gold/50"
      }`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}1F`, color }}
      >
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold text-ink/70">{label}</div>
        <div className="text-xl font-bold text-pine">{count}</div>
      </div>
    </Link>
  );
}

export function StatusFilterCards({
  baseHref,
  status,
  stats,
}: {
  baseHref: string;
  status?: CaseStatus;
  stats?: CaseStats;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card
        href={baseHref}
        label="All"
        count={stats?.total ?? 0}
        color="#00453A"
        active={!status}
        icon={LayoutGrid}
      />
      {CASE_STATUSES.map((s) => (
        <Card
          key={s}
          href={`${baseHref}?status=${s}`}
          label={STATUS_LABEL[s]}
          count={stats?.counts[s] ?? 0}
          color={STATUS_COLOR[s]}
          active={status === s}
          icon={STATUS_ICON[s]}
        />
      ))}
    </div>
  );
}
