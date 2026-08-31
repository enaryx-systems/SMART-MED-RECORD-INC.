"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CASE_STATUSES, STATUS_LABEL, type CaseStatus } from "@/lib/types/portal";

export function StatusFilterDropdown({
  value,
  onChange,
}: {
  value: CaseStatus | "";
  onChange: (value: CaseStatus | "") => void;
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

  const currentLabel = value ? STATUS_LABEL[value] : "All Cases";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full min-w-[170px] items-center justify-between gap-2.5 rounded-lg border-[1.5px] bg-white px-4 py-2 text-xs font-semibold text-pine transition-colors duration-fast ${
          open ? "border-emerald" : "border-pine/30 hover:border-pine/50"
        }`}
      >
        <span>{currentLabel}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-ink/50 transition-transform duration-fast ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-dropdown w-full min-w-[170px] overflow-hidden rounded-xl border-[1.5px] border-pine/30 bg-white p-1 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors duration-fast ${
              !value ? "bg-emerald text-white" : "text-ink/80 hover:bg-mint/60"
            }`}
          >
            All Cases
          </button>
          {CASE_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors duration-fast ${
                value === s ? "bg-emerald text-white" : "text-ink/80 hover:bg-mint/60"
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
