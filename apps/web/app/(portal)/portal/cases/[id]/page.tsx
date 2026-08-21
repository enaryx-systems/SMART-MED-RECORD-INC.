"use client";
import { use, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  Download,
  FileText,
  Pause,
  Send,
  ShieldCheck,
  UploadCloud,
  UserRound,
} from "lucide-react";
import {
  ApiError,
  downloadDocument,
  getActivity,
  getCase,
  getCases,
  listDocuments,
  listInvoices,
  listMessages,
  markInvoicePaid,
  sendMessage,
  uploadDocument,
} from "@/lib/api/client";
import { StatusPill } from "@/components/portal/status-pill";
import { CaseActions, roleCanUpload } from "@/components/portal/case-actions";
import { formatBytes, formatCents, formatDate, formatDateTime, formatRelative } from "@/lib/format";
import { useSession } from "@/lib/auth/session";
import { CaseRecord } from "@/lib/types/portal";

const STATUS_ORDER = [
  "AWAITING_APPROVAL",
  "IN_PROCESSING",
  "UNDER_REVIEW",
  "FINAL_AUDIT",
  "DELIVERED",
  "FOLLOW_UP",
  "PAYMENT_PENDING",
  "CLOSED",
] as const;

function milestonesFor(c: CaseRecord) {
  const idx = STATUS_ORDER.indexOf(c.status);
  return [
    { label: "Approval", done: !!c.approvedAt, date: c.approvedAt },
    { label: "Assigned", done: !!c.assignedAt, date: c.assignedAt },
    { label: "Processing", done: idx > 1, date: null as string | null },
    { label: "Review", done: idx > 2, date: null as string | null },
    { label: "Final QC", done: idx > 3, date: null as string | null },
    { label: "Delivered", done: !!c.deliveredAt, date: c.deliveredAt },
    { label: "Follow-up", done: idx > 5, date: null as string | null },
    { label: "Payment", done: idx > 6, date: null as string | null },
    { label: "Closed", done: !!c.closedAt, date: c.closedAt },
  ];
}

type TabKey = "overview" | "documents" | "messages" | "billing" | "activity";

