"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "@/components/portal/page-heading";
import { services } from "@/lib/data/services";
export default function NewCase() {
  const router = useRouter();
  return (
    <>
      <Link
        href="/portal/cases"
        className="mb-5 inline-flex items-center gap-2 text-xs text-slate-500"
      >
        <ArrowLeft size={15} /> Cancel
      </Link>
      <PageHeading
        eyebrow="New matter"
        title="Create a case"
        description="Start an intake and upload records now or later."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/portal/upload");
        }}
        className="max-w-3xl rounded-2xl border bg-white p-7"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            Client name
            <input
              required
              className="mt-2 w-full rounded-lg border p-3 text-sm outline-none focus:border-emerald"
              placeholder="Full legal name"
            />
          </label>
          <label className="text-xs font-semibold">
            Matter name
            <input
              required
              className="mt-2 w-full rounded-lg border p-3 text-sm outline-none focus:border-emerald"
              placeholder="Smith v. Northstar"
            />
          </label>
          <label className="text-xs font-semibold">
            Service
            <select className="mt-2 w-full rounded-lg border p-3 text-sm outline-none">
              {services.map((x) => (
                <option key={x[0]}>{x[0]}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold">
            Priority
            <select className="mt-2 w-full rounded-lg border p-3 text-sm outline-none">
              <option>Standard (24–48 hrs)</option>
              <option>Urgent</option>
            </select>
          </label>
          <label className="text-xs font-semibold">
            Due date
            <input
              type="date"
              className="mt-2 w-full rounded-lg border p-3 text-sm outline-none"
            />
          </label>
          <label className="text-xs font-semibold">
            Reference / docket number
            <input
              className="mt-2 w-full rounded-lg border p-3 text-sm outline-none"
              placeholder="Optional"
            />
          </label>
        </div>
        <label className="mt-5 block text-xs font-semibold">
          Instructions
          <textarea
            rows={4}
            className="mt-2 w-full resize-none rounded-lg border p-3 text-sm outline-none"
            placeholder="Key issues, scope, or reviewer notes…"
          />
        </label>
        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 rounded-lg bg-emerald px-5 py-3 text-xs font-semibold text-white">
            Continue to secure upload <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </>
  );
}
