"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  File as FileIcon,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  downloadUrl,
  fetchDocuments,
  fetchExtraction,
  triggerExtraction,
  uploadDocument,
} from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth/token";
import { useCaseRealtime } from "@/lib/realtime/use-case-realtime";
import type { CaseDocument, ExtractionStatus } from "@/lib/types/portal";
import { Dropzone } from "@/components/portal/dropzone";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_LABEL: Record<ExtractionStatus, string> = {
  PENDING: "Queued",
  PROCESSING: "Analyzing…",
  COMPLETE: "AI extracted",
  FAILED: "Extraction failed",
};

function ExtractionChip({
  caseId,
  doc,
  canManage,
}: {
  caseId: string;
  doc: CaseDocument;
  canManage: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const status = doc.extraction?.status;

  const { data: extraction } = useQuery({
    queryKey: ["extraction", doc.id],
    queryFn: () => fetchExtraction(caseId, doc.id),
    enabled: expanded && status === "COMPLETE",
  });

  const retry = useMutation({
    mutationFn: () => triggerExtraction(caseId, doc.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents", caseId] }),
  });

  if (!status) return null;

  return (
    <div className="mt-2 w-full">
      <button
        type="button"
        onClick={() => status === "COMPLETE" && setExpanded((e) => !e)}
        className={`flex items-center gap-1.5 text-xs font-semibold ${
          status === "COMPLETE" ? "cursor-pointer text-emerald" : "text-ink/40"
        }`}
      >
        {status === "PROCESSING" || status === "PENDING" ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Sparkles size={12} />
        )}
        {STATUS_LABEL[status]}
        {status === "COMPLETE" && (
          <ChevronDown
            size={12}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        )}
        {status === "FAILED" && canManage && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              retry.mutate();
            }}
            className="ml-1 underline"
          >
            Retry
          </span>
        )}
      </button>

      {expanded && extraction?.structuredData && (
        <div className="mt-2 space-y-1 rounded-lg bg-mint/40 p-3 text-xs text-ink/70">
          {extraction.structuredData.documentType && (
            <div>
              <span className="font-semibold text-ink">Type: </span>
              {extraction.structuredData.documentType}
            </div>
          )}
          {extraction.structuredData.providerName && (
            <div>
              <span className="font-semibold text-ink">Provider: </span>
              {extraction.structuredData.providerName}
            </div>
          )}
          {extraction.structuredData.datesOfService.length > 0 && (
            <div>
              <span className="font-semibold text-ink">Dates: </span>
              {extraction.structuredData.datesOfService.join(", ")}
            </div>
          )}
          {extraction.structuredData.diagnoses.length > 0 && (
            <div>
              <span className="font-semibold text-ink">Diagnoses: </span>
              {extraction.structuredData.diagnoses.join(", ")}
            </div>
          )}
          {extraction.structuredData.summary && <p>{extraction.structuredData.summary}</p>}
        </div>
      )}
    </div>
  );
}

function DocPreview({
  mimeType,
  fileName,
  url,
}: {
  mimeType: string;
  fileName: string;
  url: string;
}) {
  if (mimeType === "application/pdf") {
    return (
      <iframe
        src={url}
        title={fileName}
        className="h-[70vh] w-full rounded-xl border-2 border-pine/20 bg-white"
      />
    );
  }
  if (mimeType.startsWith("image/")) {
    return (
      <img
        src={url}
        alt={fileName}
        className="max-h-[70vh] w-full rounded-xl border-2 border-pine/20 bg-ink/5 object-contain"
      />
    );
  }
  return (
    <p className="rounded-xl border-2 border-pine/20 bg-mint/20 px-4 py-6 text-center text-sm text-ink/50">
      Preview isn&rsquo;t available for this file type — use download instead.
    </p>
  );
}

