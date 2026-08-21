"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { PageHeading } from "@/components/portal/page-heading";
import { getCases, listMessages, sendMessage } from "@/lib/api/client";
import { formatRelative } from "@/lib/format";
import { useSession } from "@/lib/auth/session";

export default function Messages() {
  const { session } = useSession();
  const qc = useQueryClient();
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"CLIENT" | "INTERNAL">("CLIENT");

  const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: () => getCases() });

  useEffect(() => {
    if (!activeCaseId && cases.length > 0) setActiveCaseId(cases[0].id);
  }, [cases, activeCaseId]);

  const { data: messages = [] } = useQuery({
    queryKey: ["case-messages", activeCaseId],
    queryFn: () => listMessages(activeCaseId as string),
    enabled: !!activeCaseId,
  });

  const mutation = useMutation({
    mutationFn: () => sendMessage(activeCaseId as string, body, visibility),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["case-messages", activeCaseId] });
    },
  });

  const activeCase = cases.find((c) => c.id === activeCaseId);
  const role = session?.user.role;

  return (
    <>
      <PageHeading
        eyebrow="Secure collaboration"
        title="Messages"
        description="Communicate with your case team inside the protected workspace."
      />
      <div className="grid min-h-[600px] overflow-hidden rounded-2xl border bg-white md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="thin-scroll overflow-y-auto border-r">
          {cases.length === 0 && <p className="p-4 text-xs text-slate-400">No cases yet.</p>}
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCaseId(c.id)}
              className={`w-full border-b p-4 text-left ${c.id === activeCaseId ? "bg-emerald/[.05]" : ""}`}
            >
              <b className="text-xs text-pine">{c.caseNumber}</b>
              <span className="mt-1 block text-[11px] text-slate-500">{c.matterName}</span>
            </button>
          ))}
        </aside>
        <section className="flex flex-col">
          {activeCase ? (
            <>
              <div className="border-b p-5">
                <b className="text-sm">
                  {activeCase.caseNumber} · {activeCase.matterName}
                </b>
                <span className="mt-1 block text-[11px] text-emerald">Secure channel</span>
              </div>
              <div className="thin-scroll flex-1 space-y-4 overflow-y-auto p-6">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-slate-400">No messages yet — say hello.</p>
                )}
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
                  if (body.trim()) mutation.mutate();
                }}
                className="flex flex-wrap items-center gap-2 border-t p-4"
              >
                {role !== "attorney" && (
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as "CLIENT" | "INTERNAL")}
                    className="rounded-lg border px-2 py-2.5 text-[11px] outline-none"
                  >
                    <option value="CLIENT">Client-visible</option>
                    <option value="INTERNAL">Internal only</option>
                  </select>
                )}
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-w-[180px] flex-1 rounded-xl border px-4 text-sm outline-none focus:border-emerald"
                  placeholder="Write a secure message…"
                />
                <button className="rounded-xl bg-emerald p-3 text-white" aria-label="Send">
                  <Send size={17} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
              Select a case to view its conversation.
            </div>
          )}
        </section>
      </div>
    </>
  );
}
