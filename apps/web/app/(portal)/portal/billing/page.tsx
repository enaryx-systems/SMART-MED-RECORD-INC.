"use client";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { PageHeading } from "@/components/portal/page-heading";
import { listInvoices, markInvoicePaid } from "@/lib/api/client";
import { formatCents, formatDate } from "@/lib/format";
import { useSession } from "@/lib/auth/session";

export default function Billing() {
  const { session } = useSession();
  const qc = useQueryClient();
  const { data: invoices = [] } = useQuery({ queryKey: ["invoices"], queryFn: () => listInvoices() });

  const payMutation = useMutation({
    mutationFn: (id: string) => markInvoicePaid(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const canPay = ["billing", "case-manager", "admin"].includes(session?.user.role ?? "");
  const pending = invoices.filter((i) => i.status === "PENDING");
  const paidThisMonth = invoices.filter((i) => {
    if (i.status !== "PAID" || !i.paidAt) return false;
    const paid = new Date(i.paidAt);
    const now = new Date();
    return paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear();
  });

  const outstandingCents = pending.reduce((sum, i) => sum + i.amountCents, 0);
  const paidCents = paidThisMonth.reduce((sum, i) => sum + i.amountCents, 0);

  return (
    <>
      <PageHeading
        eyebrow="Payments & invoices"
        title="Billing"
        description="Review case charges, invoices, and payment status."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Outstanding balance", formatCents(outstandingCents)],
          ["Pending invoices", String(pending.length)],
          ["Paid this month", formatCents(paidCents)],
        ].map(([a, b], i) => (
          <div
            key={a}
            className={`portal-card-hover rounded-2xl border border-[#B8D5CC] p-5 shadow-card ${["bg-ivory", "bg-mint", "bg-[#EAF2EE]"][i]}`}
          >
            <span className="text-xs text-slate-500">{a}</span>
            <b className="mt-2 block text-2xl text-pine">{b}</b>
          </div>
        ))}
      </div>
      <section className="portal-card-white mt-6 overflow-hidden rounded-2xl">
        <div className="border-b border-mint bg-mint p-5">
          <b className="text-sm">Invoices</b>
        </div>
        {invoices.length === 0 && (
          <p className="px-6 py-10 text-center text-xs text-slate-400">No invoices yet.</p>
        )}
        {invoices.map((inv, i) => (
          <div
            key={inv.id}
            className={`flex items-center gap-4 border-b px-5 py-4 last:border-0 ${i % 2 ? "bg-ivory" : "bg-cream"}`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-pine/10 bg-mint text-pine shadow-sm">
              <FileText size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <b className="block text-xs">{inv.number}</b>
              <span className="mt-1 block text-[11px] text-slate-500">
                {inv.case ? (
                  <Link href={`/portal/cases/${inv.case.id}`} className="hover:text-emerald">
                    {inv.case.caseNumber} · {inv.case.matterName}
                  </Link>
                ) : (
                  inv.caseId
                )}{" "}
                · {formatCents(inv.amountCents)} · Due {formatDate(inv.dueAt)}
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
    </>
  );
}
