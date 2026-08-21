"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageHeading } from "@/components/portal/page-heading";
import { ApiError, createCase, getServices } from "@/lib/api/client";

export default function NewCase() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: getServices });

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof createCase>[0]) => createCase(payload),
    onSuccess: (created) => router.push(`/portal/cases/${created.id}`),
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create the case"),
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const dueAt = String(form.get("dueAt") || "");
    mutation.mutate({
      clientName: String(form.get("clientName") || ""),
      matterName: String(form.get("matterName") || ""),
      matterNumber: String(form.get("matterNumber") || "") || undefined,
      claimNumber: String(form.get("claimNumber") || "") || undefined,
      service: String(form.get("service") || ""),
      priority: String(form.get("priority") || "STANDARD"),
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      instructions: String(form.get("instructions") || "") || undefined,
    });
  }

  return (
    <>
      <Link href="/portal/cases" className="mb-5 inline-flex items-center gap-2 text-xs text-slate-500">
        <ArrowLeft size={15} /> Cancel
      </Link>
      <PageHeading
        eyebrow="New matter"
        title="Create a case"
        description="Start an intake now — upload records once the case is created."
      />
      <form onSubmit={submit} className="max-w-3xl rounded-2xl border bg-white p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            Patient / claimant name
            <input
              required
              name="clientName"
              className="mt-2 w-full rounded-lg border p-3 text-sm outline-none focus:border-emerald"
              placeholder="Full legal name"
            />
          </label>
          <label className="text-xs font-semibold">
            Matter name
            <input
              required
              name="matterName"
              className="mt-2 w-full rounded-lg border p-3 text-sm outline-none focus:border-emerald"
              placeholder="Smith v. Northstar"
            />
          </label>
          <label className="text-xs font-semibold">
            Service
            <select name="service" required className="mt-2 w-full rounded-lg border p-3 text-sm outline-none">
              {services.map((x) => (
                <option key={x.key} value={x.name}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold">
            Priority
            <select name="priority" className="mt-2 w-full rounded-lg border p-3 text-sm outline-none">
              <option value="STANDARD">Standard (24–48 hrs)</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
          <label className="text-xs font-semibold">
            Due date
            <input name="dueAt" type="date" className="mt-2 w-full rounded-lg border p-3 text-sm outline-none" />
          </label>
          <label className="text-xs font-semibold">
            Matter / claim number
            <input
              name="matterNumber"
              className="mt-2 w-full rounded-lg border p-3 text-sm outline-none"
              placeholder="Optional"
            />
          </label>
        </div>
        <label className="mt-5 block text-xs font-semibold">
          Instructions
          <textarea
            name="instructions"
            rows={4}
            className="mt-2 w-full resize-none rounded-lg border p-3 text-sm outline-none"
            placeholder="Key issues, scope, or reviewer notes…"
          />
        </label>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end">
          <button
            disabled={mutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald px-5 py-3 text-xs font-semibold text-white disabled:opacity-60"
          >
            {mutation.isPending ? "Creating…" : "Create case"} <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </>
  );
}
