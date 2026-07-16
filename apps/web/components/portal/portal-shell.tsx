"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bot,
  ChevronDown,
  CircleHelp,
  CreditCard,
  FileBarChart,
  FileStack,
  Gauge,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Shield,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Role } from "@/lib/types/portal";

const items = [
  ["/portal/dashboard", "Overview", Gauge, "all"],
  ["/portal/cases", "Cases", FileStack, "all"],
  ["/portal/upload", "Secure upload", UploadCloud, "attorney,case-manager,admin"],
  ["/portal/intelligence", "AI workspace", Bot, "attorney,case-manager,physician,reviewer,admin"],
  ["/portal/reports", "Reports", FileBarChart, "all"],
  ["/portal/messages", "Messages", MessageSquare, "all"],
  ["/portal/billing", "Billing", CreditCard, "attorney,case-manager,billing,admin"],
  ["/portal/team", "Team & access", Users, "case-manager,admin"],
  ["/portal/admin", "Administration", Shield, "admin"],
  ["/portal/settings", "Settings", Settings, "all"],
] as const;
export function PortalShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [role, setRole] = useState<Role>("attorney");
  useEffect(() => {
    setRole((localStorage.getItem("smr_role") as Role) || "attorney");
  }, []);
  const visible = useMemo(() => items.filter((x) => x[3] === "all" || x[3].includes(role)), [role]);
  function changeRole(r: Role) {
    setRole(r);
    localStorage.setItem("smr_role", r);
    window.dispatchEvent(new Event("rolechange"));
  }
  function logout() {
    localStorage.removeItem("smr_session");
    router.push("/login");
  }
  return (
    <div className="min-h-screen bg-ivory">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-pine text-white transition-transform lg:translate-x-0 ${mobile ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Logo portal />
          <button className="lg:hidden" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>
        <div className="border-b border-white/10 p-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/45">
            Viewing as
          </label>
          <div className="relative mt-2">
            <select
              value={role}
              onChange={(e) => changeRole(e.target.value as Role)}
              className="w-full appearance-none rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 text-xs capitalize outline-none"
            >
              <option className="text-black" value="attorney">
                Attorney / client
              </option>
              <option className="text-black" value="case-manager">
                Case manager
              </option>
              <option className="text-black" value="physician">
                Physician reviewer
              </option>
              <option className="text-black" value="reviewer">
                Medical reviewer
              </option>
              <option className="text-black" value="billing">
                Billing specialist
              </option>
              <option className="text-black" value="admin">
                Administrator
              </option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3" />
          </div>
        </div>
        <nav className="thin-scroll flex-1 space-y-1 overflow-auto p-3">
          {visible.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobile(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${path === href ? "bg-cream text-pine shadow-card" : "text-white/68 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10"
            onClick={logout}
          >
            <LogOut size={17} /> Log out
          </button>
          <div className="mt-3 flex items-center gap-2 px-3 text-[10px] text-white/35">
            <Shield size={12} /> Secure session · encrypted
          </div>
        </div>
      </aside>
      <div className="lg:pl-[260px]">
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
                JS
              </span>
              <div className="hidden sm:block">
                <b className="block text-xs">Jordan Smith</b>
                <span className="text-[11px] capitalize text-slate-400">
                  {role.replace("-", " ")}
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className="p-5 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
