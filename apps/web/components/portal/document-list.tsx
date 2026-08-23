"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, File as FileIcon, Lock } from "lucide-react";
import { downloadUrl, fetchDocuments, uploadDocument } from "@/lib/api/client";
import { getSession } from "@/lib/auth/session";
import type { CaseDocument } from "@/lib/types/portal";
import { Dropzone } from "@/components/portal/dropzone";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocRow({ caseId, doc }: { caseId: string; doc: CaseDocument }) {
  const session = getSession();
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border-2 border-pine/20 bg-cream px-4 py-3">
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
        <a
          href={session ? `${downloadUrl(caseId, doc.id)}` : "#"}
          onClick={async (e) => {
            if (!session) return;
            e.preventDefault();
            const res = await fetch(downloadUrl(caseId, doc.id), {
              headers: { Authorization: `Bearer ${session.token}` },
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
      )}
    </li>
  );
}

export function DocumentList({
  caseId,
  canUpload,
  uploadLabel = "Upload additional records",
}: {
  caseId: string;
  canUpload: boolean;
  uploadLabel?: string;
}) {
  const queryClient = useQueryClient();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

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
              <DocRow key={doc.id} caseId={caseId} doc={doc} />
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
                <DocRow key={doc.id} caseId={caseId} doc={doc} />
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
