"use client";
import { Suspense, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, File, LockKeyhole, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import { PageHeading } from "@/components/portal/page-heading";
import { getCases, uploadDocument } from "@/lib/api/client";

type QueuedFile = { file: File; status: "pending" | "uploading" | "done" | "error" };

export default function Upload() {
  return (
    <Suspense fallback={null}>
      <UploadInner />
    </Suspense>
  );
}

function UploadInner() {
  const params = useSearchParams();
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [caseId, setCaseId] = useState(params.get("caseId") ?? "");
  const [category, setCategory] = useState("MEDICAL_RECORDS");
  const [queue, setQueue] = useState<QueuedFile[]>([]);

  const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: () => getCases() });

  const mutation = useMutation({
    mutationFn: async () => {
      for (let i = 0; i < queue.length; i++) {
        setQueue((q) => q.map((f, idx) => (idx === i ? { ...f, status: "uploading" } : f)));
        try {
          await uploadDocument(caseId, queue[i].file, category);
          setQueue((q) => q.map((f, idx) => (idx === i ? { ...f, status: "done" } : f)));
        } catch {
          setQueue((q) => q.map((f, idx) => (idx === i ? { ...f, status: "error" } : f)));
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-documents", caseId] });
      qc.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });

  function add(list: FileList | null) {
    if (list) setQueue((p) => [...p, ...Array.from(list).map((file) => ({ file, status: "pending" as const }))]);
  }

  const allDone = queue.length > 0 && queue.every((f) => f.status === "done");

  return (
    <>
      <PageHeading
        eyebrow="Encrypted intake"
        title="Secure record upload"
        description="PDF, DOCX, TIFF, JPG, PNG · Up to 200 MB per file"
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border bg-white p-6">
          <label className="mb-2 block text-xs font-semibold">Assign to case</label>
          <select
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="mb-4 w-full rounded-lg border p-3 text-sm"
          >
            <option value="">Select a case…</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} · {c.matterName}
              </option>
            ))}
          </select>
          <label className="mb-2 block text-xs font-semibold">Document category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mb-6 w-full rounded-lg border p-3 text-sm"
          >
            {["MEDICAL_RECORDS", "IMAGING", "BILLING_RECORDS", "PHARMACY", "LEGAL_DOCUMENTS", "OTHER"].map((cat) => (
              <option key={cat} value={cat}>
                {cat.replaceAll("_", " ").toLowerCase()}
              </option>
            ))}
          </select>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              add(e.dataTransfer.files);
            }}
            onClick={() => input.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-emerald/30 bg-emerald/[.035] px-6 py-14 text-center hover:bg-emerald/[.06]"
          >
            <input ref={input} multiple type="file" className="hidden" onChange={(e) => add(e.target.files)} />
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-emerald">
              <UploadCloud />
            </span>
            <b className="mt-5 block text-sm text-pine">Drag and drop medical records here</b>
            <span className="mt-2 block text-xs text-slate-400">or click to browse from your device</span>
          </div>
          {queue.length > 0 && (
            <div className="mt-6 space-y-2">
              {queue.map((f, i) => (
                <div className="flex items-center gap-3 rounded-xl border p-4" key={f.file.name + i}>
                  <File size={19} className="text-emerald" />
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-xs">{f.file.name}</b>
                    <span className="text-[11px] text-slate-400">
                      {(f.file.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                      {{ pending: "Ready", uploading: "Uploading…", done: "Uploaded", error: "Failed" }[f.status]}
                    </span>
                  </div>
                  {f.status === "pending" && (
                    <button onClick={() => setQueue((x) => x.filter((_, n) => n !== i))}>
                      <Trash2 size={16} className="text-slate-400" />
                    </button>
                  )}
                  {f.status === "done" && <CheckCircle2 size={16} className="text-emerald" />}
                </div>
              ))}
            </div>
          )}
          <button
            disabled={!queue.length || !caseId || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="mt-6 w-full rounded-xl bg-emerald py-4 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
          >
            {mutation.isPending
              ? "Encrypting and uploading…"
              : `Encrypt and upload ${queue.length || ""} ${queue.length === 1 ? "file" : "files"}`}
          </button>
          {!caseId && queue.length > 0 && (
            <p className="mt-2 text-center text-xs text-red-600">Select a case before uploading.</p>
          )}
          {allDone && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald/10 p-4 text-sm text-emerald">
              <CheckCircle2 /> Upload complete.
            </div>
          )}
        </section>
        <aside className="space-y-4">
          <div className="portal-card rounded-2xl p-6 text-pine">
            <LockKeyhole className="text-gold" />
            <b className="mt-5 block text-sm">Protected at every step</b>
            <p className="mt-3 text-xs leading-6 text-slate-600">
              Files are stored per-case in encrypted-at-rest storage. Access is logged and limited to your
              authorized case team.
            </p>
          </div>
          {[
            ["Case-linked storage", "Every file is tied to the correct case record."],
            ["Access logging", "Uploads and downloads are recorded in the case activity log."],
            ["Category tagging", "Sort records as medical, imaging, billing, pharmacy, or legal."],
          ].map((x) => (
            <div className="rounded-xl border bg-white p-4" key={x[0]}>
              <div className="flex gap-2">
                <ShieldCheck size={16} className="text-emerald" />
                <b className="text-xs">{x[0]}</b>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">{x[1]}</p>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
