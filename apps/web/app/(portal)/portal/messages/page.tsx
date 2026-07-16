"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { PageHeading } from "@/components/portal/page-heading";
export default function Messages() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="Secure collaboration"
        title="Messages"
        description="Communicate with your case team inside the protected workspace."
      />
      <div className="grid min-h-[600px] overflow-hidden rounded-2xl border bg-white md:grid-cols-[300px_1fr]">
        <aside className="border-r">
          <div className="border-b p-4">
            <input
              className="w-full rounded-lg border p-2.5 text-xs"
              placeholder="Search conversations…"
            />
          </div>
          {[
            ["SMR-2026-1274", "Dr. A. Mehta", "Please review the flagged gap."],
            ["SMR-2026-1273", "Alex Joseph", "Draft is ready for comments."],
            ["Billing support", "Priya Rao", "Invoice has been updated."],
          ].map((x, i) => (
            <button
              className={`w-full border-b p-4 text-left ${i === 0 ? "bg-emerald/[.05]" : ""}`}
              key={x[0]}
            >
              <b className="text-xs text-pine">{x[0]}</b>
              <span className="mt-1 block text-[11px] text-slate-500">
                {x[1]} · {x[2]}
              </span>
            </button>
          ))}
        </aside>
        <section className="flex flex-col">
          <div className="border-b p-5">
            <b className="text-sm">SMR-2026-1274 · Case team</b>
            <span className="mt-1 block text-[11px] text-emerald">
              4 participants · secure channel
            </span>
          </div>
          <div className="flex-1 space-y-4 p-6">
            <div className="max-w-md rounded-2xl bg-slate-100 p-4 text-sm">
              I flagged the April treatment gap and added both source records.
            </div>
            <div className="ml-auto max-w-md rounded-2xl bg-pine p-4 text-sm text-white">
              Thanks. Please confirm whether the discharge note documents home
              exercise compliance.
            </div>
            {sent && (
              <div className="ml-auto max-w-md rounded-2xl bg-pine p-4 text-sm text-white">
                I’ve reviewed it and added a note to the chronology.
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="flex gap-2 border-t p-4"
          >
            <input
              className="flex-1 rounded-xl border px-4 text-sm"
              placeholder="Write a secure message…"
            />
            <button className="rounded-xl bg-emerald p-3 text-white">
              <Send size={17} />
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
