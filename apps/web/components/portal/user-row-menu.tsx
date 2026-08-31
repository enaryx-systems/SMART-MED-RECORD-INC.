"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, KeyRound, MoreVertical, Pencil, ShieldOff, Trash2 } from "lucide-react";
import type { UserSummary } from "@/lib/types/portal";

export function UserRowMenu({
  user,
  onEdit,
  onResetPassword,
  onToggleActive,
  onDelete,
}: {
  user: UserSummary;
  onEdit: () => void;
  onResetPassword: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Actions for ${user.name}`}
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 transition-colors duration-fast ${
          open ? "bg-mint/60 text-ink" : "hover:bg-mint/60 hover:text-ink"
        }`}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-dropdown w-48 overflow-hidden rounded-xl border-[1.5px] border-pine/30 bg-white p-1 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink/80 transition-colors duration-fast hover:bg-mint/60"
          >
            <Pencil size={15} />
            Edit User
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onResetPassword();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink/80 transition-colors duration-fast hover:bg-mint/60"
          >
            <KeyRound size={15} />
            Reset Password
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onToggleActive();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gold transition-colors duration-fast hover:bg-gold/10"
          >
            {user.isActive === false ? <CheckCircle2 size={15} /> : <ShieldOff size={15} />}
            {user.isActive === false ? "Activate User" : "Suspend User"}
          </button>
          <div className="my-1 border-t border-mint" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors duration-fast hover:bg-red-50"
          >
            <Trash2 size={15} />
            Delete User
          </button>
        </div>
      )}
    </div>
  );
}
