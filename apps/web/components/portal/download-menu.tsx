"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/portal/button";

export type DownloadFormat = "csv" | "excel" | "pdf";

const FORMAT_OPTIONS: { value: DownloadFormat; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { value: "csv", label: "CSV (.csv)", icon: FileText },
  { value: "excel", label: "Excel (.xlsx)", icon: FileSpreadsheet },
  { value: "pdf", label: "PDF (.pdf)", icon: FileText },
];

export function DownloadMenu({
  label = "Download",
  disabled = false,
  onSelect,
}: {
  label?: string;
  disabled?: boolean;
  onSelect: (format: DownloadFormat) => void;
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
      <Button
        type="button"
        variant="secondary"
        size="md"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <Download size={16} />
        {label}
        <ChevronDown size={14} className={`transition-transform duration-fast ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-dropdown w-44 overflow-hidden rounded-xl border-[1.5px] border-pine/30 bg-white p-1 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          {FORMAT_OPTIONS.map(({ value, label: optLabel, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setOpen(false);
                onSelect(value);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink/80 transition-colors duration-fast hover:bg-mint/60"
            >
              <Icon size={15} />
              {optLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
