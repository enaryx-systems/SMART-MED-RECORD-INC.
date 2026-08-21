"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronLeft,
  CircleHelp,
  CreditCard,
  FileStack,
  Gauge,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Shield,
  UploadCloud,
  X,
  Workflow,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ROLE_LABEL } from "@/lib/types/portal";
import { clearSession, useSession } from "@/lib/auth/session";

type NavItem = readonly [string, string, typeof Gauge, string];

type NavGroup = {
  section: string | null;
  roles: string;
  items: readonly NavItem[];
};

// Nav is scoped to the SOP case lifecycle only (intake -> approval ->
// assignment -> processing -> review -> QC -> delivery -> follow-up ->
// payment -> closure). No modules outside that flow.
const groups: readonly NavGroup[] = [
  {
    section: null,
    roles: "all",
    items: [["/portal/dashboard", "Overview", Gauge, "all"]],
  },
  {
    section: "Case management",
    roles: "all",
    items: [
      ["/portal/cases", "Cases", FileStack, "all"],
      ["/portal/workflow", "Case workflow", Workflow, "all"],
      ["/portal/upload", "Secure upload", UploadCloud, "attorney,case-manager,admin"],
    ],
  },
  {
    section: "Collaboration",
    roles: "all",
    items: [["/portal/messages", "Messages", MessageSquare, "all"]],
  },
  {
    section: "Billing",
    roles: "attorney,case-manager,billing,admin",
    items: [["/portal/billing", "Billing", CreditCard, "attorney,case-manager,billing,admin"]],
  },
  {
    section: null,
    roles: "all",
    items: [["/portal/settings", "Settings", Settings, "all"]],
  },
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const COLLAPSE_KEY = "smr_sidebar_collapsed";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { session, ready } = useSession();

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  function toggleCollapsed(next: boolean) {
    setCollapsed(next);
    localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
  }

  const role = session?.user.role ?? "attorney";
  const visibleGroups = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, items: g.items.filter((x) => x[3] === "all" || x[3].includes(role)) }))
        .filter((g) => g.items.length > 0),
    [role],
  );

  function logout() {
    clearSession();
    router.push("/login");
  }

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <span className="text-sm text-pine/50">Loading your workspace…</span>
      </div>
    );
  }

  const isCollapsed = mounted && collapsed;
  const sidebarWidth = isCollapsed ? "lg:w-[76px]" : "lg:w-[264px]";
  const contentPad = isCollapsed ? "lg:pl-[76px]" : "lg:pl-[264px]";

  return (
    <div className="min-h-screen bg-ivory">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-pine text-white transition-[width] duration-200 lg:translate-x-0 ${sidebarWidth} ${mobile ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-4">
          {isCollapsed ? (
            <button
              onClick={() => toggleCollapsed(false)}
              className="mx-auto flex items-center justify-center rounded-lg p-1 hover:bg-white/10"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <Logo compact />
            </button>
          ) : (
            <>
              <Logo portal />
              <button
                onClick={() => toggleCollapsed(true)}
                className="hidden shrink-0 items-center justify-center rounded-lg border border-white/15 p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:flex"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
              <button className="text-white lg:hidden" onClick={() => setMobile(false)}>
                <X />
              </button>
            </>
          )}
        </div>

        <nav className="no-scrollbar flex-1 space-y-5 overflow-x-hidden overflow-y-auto p-3 pt-4">
          {visibleGroups.map((g, gi) => (
            <div key={g.section ?? `top-${gi}`}>
              {g.section && !isCollapsed && (
                <span className="mb-1.5 block px-3 text-[10px] font-bold uppercase tracking-[.14em] text-white/35">
                  {g.section}
                </span>
              )}
              <div className="space-y-1">
                {g.items.map(([href, label, Icon]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobile(false)}
                    title={isCollapsed ? label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isCollapsed ? "justify-center" : ""} ${
                      path === href
                        ? "bg-white/12 font-semibold text-white shadow-inner ring-1 ring-gold/40"
                        : "text-white/65 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!isCollapsed && label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white ${isCollapsed ? "justify-center" : ""}`}
            onClick={logout}
            title={isCollapsed ? "Log out" : undefined}
          >
            <LogOut size={17} className="shrink-0" /> {!isCollapsed && "Log out"}
          </button>
          {!isCollapsed && (
            <div className="mt-2 flex items-center gap-2 px-3 text-[10px] text-white/35">
              <Shield size={12} /> Secure session · encrypted
            </div>
          )}
        </div>
      </aside>
      <div className={contentPad}>
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-mint bg-ivory/95 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setMobile(true)}>
              <Menu />
            </button>
            <div className="relative hidden sm:block">
              <Search size={17} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                className="w-64 rounded-lg border border-mint bg-white py-2 pl-10 pr-3 text-sm outline-none focus:ring-1 focus:ring-emerald"
                placeholder="Search cases, records…"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2.5 text-slate-500 hover:bg-mint">
              <CircleHelp size={19} />
            </button>
            <button className="relative rounded-lg p-2.5 text-slate-500 hover:bg-mint">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald" />
            </button>
            <div className="ml-2 flex items-center gap-3 border-l border-mint pl-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine text-xs font-bold text-white">
                {initials(session.user.name)}
              </span>
              <div className="hidden sm:block">
                <b className="block text-xs">{session.user.name}</b>
                <span className="text-[11px] text-slate-400">{ROLE_LABEL[role]}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="p-5 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
