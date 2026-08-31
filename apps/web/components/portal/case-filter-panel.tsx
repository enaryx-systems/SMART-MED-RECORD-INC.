"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/portal/button";
import { CASE_STATUSES, CASE_TYPE_LABEL, STATUS_LABEL, type CaseStatus, type CaseType } from "@/lib/types/portal";
import { CREATED_RANGE_OPTIONS, monthKeyLabel, type CreatedRangePreset } from "@/lib/utils/date-range";

const CASE_TYPE_OPTIONS = (Object.keys(CASE_TYPE_LABEL) as CaseType[]).map((t) => ({ value: t, label: CASE_TYPE_LABEL[t] }));

export interface CaseFilterState {
  statuses: CaseStatus[];
  caseTypes: CaseType[];
  ownerIds: string[];
  reviewerIds: string[];
  createdRange: CreatedRangePreset;
  createdMonth: string | null;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function CaseFilterPanel({
  clientOptions,
  reviewerOptions,
  monthOptions,
  value,
  onApply,
}: {
  clientOptions: { value: string; label: string }[];
  reviewerOptions: { value: string; label: string }[];
  monthOptions: string[];
  value: CaseFilterState;
  onApply: (next: CaseFilterState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CaseFilterState>(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDraft(value);
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

  const activeCount =
    value.statuses.length +
    value.caseTypes.length +
    value.ownerIds.length +
    value.reviewerIds.length +
    (value.createdRange || value.createdMonth ? 1 : 0);

  const draftCount =
    draft.statuses.length +
    draft.caseTypes.length +
    draft.ownerIds.length +
    draft.reviewerIds.length +
    (draft.createdRange || draft.createdMonth ? 1 : 0);

  const emptyFilters: CaseFilterState = {
    statuses: [],
    caseTypes: [],
    ownerIds: [],
    reviewerIds: [],
    createdRange: "",
    createdMonth: null,
  };

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
        <div className="absolute right-0 top-[calc(100%+8px)] z-dropdown w-[760px] max-w-[94vw] overflow-hidden rounded-2xl border-[1.5px] border-pine/30 bg-white shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
          <div className="grid grid-cols-2 divide-x divide-y divide-mint sm:grid-cols-4 sm:divide-y-0">
            <div className="p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                Status
              </div>
              <div className="no-scrollbar max-h-44 space-y-1 overflow-y-auto pr-1">
                {CASE_STATUSES.map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/80 hover:bg-mint/40">
                    <input
                      type="checkbox"
                      checked={draft.statuses.includes(s)}
                      onChange={() => setDraft((d) => ({ ...d, statuses: toggle(d.statuses, s) }))}
                      className="h-4 w-4 rounded border-2 border-pine/40 accent-emerald"
                    />
                    {STATUS_LABEL[s]}
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-pine" />
                Case Type
              </div>
              <div className="no-scrollbar max-h-44 space-y-1 overflow-y-auto pr-1">
                {CASE_TYPE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/80 hover:bg-mint/40">
                    <input
                      type="checkbox"
                      checked={draft.caseTypes.includes(opt.value)}
                      onChange={() => setDraft((d) => ({ ...d, caseTypes: toggle(d.caseTypes, opt.value) }))}
                      className="h-4 w-4 rounded border-2 border-pine/40 accent-emerald"
                    />
                    <span className="truncate">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Client
              </div>
              <div className="no-scrollbar max-h-44 space-y-1 overflow-y-auto pr-1">
                {clientOptions.length === 0 && <p className="px-2 py-1.5 text-sm text-ink/40">No clients yet.</p>}
                {clientOptions.map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/80 hover:bg-mint/40">
                    <input
                      type="checkbox"
                      checked={draft.ownerIds.includes(opt.value)}
                      onChange={() => setDraft((d) => ({ ...d, ownerIds: toggle(d.ownerIds, opt.value) }))}
                      className="h-4 w-4 rounded border-2 border-pine/40 accent-emerald"
                    />
                    <span className="truncate">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C5295]" />
                Reviewer
              </div>
              <div className="no-scrollbar max-h-44 space-y-1 overflow-y-auto pr-1">
                {reviewerOptions.length === 0 && <p className="px-2 py-1.5 text-sm text-ink/40">No reviewers yet.</p>}
                {reviewerOptions.map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/80 hover:bg-mint/40">
                    <input
                      type="checkbox"
                      checked={draft.reviewerIds.includes(opt.value)}
                      onChange={() => setDraft((d) => ({ ...d, reviewerIds: toggle(d.reviewerIds, opt.value) }))}
                      className="h-4 w-4 rounded border-2 border-pine/40 accent-emerald"
                    />
                    <span className="truncate">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-mint p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-pine" />
              Created
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CREATED_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value || "all"}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, createdRange: opt.value, createdMonth: null }))}
                  className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-colors duration-fast ${
                    draft.createdRange === opt.value && !draft.createdMonth
                      ? "border-emerald bg-emerald text-white"
                      : "border-pine/20 text-ink/70 hover:bg-mint/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {monthOptions.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, createdMonth: key, createdRange: "" }))}
                  className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-colors duration-fast ${
                    draft.createdMonth === key
                      ? "border-emerald bg-emerald text-white"
                      : "border-pine/20 text-ink/70 hover:bg-mint/40"
                  }`}
                >
                  {monthKeyLabel(key)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-mint px-4 py-3">
            <span className="text-xs text-ink/50">{draftCount} selected</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={() => setDraft(emptyFilters)}>
                <RotateCcw size={14} />
                Reset
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onApply(draft);
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
