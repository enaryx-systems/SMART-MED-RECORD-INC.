"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/portal/button";
import { ROLE_LABEL, type Role } from "@/lib/types/portal";

const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as Role[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }));

export function UserFilterPanel({
  orgOptions,
  roles,
  orgIds,
  onApply,
}: {
  orgOptions: { value: string; label: string }[];
  roles: Role[];
  orgIds: string[];
  onApply: (roles: Role[], orgIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftRoles, setDraftRoles] = useState<Role[]>(roles);
  const [draftOrgs, setDraftOrgs] = useState<string[]>(orgIds);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraftRoles(roles);
    setDraftOrgs(orgIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const activeCount = roles.length + orgIds.length;
  const draftCount = draftRoles.length + draftOrgs.length;

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Filters"
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-fast ${
          open || activeCount > 0 ? "bg-mint/70 text-emerald" : "text-ink/50 hover:bg-mint/40 hover:text-ink"
        }`}
      >
        <SlidersHorizontal size={16} />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-dropdown w-[520px] max-w-[92vw] overflow-hidden rounded-2xl border-[1.5px] border-pine/30 bg-white shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <div className="grid grid-cols-2 divide-x divide-mint">
            <div className="p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                Role
              </div>
              <div className="no-scrollbar max-h-52 space-y-1 overflow-y-auto pr-1">
                {ROLE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/80 hover:bg-mint/40">
                    <input
                      type="checkbox"
                      checked={draftRoles.includes(opt.value)}
                      onChange={() => setDraftRoles((prev) => toggle(prev, opt.value))}
                      className="h-4 w-4 rounded border-2 border-pine/40 accent-emerald"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-pine" />
                Organization
              </div>
              <div className="no-scrollbar max-h-52 space-y-1 overflow-y-auto pr-1">
                {orgOptions.length === 0 && <p className="px-2 py-1.5 text-sm text-ink/40">No organizations yet.</p>}
                {orgOptions.map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/80 hover:bg-mint/40">
                    <input
                      type="checkbox"
                      checked={draftOrgs.includes(opt.value)}
                      onChange={() => setDraftOrgs((prev) => toggle(prev, opt.value))}
                      className="h-4 w-4 rounded border-2 border-pine/40 accent-emerald"
                    />
                    <span className="truncate">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-mint px-4 py-3">
            <span className="text-xs text-ink/50">{draftCount} selected</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setDraftRoles([]);
                  setDraftOrgs([]);
                }}
              >
                <RotateCcw size={14} />
                Reset
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onApply(draftRoles, draftOrgs);
                  setOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
