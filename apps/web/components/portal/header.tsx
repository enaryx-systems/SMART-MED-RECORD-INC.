"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LogOut, Mail, ShieldCheck } from "lucide-react";
import type { AuthUser } from "@/lib/types/portal";
import { initials } from "@/lib/utils/initials";
import { NotificationBell } from "@/components/portal/notification-bell";

export function PortalHeader({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <header className="flex items-stretch bg-[#ffffff] shadow-card">
      <div className="hidden w-64 shrink-0 items-center gap-2 overflow-hidden px-3 py-3 lg:flex">
        <Image
          src="/images/brand/white_bg_logo-removebg-preview.png"
          alt="Smart Med Records"
          width={453}
          height={503}
          priority
          className="h-12 w-auto shrink-0 object-contain"
        />
        <Image
          src="/images/brand/white_bg_text-removebg-preview.png"
          alt="Smart Med Records Inc."
          width={936}
          height={267}
          priority
          className="h-12 w-auto object-contain"
        />
      </div>
      <div className="flex flex-1 items-center justify-end gap-2.5 px-5 py-2.5 lg:px-6">
        {user.role === "ADMIN" && <NotificationBell />}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
            aria-label={`Account menu for ${user.name}`}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-colors duration-fast ${
              open ? "bg-mint/40" : "hover:bg-mint/40"
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pine to-emerald text-sm font-semibold text-white shadow-card">
              {initials(user.name)}
            </div>
            <span className="max-w-[6rem] truncate text-xs font-semibold text-ink">{user.name}</span>
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+10px)] z-popover w-72 overflow-hidden rounded-2xl border-[1.5px] border-pine/30 bg-white p-0 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
              <div className="flex items-center gap-3 bg-gradient-to-br from-pine to-emerald px-5 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white ring-2 ring-white/40">
                  {initials(user.name)}
                </div>
                <div className="leading-tight text-white">
                  <div className="text-base font-semibold">{user.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-white/75">
                    <ShieldCheck size={12} />
                    <span className="capitalize">{user.role.toLowerCase()} account</span>
                  </div>
                  <div className="mt-0.5 text-xs text-white/60">{user.organizationName}</div>
                </div>
              </div>

              <div className="space-y-1 px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-ink/70">
                  <Mail size={14} className="text-ink/40" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="border-t border-mint p-2">
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink/70 transition-colors duration-fast hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