export default function CaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { session } = useSession();
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<TabKey>("overview");
  const [category, setCategory] = useState("MEDICAL_RECORDS");
  const [messageBody, setMessageBody] = useState("");
  const [messageVisibility, setMessageVisibility] = useState<"CLIENT" | "INTERNAL">("CLIENT");
  const [uploadError, setUploadError] = useState("");

  const { data: c, isLoading } = useQuery({ queryKey: ["case", id], queryFn: () => getCase(id) });
  const { data: allCases = [] } = useQuery({ queryKey: ["cases"], queryFn: () => getCases() });
  const { data: documents = [] } = useQuery({
    queryKey: ["case-documents", id],
    queryFn: () => listDocuments(id),
    enabled: !!c,
  });
  const { data: messages = [] } = useQuery({
    queryKey: ["case-messages", id],
    queryFn: () => listMessages(id),
    enabled: !!c,
  });
  const { data: activity = [] } = useQuery({
    queryKey: ["case-activity", id],
    queryFn: () => getActivity(id),
    enabled: !!c,
  });
  const role = session?.user.role;
  const showBilling = role !== "physician" && role !== "reviewer";
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices", id],
    queryFn: () => listInvoices({ caseId: id }),
    enabled: !!c && showBilling,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocument(id, file, category),
    onSuccess: () => {
      setUploadError("");
      qc.invalidateQueries({ queryKey: ["case-documents", id] });
      qc.invalidateQueries({ queryKey: ["case", id] });
    },
    onError: (err) => setUploadError(err instanceof ApiError ? err.message : "Upload failed"),
  });

  const messageMutation = useMutation({
    mutationFn: () => sendMessage(id, messageBody, messageVisibility),
    onSuccess: () => {
      setMessageBody("");
      qc.invalidateQueries({ queryKey: ["case-messages", id] });
    },
  });

  const payMutation = useMutation({
    mutationFn: (invoiceId: string) => markInvoicePaid(invoiceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices", id] });
      qc.invalidateQueries({ queryKey: ["case", id] });
    },
  });

  if (isLoading || !c) {
    return <div className="py-20 text-center text-sm text-slate-400">Loading case…</div>;
  }

  const canUpload = roleCanUpload(role);
  const canPay = role === "billing" || role === "case-manager" || role === "admin";
  const milestones = milestonesFor(c);
  const currentIndex = milestones.findIndex((m) => !m.done);

  const orderedIds = allCases.map((x) => x.id);
  const myIndex = orderedIds.indexOf(c.id);
  const prevCase = myIndex > 0 ? allCases[myIndex - 1] : null;
  const nextCase = myIndex >= 0 && myIndex < allCases.length - 1 ? allCases[myIndex + 1] : null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "documents", label: `Documents${documents.length ? ` (${documents.length})` : ""}` },
    { key: "messages", label: `Messages${messages.length ? ` (${messages.length})` : ""}` },
    ...(showBilling ? [{ key: "billing" as TabKey, label: "Billing" }] : []),
    { key: "activity", label: "Activity" },
  ];
  const activeTabLabel = tabs.find((t) => t.key === tab)?.label ?? "Overview";

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link href="/portal/cases" className="flex items-center gap-1 hover:text-emerald">
          <ArrowLeft size={13} /> Cases
        </Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="font-medium text-pine">{c.caseNumber}</span>
        <ChevronRight size={13} className="text-slate-300" />
        <span>{activeTabLabel.replace(/\s\(\d+\)$/, "")}</span>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl text-pine">{c.matterName}</h1>
            <StatusPill status={c.status} label={c.statusLabel} onHold={c.onHold} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {c.caseNumber} · {c.clientName} · {c.service}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={prevCase ? `/portal/cases/${prevCase.id}` : "#"}
            aria-disabled={!prevCase}
            className={`flex items-center gap-1 rounded-lg border bg-white px-3 py-2.5 text-xs font-semibold ${prevCase ? "text-pine hover:bg-cream" : "pointer-events-none text-slate-300"}`}
          >
            <ArrowLeft size={14} /> Previous
          </Link>
          <Link
            href={nextCase ? `/portal/cases/${nextCase.id}` : "#"}
            aria-disabled={!nextCase}
            className={`flex items-center gap-1 rounded-lg border bg-white px-3 py-2.5 text-xs font-semibold ${nextCase ? "text-pine hover:bg-cream" : "pointer-events-none text-slate-300"}`}
          >
            Next <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <section className="mt-6 overflow-x-auto rounded-2xl border bg-white p-6">
        <div className="thin-scroll flex min-w-[720px] items-start justify-between gap-1">
          {milestones.map((m, i) => {
            const isCurrent = i === currentIndex;
            return (
              <div key={m.label} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : m.done || isCurrent ? "bg-emerald" : "bg-slate-200"}`} />
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                      m.done
                        ? "border-emerald bg-emerald text-white"
                        : isCurrent
                          ? c.onHold
                            ? "border-amber-400 bg-amber-50 text-amber-600"
                            : "border-gold bg-gold/10 text-pine"
                          : "border-slate-200 bg-white text-slate-300"
                    }`}
                  >
                    {m.done ? <Check size={15} /> : isCurrent && c.onHold ? <Pause size={13} /> : i + 1}
                  </span>
                  <div className={`h-0.5 flex-1 ${i === milestones.length - 1 ? "opacity-0" : m.done ? "bg-emerald" : "bg-slate-200"}`} />
                </div>
                <b className={`mt-2 block text-[11px] leading-tight ${isCurrent ? "text-pine" : "text-slate-500"}`}>{m.label}</b>
                <span className="mt-0.5 block text-[10px] text-slate-400">{m.date ? formatDate(m.date) : isCurrent ? "Current step" : ""}</span>
              </div>
            );
          })}
        </div>
      </section>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-mint">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === t.key ? "border-emerald text-pine" : "border-transparent text-slate-400 hover:text-pine"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="space-y-6">
              <CaseActions caseRecord={c} />
              {c.instructions && (
                <section className="rounded-2xl border bg-white p-5">
                  <b className="text-sm">Instructions</b>
                  <p className="mt-3 text-xs leading-6 text-slate-600">{c.instructions}</p>
                </section>
              )}
              <section className="rounded-2xl border bg-white p-5">
                <b className="text-sm">Case team</b>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {[
                    ["Creator", c.creator],
                    ["Assignee", c.assignee],
                    ["Reviewer", c.reviewer],
                    ["Final auditor", c.qcBy],
                  ].map(([label, person]) => (
                    <div className="flex items-center gap-3" key={label as string}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine text-[11px] font-bold text-white">
                        {person && typeof person === "object" && "name" in person
                          ? person.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
                          : "—"}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[10px] uppercase text-slate-400">{label as string}</span>
                        <b className="block truncate text-xs">
                          {person && typeof person === "object" && "name" in person ? person.name : "Unassigned"}
                        </b>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <aside className="space-y-6">
              <section className="rounded-2xl border bg-white p-5">
                <b className="text-sm">Case details</b>
                <div className="mt-5 space-y-4">
                  {[
                    [UserRound, "Client", c.clientName],
                    [Calendar, "Due date", formatDate(c.dueAt)],
                    [FileText, "Service", c.service],
                    [FileText, "Priority", c.priority],
                    [ShieldCheck, "Security", "Encrypted workspace"],
                  ].map(([I, a, b]) => {
                    const Icon = I as typeof UserRound;
                    return (
                      <div className="flex gap-3" key={a as string}>
                        <Icon size={17} className="text-emerald" />
                        <div>
                          <span className="block text-[10px] uppercase text-slate-400">{a as string}</span>
                          <b className="text-xs">{b as string}</b>
                        </div>
                      </div>
                    );
                  })}
                  {c.matterNumber && (
                    <div className="flex gap-3">
                      <FileText size={17} className="text-emerald" />
                      <div>
                        <span className="block text-[10px] uppercase text-slate-400">Matter number</span>
                        <b className="text-xs">{c.matterNumber}</b>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        )}

        {tab === "documents" && (
          <section className="overflow-hidden rounded-2xl border bg-white">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <b className="text-sm">Documents</b>
              {canUpload && (
                <div className="flex items-center gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-lg border px-2 py-1.5 text-[11px] outline-none"
                  >
                    {["MEDICAL_RECORDS", "IMAGING", "BILLING_RECORDS", "PHARMACY", "LEGAL_DOCUMENTS", "OTHER"].map(
                      (cat) => (
                        <option key={cat} value={cat}>
                          {cat.replaceAll("_", " ").toLowerCase()}
                        </option>
                      ),
                    )}
                  </select>
                  <button
                    onClick={() => fileInput.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-emerald px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
                  >
                    <UploadCloud size={14} /> {uploadMutation.isPending ? "Uploading…" : "Upload"}
                  </button>
                  <input
                    ref={fileInput}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadMutation.mutate(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}
            </div>
            {uploadError && <p className="px-6 pt-3 text-xs text-red-600">{uploadError}</p>}
            {documents.length === 0 && (
              <p className="px-6 py-8 text-center text-xs text-slate-400">No documents uploaded yet.</p>
            )}
            {documents.map((d) => (
              <div className="flex items-center gap-4 border-b px-6 py-4 last:border-0" key={d.id}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-pine">
                  <FileText size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-xs">{d.name}</b>
                  <span className="text-[11px] text-slate-400">
                    {formatBytes(d.size)} · {d.category.replaceAll("_", " ").toLowerCase()} · {formatRelative(d.createdAt)}
                  </span>
                </div>
                <button onClick={() => downloadDocument(id, d.id, d.name)} aria-label={`Download ${d.name}`}>
                  <Download size={16} className="text-slate-400 hover:text-emerald" />
                </button>
              </div>
            ))}
          </section>
        )}

        {tab === "messages" && (
          <section className="overflow-hidden rounded-2xl border bg-white">
            <div className="max-h-[420px] space-y-4 overflow-y-auto p-6">
              {messages.length === 0 && <p className="text-center text-xs text-slate-400">No messages yet.</p>}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-md rounded-2xl p-4 text-sm ${
                    m.user.id === session?.user.id ? "ml-auto bg-pine text-white" : "bg-slate-100"
                  }`}
                >
                  <p>{m.body}</p>
                  <span
                    className={`mt-2 block text-[10px] ${m.user.id === session?.user.id ? "text-white/60" : "text-slate-400"}`}
                  >
                    {m.user.name} · {formatRelative(m.createdAt)}
                    {m.visibility === "INTERNAL" ? " · internal" : ""}
                  </span>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (messageBody.trim()) messageMutation.mutate();
              }}
              className="flex flex-wrap items-center gap-2 border-t p-4"
            >
              {role !== "attorney" && (
                <select
                  value={messageVisibility}
                  onChange={(e) => setMessageVisibility(e.target.value as "CLIENT" | "INTERNAL")}
                  className="rounded-lg border px-2 py-2.5 text-[11px] outline-none"
                >
                  <option value="CLIENT">Client-visible</option>
                  <option value="INTERNAL">Internal only</option>
                </select>
              )}
              <input
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="min-w-[180px] flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-emerald"
                placeholder="Write a secure message…"
              />
              <button className="rounded-xl bg-emerald p-2.5 text-white" aria-label="Send">
                <Send size={17} />
              </button>
            </form>
          </section>
        )}

        {tab === "billing" && showBilling && (
          <section className="overflow-hidden rounded-2xl border bg-white">
            {invoices.length === 0 && <p className="px-6 py-10 text-center text-xs text-slate-400">No invoices yet.</p>}
            {invoices.map((inv) => (
              <div className="flex items-center gap-4 border-b px-6 py-4 last:border-0" key={inv.id}>
                <div className="min-w-0 flex-1">
                  <b className="block text-xs">{inv.number}</b>
                  <span className="text-[11px] text-slate-400">
                    {formatCents(inv.amountCents)} · Due {formatDate(inv.dueAt)}
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                    inv.status === "PAID" ? "bg-emerald/10 text-emerald" : "bg-cream text-[#8a6425]"
                  }`}
                >
                  {inv.status}
                </span>
                {canPay && inv.status !== "PAID" && (
                  <button
                    onClick={() => payMutation.mutate(inv.id)}
                    className="rounded-lg border border-emerald/30 px-3 py-1.5 text-[11px] font-semibold text-emerald hover:bg-emerald/5"
                  >
                    Mark paid
                  </button>
                )}
              </div>
            ))}
          </section>
        )}

        {tab === "activity" && (
          <section className="rounded-2xl border bg-white p-5">
            <div className="space-y-5">
              {activity.length === 0 && <p className="text-xs text-slate-400">No activity recorded yet.</p>}
              {activity.map((a) => (
                <div className="relative border-l border-mint pl-4" key={a.id}>
                  <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-emerald" />
                  <b className="block text-xs">{a.action.replaceAll("_", " ").toLowerCase()}</b>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    {a.user.name} · {formatDateTime(a.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
