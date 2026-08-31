"use client";

import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export interface FilterColumnOption {
  value: string;
  label: string;
}

export interface FilterColumn {
  key: string;
  label: string;
  dotColor: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterColumnOption[];
}

function FilterColumnList({ column }: { column: FilterColumn }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: column.dotColor }} />
        <span className="text-xs font-bold uppercase tracking-wide text-ink/60">
          {column.label}
        </span>
      </div>
      <ul className="no-scrollbar max-h-44 space-y-1 overflow-y-auto pr-1">
        {column.options.map((option) => (
          <li key={option.value}>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1 text-sm text-ink hover:bg-mint/40">
              <input
                type="checkbox"
                checked={column.value === option.value}
                onChange={() => column.onChange(column.value === option.value ? "" : option.value)}
                className="h-4 w-4 shrink-0 rounded border-2 border-pine/40 accent-emerald"
              />
              <span className="truncate">{option.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SearchFilterBar({
  search,
  onSearchChange,
  placeholder = "Search…",
  columns,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  columns: FilterColumn[];
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

  const activeCount = columns.filter((c) => c.value).length;

  return (
    <div
      className="relative flex min-w-[260px] items-center gap-1 rounded-lg border-2 border-pine/25 bg-white pl-3 pr-1.5"
      ref={ref}
    >
      <Search size={16} className="shrink-0 text-ink/40" />
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 flex-1 bg-transparent px-2 text-sm text-ink outline-none placeholder:text-ink/40"
      />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Filters"
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-fast ${
          open || activeCount > 0
            ? "bg-mint/70 text-emerald"
            : "text-ink/50 hover:bg-mint/40 hover:text-ink"
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
        <div className="absolute right-0 top-[calc(100%+8px)] z-dropdown grid w-[min(96vw,820px)] grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border-[1.5px] border-pine/20 bg-white p-5 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)] sm:grid-cols-4">
          {columns.map((column) => (
            <FilterColumnList key={column.key} column={column} />
          ))}
        </div>
      )}
    </div>
  );
}
