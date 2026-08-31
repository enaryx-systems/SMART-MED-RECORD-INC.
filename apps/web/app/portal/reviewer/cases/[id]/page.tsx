"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCase } from "@/lib/api/client";
import { PageHeader } from "@/components/portal/page-header";
import { CaseOverview } from "@/components/portal/case-overview";
import { CaseSummaryCard } from "@/components/portal/case-summary-card";
import { CaseReviewWizard } from "@/components/portal/case-review-wizard";

export default function ReviewerCaseDetailPage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => fetchCase(caseId),
  });

  if (isLoading) return <p className="text-sm text-ink/50">Loading case…</p>;
  if (isError || !data) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        Could not load this case.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review workspace"
        description="Client submission through final delivery, one step at a time."
      />
      <CaseOverview data={data} showOrganization />
      <CaseSummaryCard caseId={caseId} canGenerate />
      <CaseReviewWizard caseId={caseId} status={data.status} />
    </div>
  );
}
