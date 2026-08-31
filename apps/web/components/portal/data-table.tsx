"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown as ChevronDownIcon } from "lucide-react";
import type { SortDir } from "@/lib/types/portal";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  className?: string;
}

function HeaderCheckbox({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-2 border-pine/40 accent-emerald"
    />
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  page,
  pageSize,
  total,
  onPageChange,
  sortBy,
  sortDir,
  onSortChange,
  onRowClick,
  renderActions,
  isLoading = false,
  emptyLabel = "Nothing to show yet.",
  selectedIds,
  onToggleRow,
  onToggleAll,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortDir?: SortDir;
  onSortChange?: (column: string) => void;
  onRowClick?: (row: T) => void;
  renderActions?: (row: T) => React.ReactNode;
  isLoading?: boolean;
  emptyLabel?: string;
  selectedIds?: Set<string>;
  onToggleRow?: (id: string) => void;
  onToggleAll?: () => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const selectable = !!selectedIds && !!onToggleRow && !!onToggleAll;
  const selectedOnPage = selectable ? rows.filter((r) => selectedIds!.has(rowKey(r))).length : 0;
  const extraCols = (selectable ? 1 : 0) + (renderActions ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-2xl border-[1.5px] border-pine/30 bg-white shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[#b8d5cc] bg-white">
              {selectable && (
                <th className="w-10 px-4 py-2.5">
                  <HeaderCheckbox
                    checked={rows.length > 0 && selectedOnPage === rows.length}
                    indeterminate={selectedOnPage > 0 && selectedOnPage < rows.length}
                    onChange={onToggleAll!}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-2.5 text-xs font-bold text-ink ${col.className ?? ""}`}>
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.(col.key)}
                      className="inline-flex items-center gap-1 hover:text-emerald"
                    >
                      {col.header}
                      {sortBy === col.key ? (
                        sortDir === "asc" ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDownIcon size={13} />
                        )
                      ) : (
                        <ChevronsUpDown size={13} className="text-ink/30" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {renderActions && <th className="px-4 py-2.5 text-xs font-bold text-ink">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-sm text-ink/50" colSpan={columns.length + extraCols}>
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm text-ink/50" colSpan={columns.length + extraCols}>
                  {emptyLabel}
                </td>
              </tr>
            )}
            {!isLoading &&
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`border-t border-[#c9ddd6] odd:bg-white even:bg-[#f4f9f6] ${
                    onRowClick ? "cursor-pointer transition-colors duration-fast hover:bg-mint/30" : ""
                  }`}
                >
                  {selectable && (
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds!.has(rowKey(row))}
                        onChange={() => onToggleRow!(rowKey(row))}
                        className="h-4 w-4 rounded border-2 border-pine/40 accent-emerald"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-2.5 text-sm text-ink/80 ${col.className ?? ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">{renderActions(row)}</div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mint px-4 py-3 text-xs text-ink/60">
        <span>
          {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-pine/25 text-pine transition-colors duration-fast hover:bg-mint/60 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-semibold text-ink">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-pine/25 text-pine transition-colors duration-fast hover:bg-mint/60 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
