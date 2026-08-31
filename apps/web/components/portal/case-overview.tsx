import {
  CASE_TYPE_LABEL,
  DELIVERY_SPEED_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@/lib/types/portal";
import type { Case } from "@/lib/types/portal";
import { OrgBadge } from "@/components/portal/org-badge";
import { ReviewerBadge } from "@/components/portal/reviewer-badge";
import { DueBadge } from "@/components/portal/due-badge";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-emerald">{label}</div>
      <div className="mt-1 text-sm text-ink">{value || "—"}</div>
    </div>
  );
}

export function CaseOverview({
  data,
  showOrganization = false,
  showAssignee = false,
}: {
  data: Case;
  showOrganization?: boolean;
  showAssignee?: boolean;
}) {
  return (
    <div className="rounded-2xl border-[1.5px] border-pine/30 bg-white p-6 shadow-[0_16px_36px_rgba(0,69,58,0.16),0_4px_10px_rgba(0,69,58,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-ink/50">{data.caseNumber}</div>
          <h2 className="mt-1 text-2xl text-pine">{data.matterName}</h2>
        </div>
        <div className="flex items-center gap-2">
          {showOrganization && data.organization && (
            <OrgBadge id={data.organization.id} name={data.organization.name} />
          )}
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-white"
            style={{ backgroundColor: STATUS_COLOR[data.status] }}
          >
            {STATUS_LABEL[data.status]}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 border-t border-mint pt-6 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Case type" value={CASE_TYPE_LABEL[data.caseType]} />
        <Field label="Attorney" value={data.attorneyName} />
        <Field label="Contact" value={data.contactName} />
        <Field label="Contact email" value={data.contactEmail} />
        <Field label="Contact phone" value={data.contactPhone} />
        <Field label="Delivery speed" value={DELIVERY_SPEED_LABEL[data.deliverySpeed]} />
        <Field
          label="Services desired"
          value={data.servicesDesired.length > 0 ? data.servicesDesired.join(", ") : null}
        />
        <Field
          label="Submitted"
          value={data.submittedAt ? new Date(data.submittedAt).toLocaleDateString() : null}
        />
        <Field
          label="Due"
          value={
            data.dueAt ? (
              <span className="flex flex-wrap items-center gap-2">
                {new Date(data.dueAt).toLocaleDateString()}
                <DueBadge dueAt={data.dueAt} status={data.status} />
              </span>
            ) : null
          }
        />
        {showAssignee && (
          <Field
            label="Assigned reviewer"
            value={
              <ReviewerBadge
                id={data.assignedReviewer?.id ?? null}
                name={data.assignedReviewer?.name ?? "Unassigned"}
              />
            }
          />
        )}
      </div>

      {data.caseOverview && (
        <div className="mt-6 border-t border-mint pt-5">
          <div className="text-xs font-bold uppercase tracking-wide text-emerald">
            Case overview
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink/75">{data.caseOverview}</p>
        </div>
      )}

      {data.specificInstructions && (
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wide text-emerald">
            Specific instructions
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink/75">
            {data.specificInstructions}
          </p>
        </div>
      )}
    </div>
  );
}
