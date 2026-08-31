"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";
import { fetchCaseSummary, generateCaseSummary } from "@/lib/api/client";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/portal/button";

export function CaseSummaryCard({
  caseId,
  canGenerate = false,
}: {
  caseId: string;
  canGenerate?: boolean;
}) {
  const queryClient = useQueryClient();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["case-summary", caseId],
    queryFn: () => fetchCaseSummary(caseId),
  });

  const mutation = useMutation({
    mutationFn: () => generateCaseSummary(caseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["case-summary", caseId] }),
  });

  if (isLoading) return null;
  if (!summary && !canGenerate) return null;

  return (
    <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-pine">
          <Sparkles size={17} className="text-gold" />
          AI Case Summary
        </h3>
        {canGenerate && (
          <Button
            variant="secondary"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            <RefreshCw size={13} className={mutation.isPending ? "animate-spin" : ""} />
            {summary ? "Refresh" : "Generate"}
          </Button>
        )}
      </div>

      {mutation.isError && (
        <p className="mt-3 text-sm text-red-600">
          {mutation.error instanceof ApiError
            ? mutation.error.message
            : "Could not generate a summary."}
        </p>
      )}

      {summary ? (
        <>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/75">
            {summary.summary}
          </p>
          <p className="mt-3 text-xs text-ink/40">
            Generated {new Date(summary.generatedAt).toLocaleString()}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-ink/50">
          No summary yet — generate one once the case&rsquo;s documents have been extracted.
        </p>
      )}
    </div>
  );
}
