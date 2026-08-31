"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardEdit, FilePenLine, FileUp, MessageSquare, Receipt, UserCog } from "lucide-react";
import { addCaseComment, fetchCaseEvents } from "@/lib/api/client";
import type { CaseEventType } from "@/lib/types/portal";

const ICONS: Record<CaseEventType, React.ComponentType<{ size?: number; className?: string }>> = {
  NOTE: MessageSquare,
  STATUS_CHANGE: ClipboardEdit,
  ASSIGNMENT: UserCog,
  DOCUMENT_UPLOADED: FileUp,
  INVOICE_ISSUED: Receipt,
  INVOICE_PAID: Receipt,
  INVOICE_UPDATED: FilePenLine,
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CaseTimeline({ caseId }: { caseId: string }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["case-events", caseId],
    queryFn: () => fetchCaseEvents(caseId),
  });

  const mutation = useMutation({
    mutationFn: (body: string) => addCaseComment(caseId, body),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["case-events", caseId] });
    },
  });

  return (
    <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
      <h3 className="mb-4 text-lg font-semibold text-pine">Activity & comments</h3>

      <div className="space-y-4">
        {isLoading && <p className="text-sm text-ink/50">Loading timeline…</p>}
        {!isLoading && data?.length === 0 && (
          <p className="text-sm text-ink/50">No activity yet.</p>
        )}
        {data?.map((event) => {
          const Icon = ICONS[event.type];
          return (
            <div key={event.id} className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint text-emerald">
                <Icon size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {event.author?.name ?? "System"}
                  </span>
                  <span className="text-xs text-ink/45">{formatDateTime(event.createdAt)}</span>
                </div>
                {event.body && <p className="mt-0.5 text-sm text-ink/75">{event.body}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="mt-6 flex flex-col gap-3 border-t border-mint pt-5 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (comment.trim().length === 0) return;
          mutation.mutate(comment.trim());
        }}
      >
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment for this case…"
          rows={2}
          className="w-full flex-1 resize-none rounded-xl border-2 border-pine/25 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
        />
        <button
          type="submit"
          disabled={mutation.isPending || comment.trim().length === 0}
          className="shrink-0 rounded-lg border border-pine bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-fast hover:bg-pine disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? "Posting…" : "Post"}
        </button>
      </form>
    </div>
  );
}