function DocRow({
  caseId,
  doc,
  canManageExtraction,
}: {
  caseId: string;
  doc: CaseDocument;
  canManageExtraction: boolean;
}) {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (viewUrl) URL.revokeObjectURL(viewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleView() {
    if (viewUrl) {
      URL.revokeObjectURL(viewUrl);
      setViewUrl(null);
      return;
    }
    setViewLoading(true);
    const token = await getAuthToken();
    if (!token) {
      setViewLoading(false);
      return;
    }
    const res = await fetch(downloadUrl(caseId, doc.id), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    setViewUrl(URL.createObjectURL(blob));
    setViewLoading(false);
  }

  return (
    <li className="rounded-xl border-2 border-pine/20 bg-cream px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileIcon className="shrink-0 text-emerald" size={16} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-ink">{doc.fileName}</div>
            <div className="text-xs text-ink/50">{formatBytes(doc.size)}</div>
          </div>
        </div>
        {doc.locked ? (
          <span
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-bold text-gold"
            title="This deliverable unlocks once the case's invoice is paid."
          >
            <Lock size={13} />
            Available after payment
          </span>
        ) : (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={toggleView}
              disabled={viewLoading}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-fast ${
                viewUrl ? "bg-mint text-emerald" : "text-ink/60 hover:bg-mint hover:text-emerald"
              }`}
              aria-label={`${viewUrl ? "Hide" : "View"} ${doc.fileName}`}
            >
              {viewLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : viewUrl ? (
                <EyeOff size={14} />
              ) : (
                <Eye size={14} />
              )}
              {viewUrl ? "Hide" : "View"}
            </button>
            <a
              href={downloadUrl(caseId, doc.id)}
              onClick={async (e) => {
                e.preventDefault();
                const token = await getAuthToken();
                if (!token) return;
                const res = await fetch(downloadUrl(caseId, doc.id), {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = doc.fileName;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="shrink-0 rounded-full p-2 text-ink/50 transition-colors duration-fast hover:bg-mint hover:text-emerald"
              aria-label={`Download ${doc.fileName}`}
            >
              <Download size={16} />
            </a>
          </div>
        )}
      </div>
      {viewUrl && (
        <div className="mt-3">
          <DocPreview mimeType={doc.mimeType} fileName={doc.fileName} url={viewUrl} />
        </div>
      )}
      {doc.kind === "CLIENT_UPLOAD" && (
        <ExtractionChip caseId={caseId} doc={doc} canManage={canManageExtraction} />
      )}
    </li>
  );
}

export function DocumentList({
  caseId,
  canUpload,
  canManageExtraction = false,
  uploadLabel = "Upload additional records",
}: {
  caseId: string;
  canUpload: boolean;
  canManageExtraction?: boolean;
  uploadLabel?: string;
}) {
  const queryClient = useQueryClient();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  useCaseRealtime(caseId);

  const { data, isLoading } = useQuery({
    queryKey: ["documents", caseId],
    queryFn: () => fetchDocuments(caseId),
  });

  const mutation = useMutation({
    mutationFn: (file: File) => uploadDocument(caseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", caseId] });
      queryClient.invalidateQueries({ queryKey: ["case-events", caseId] });
    },
  });

  async function handleAdd(files: File[]) {
    setPendingFiles((p) => [...p, ...files]);
    for (const file of files) {
      await mutation.mutateAsync(file);
      setPendingFiles((p) => p.filter((f) => f !== file));
    }
  }

  const clientUploads = data?.filter((d) => d.kind === "CLIENT_UPLOAD") ?? [];
  const deliverables = data?.filter((d) => d.kind === "DELIVERABLE") ?? [];

  return (
    <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
      <h3 className="mb-4 text-lg font-semibold text-pine">Documents</h3>

      {isLoading && <p className="text-sm text-ink/50">Loading documents…</p>}

      {!isLoading && deliverables.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">
            Delivered by Smart Med Records
          </div>
          <ul className="space-y-2">
            {deliverables.map((doc) => (
              <DocRow
                key={doc.id}
                caseId={caseId}
                doc={doc}
                canManageExtraction={canManageExtraction}
              />
            ))}
          </ul>
        </div>
      )}

      {!isLoading && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
            Submitted records
          </div>
          {clientUploads.length === 0 ? (
            <p className="text-sm text-ink/50">No records uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {clientUploads.map((doc) => (
                <DocRow
                  key={doc.id}
                  caseId={caseId}
                  doc={doc}
                  canManageExtraction={canManageExtraction}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {canUpload && (
        <div className="mt-5 border-t border-mint pt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
            {uploadLabel}
          </div>
          <Dropzone files={pendingFiles} onAdd={handleAdd} onRemove={() => {}} />
        </div>
      )}
    </div>
  );
}
