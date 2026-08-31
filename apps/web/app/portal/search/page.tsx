"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Search as SearchIcon, FileText } from "lucide-react";
import { z } from "zod";
import { searchDocuments, ApiError } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { PageHeader } from "@/components/portal/page-header";
import { TextInput } from "@/components/portal/text-input";
import { Button } from "@/components/portal/button";
import type { Role } from "@/lib/types/portal";

const CASE_PATH_PREFIX: Record<Role, string> = {
  CLIENT: "/portal/cases",
  ADMIN: "/portal/admin/cases",
  REVIEWER: "/portal/reviewer/cases",
  BILLING: "/portal/cases",
};

const searchSchema = z.object({
  q: z.string().trim().min(2, "Enter at least 2 characters to search."),
});

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [formError, setFormError] = useState<string | undefined>();
  const { user } = useCurrentUser();
  const casePathPrefix = CASE_PATH_PREFIX[user?.role ?? "CLIENT"];

  const mutation = useMutation({
    mutationFn: (q: string) => searchDocuments(q),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = searchSchema.safeParse({ q: query });
    if (!result.success) {
      setFormError(result.error.issues[0]?.message);
      return;
    }
    setFormError(undefined);
    mutation.mutate(result.data.q);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search"
        description="Ask a natural-language question across your case documents' extracted content."
      />

      <form onSubmit={onSubmit} className="flex gap-3">
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. imaging reports mentioning lumbar spine"
          className="max-w-xl"
        />
        <Button type="submit" disabled={mutation.isPending}>
          <SearchIcon size={15} />
          {mutation.isPending ? "Searching…" : "Search"}
        </Button>
      </form>

      {formError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p>
      )}

      {mutation.isError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutation.error instanceof ApiError
            ? mutation.error.message
            : "Search failed. Please try again."}
        </p>
      )}

      {mutation.isSuccess && mutation.data.length === 0 && (
        <p className="text-sm text-ink/50">No matching content found.</p>
      )}

      {mutation.isSuccess && mutation.data.length > 0 && (
        <ul className="space-y-3">
          {mutation.data.map((result) => (
            <li
              key={`${result.documentId}`}
              className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-5 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]"
            >
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`${casePathPrefix}/${result.caseId}`}
                  className="flex items-center gap-2 text-sm font-semibold text-pine hover:underline"
                >
                  <FileText size={15} />
                  {result.caseNumber} — {result.matterName}
                </Link>
                <span className="text-xs text-ink/40">{result.fileName}</span>
              </div>
              <p className="mt-2 text-sm text-ink/70">{result.snippet}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
