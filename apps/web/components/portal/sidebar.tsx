"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Banknote,
  Building2,
  ChevronDown,
  FilePlus2,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Receipt,
  Search,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSidebarOpen } from "@/redux/uiSlice";
import type { Role } from "@/lib/types/portal";

interface Leaf {
  label: string;
  href: string;
  external?: boolean;
  noActive?: boolean;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
  children?: Leaf[];
}

const CLIENT_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/portal/dashboard" },
  {
    label: "Add Records",
    icon: FilePlus2,
    children: [
      { label: "New Records", href: "/portal/records/new" },
      { label: "Additional Records", href: "/portal/cases", noActive: true },
    ],
  },
  {
    label: "Cases",
    icon: FolderOpen,
    children: [
      { label: "All Cases", href: "/portal/cases" },
      { label: "On Hold", href: "/portal/cases?status=ON_HOLD" },
      { label: "Canceled", href: "/portal/cases?status=CANCELED" },
      { label: "Delivered", href: "/portal/cases?status=DELIVERED" },
    ],
  },
  { label: "Search", icon: Search, href: "/portal/search" },
  { label: "Billing", icon: Receipt, href: "/portal/billing" },
  { label: "Support", icon: LifeBuoy, href: "/portal/support" },
  {
    label: "Our Sample",
    icon: FileText,
    children: [
      { label: "Sample SOP", href: "/Medical_Records_Review_SOP.pdf", external: true },
    ],
  },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/portal/admin/dashboard" },
  { label: "Organizations", icon: Building2, href: "/portal/admin/organizations" },
  { label: "Case Queue", icon: FolderOpen, href: "/portal/admin/cases" },
  { label: "Reviewer Queue", icon: ListChecks, href: "/portal/reviewer/cases" },
  { label: "Users", icon: Users, href: "/portal/admin/users" },
  { label: "Search", icon: Search, href: "/portal/search" },
  { label: "Billing", icon: Receipt, href: "/portal/admin/billing" },
  { label: "Support", icon: LifeBuoy, href: "/portal/support" },
];

const REVIEWER_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/portal/reviewer/dashboard" },
  { label: "My Queue", icon: ListChecks, href: "/portal/reviewer/cases" },
  { label: "Search", icon: Search, href: "/portal/search" },
  { label: "Support", icon: LifeBuoy, href: "/portal/support" },
];

const BILLING_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/portal/finance/dashboard" },
  { label: "Invoices", icon: Banknote, href: "/portal/finance/invoices" },
  { label: "Support", icon: LifeBuoy, href: "/portal/support" },
];

function navFor(role: Role): NavItem[] {
  switch (role) {
    case "ADMIN":
      return ADMIN_NAV;
    case "REVIEWER":
      return REVIEWER_NAV;
    case "BILLING":
      return BILLING_NAV;
    case "CLIENT":
    default:
      return CLIENT_NAV;
  }
}

function isActive(pathname: string, search: string, href: string) {
  const [path, query] = href.split("?");
  if (pathname !== path) return false;
  if (!query) return true;
  return search.replace(/^\?/, "") === query;
}

export function PortalSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const nav = navFor(role);
  const [open, setOpen] = useState<Record<string, boolean>>({
    "Add Records": false,
    Cases: pathname.startsWith("/portal/cases"),
  });
  const dispatch = useAppDispatch();
  const expandedView = useAppSelector((state) => state.ui.sidebarOpen);

  return (
    <aside
      onMouseEnter={() => dispatch(setSidebarOpen(true))}
      onMouseLeave={() => dispatch(setSidebarOpen(false))}
      className={`relative hidden shrink-0 flex-col bg-white text-ink/80 shadow-card transition-[width] duration-base lg:flex ${
        expandedView ? "w-64" : "w-20"
      }`}
    >
      <nav className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden px-3 py-4 [&::-webkit-scrollbar]:h-[5px] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-[#bdd1cb]">
        {nav.map((item) => {
          const Icon = item.icon;
          if (!item.children) {
            const active = isActive(pathname, search, item.href!);
            return (
              <Link
                key={item.label}
                href={item.href!}
                title={item.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-fast ${
                  expandedView ? "" : "justify-center"
                } ${
                  active
                    ? "bg-gradient-to-r from-pine to-emerald text-white shadow-card"
                    : "text-ink hover:bg-mint/70 hover:text-emerald"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {expandedView && item.label}
              </Link>
            );
          }

          const expanded = open[item.label] && expandedView;
          const childActive = item.children.some(
            (c) => !c.external && !c.noActive && isActive(pathname, search, c.href),
          );

          return (
            <div key={item.label}>
              <button
                type="button"
                title={item.label}
                onClick={() => {
                  if (!expandedView) return;
                  setOpen((o) => ({ ...o, [item.label]: !o[item.label] }));
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-fast ${
                  expandedView ? "" : "justify-center"
                } ${
                  childActive
                    ? "text-emerald hover:bg-mint/70"
                    : "text-ink hover:bg-mint/70 hover:text-emerald"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {expandedView && <span className="flex-1">{item.label}</span>}
                {expandedView && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-fast ${expanded ? "rotate-180" : ""}`}
                  />
                )}
              </button>
              {expanded && (
                <div className="mt-1 space-y-1 pl-6">
                  {item.children.map((child) =>
                    child.external ? (
                      <a
                        key={child.label}
                        href={encodeURI(child.href)}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-mint/70 hover:text-emerald"
                      >
                        {child.label}
                      </a>
                    ) : (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-fast ${
                          !child.noActive && isActive(pathname, search, child.href)
                            ? "bg-gradient-to-r from-pine to-emerald text-white shadow-card"
                            : "text-ink/80 hover:bg-mint/70 hover:text-emerald"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ),
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {expandedView && (
        <div className="flex items-center gap-2 border-t border-mint px-6 py-4 text-xs text-ink/50">
          HIPAA-aligned client portal
        </div>
      )}
    </aside>
  );
}
