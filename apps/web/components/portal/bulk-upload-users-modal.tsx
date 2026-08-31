"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { bulkCreateUsers } from "@/lib/api/client";
import { Button } from "@/components/portal/button";
import type { BulkCreateResult, BulkCreateUserRow } from "@/lib/types/portal";

const REQUIRED_COLUMNS = ["Name", "Email", "Role", "Organization"];
const MAX_ROWS = 100;

function normalizeHeader(h: string) {
  return h.trim().toLowerCase();
}

function downloadTemplate() {
  const worksheet = XLSX.utils.aoa_to_sheet([
    REQUIRED_COLUMNS,
    ["Jane Doe", "jane.doe@example.com", "Client", "Harborview Legal Group"],
    ["Sam Reviewer", "sam.reviewer@smartmedrecords.com", "Reviewer", ""],
  ]);
  worksheet["!cols"] = [{ wch: 20 }, { wch: 28 }, { wch: 12 }, { wch: 26 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
  XLSX.writeFile(workbook, "bulk-users-template.xlsx");
}

function parseRows(buffer: ArrayBuffer): BulkCreateUserRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  return raw
    .map((record) => {
      const byHeader = new Map(Object.entries(record).map(([k, v]) => [normalizeHeader(k), v]));
      return {
        name: String(byHeader.get("name") ?? "").trim(),
        email: String(byHeader.get("email") ?? "").trim(),
        role: String(byHeader.get("role") ?? "").trim(),
        organization: String(byHeader.get("organization") ?? "").trim() || undefined,
      };
    })
    .filter((row) => row.name || row.email);
}

export function BulkUploadUsersModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<BulkCreateUserRow[]>([]);
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<BulkCreateResult | null>(null);

  const uploadMutation = useMutation({
    mutationFn: () => bulkCreateUsers(rows),
    onSuccess: (data) => {
      setResult(data);
      if (data.created > 0) queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  function reset() {
    setFileName("");
    setRows([]);
    setParseError("");
    setResult(null);
    uploadMutation.reset();
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file: File) {
    setParseError("");
    setResult(null);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseRows(buffer);
      if (parsed.length === 0) {
        setParseError("No rows found — check the file has a header row and at least one user below it.");
        setRows([]);
        return;
      }
      if (parsed.length > MAX_ROWS) {
        setParseError(`This file has ${parsed.length} rows — up to ${MAX_ROWS} per upload.`);
        setRows([]);
        return;
      }
      setRows(parsed);
    } catch {
      setParseError("Could not read this file. Upload a .csv or .xlsx file.");
      setRows([]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-ink/40 px-4" onClick={handleClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="z-modal w-full max-w-xl rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_24px_60px_rgba(0,69,58,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-pine">Bulk Upload Users</h3>
            <p className="mt-1 text-sm text-ink/60">Upload a CSV or Excel file to add multiple users at once.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={downloadTemplate}>
              <Download size={14} />
              Download Template
            </Button>
            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 rounded-lg p-1.5 text-ink/40 transition-colors duration-fast hover:bg-mint/60 hover:text-ink"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border-[1.5px] border-dashed border-pine/25 bg-cream/50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <FileSpreadsheet size={16} className="text-emerald" />
            Required columns
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {REQUIRED_COLUMNS.map((c) => (
              <span key={c} className="rounded-full border border-pine/25 bg-white px-3 py-1 text-xs font-semibold text-ink/70">
                {c}
              </span>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-ink/50">
            Role must be one of: Client, Admin, Reviewer, Billing. Organization is only required for Client users —
            it must match an existing organization's name exactly.
          </p>
        </div>

        {!result && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
            onClick={() => inputRef.current?.click()}
            className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors duration-fast ${
              dragOver ? "border-emerald bg-mint/30" : "border-pine/25 hover:bg-mint/20"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            <UploadCloud size={28} className="text-ink/30" />
            {fileName ? (
              <span className="text-sm font-semibold text-pine">{fileName}</span>
            ) : (
              <>
                <span className="text-sm font-semibold text-ink">Click to upload or drag &amp; drop</span>
                <span className="text-xs text-ink/50">CSV or Excel (.xlsx) · Max {MAX_ROWS} rows</span>
              </>
            )}
          </div>
        )}

        {parseError && <p className="mt-3 text-sm text-red-700">{parseError}</p>}

        {!result && rows.length > 0 && (
          <p className="mt-3 text-sm font-semibold text-emerald">{rows.length} user{rows.length === 1 ? "" : "s"} ready to upload.</p>
        )}

        {uploadMutation.isError && (
          <p className="mt-3 text-sm text-red-700">
            {uploadMutation.error instanceof Error ? uploadMutation.error.message : "Could not upload users."}
          </p>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-4 rounded-xl border-[1.5px] border-pine/20 bg-cream/60 p-3 text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-emerald">
                <CheckCircle2 size={15} /> {result.created} created
              </span>
              {result.failed > 0 && (
                <span className="flex items-center gap-1.5 font-semibold text-red-600">
                  <AlertCircle size={15} /> {result.failed} failed
                </span>
              )}
            </div>
            {result.failed > 0 && (
              <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-red-100 bg-red-50 p-3">
                {result.results
                  .filter((r) => r.status === "failed")
                  .map((r) => (
                    <div key={r.row} className="text-xs text-red-700">
                      Row {r.row} ({r.email || "no email"}): {r.error}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          {result ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={rows.length === 0 || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading…" : `Upload ${rows.length || ""} user${rows.length === 1 ? "" : "s"}`}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
