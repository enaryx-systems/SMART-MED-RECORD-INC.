import { CASE_TYPES } from "@/lib/data/case-options";
import { Dropdown } from "@/components/portal/dropdown";
import { step1FieldError, type WizardState } from "./wizard-types";

export function StepCaseDetails({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="matterName">
            Case Name <span className="text-red-500">*</span>
          </label>
          <input
            id="matterName"
            required
            value={state.matterName}
            onChange={(e) => onChange({ matterName: e.target.value })}
            placeholder="e.g. Smith v. Acme Corp"
            className="w-full rounded-lg border-2 border-pine/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="caseType">
            Case Type <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="caseType"
            value={state.caseType}
            onChange={(value) => onChange({ caseType: value as WizardState["caseType"] })}
            options={CASE_TYPES}
            placeholder="Select one"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="attorneyName">
            Attorney Name
          </label>
          <input
            id="attorneyName"
            value={state.attorneyName}
            onChange={(e) => onChange({ attorneyName: e.target.value })}
            className="w-full rounded-lg border-2 border-pine/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="contactName">
            Contact Name
          </label>
          <input
            id="contactName"
            value={state.contactName}
            onChange={(e) => onChange({ contactName: e.target.value })}
            className="w-full rounded-lg border-2 border-pine/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="contactEmail">
            Contact Email
          </label>
          <input
            id="contactEmail"
            type="email"
            value={state.contactEmail}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            className="w-full rounded-lg border-2 border-pine/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
          />
          {state.contactEmail !== "" && step1FieldError(state, "contactEmail") && (
            <p className="mt-1 text-xs text-red-600">{step1FieldError(state, "contactEmail")}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="contactPhone">
            Contact Phone
          </label>
          <input
            id="contactPhone"
            value={state.contactPhone}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            className="w-full rounded-lg border-2 border-pine/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="caseOverview">
          Case Overview
        </label>
        <textarea
          id="caseOverview"
          rows={2}
          value={state.caseOverview}
          onChange={(e) => onChange({ caseOverview: e.target.value })}
          className="w-full rounded-lg border-2 border-pine/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="caseIssues">
          Case Issues and Focus
        </label>
        <textarea
          id="caseIssues"
          rows={2}
          value={state.caseIssues}
          onChange={(e) => onChange({ caseIssues: e.target.value })}
          className="w-full rounded-lg border-2 border-pine/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
        />
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-semibold text-ink"
          htmlFor="specificInstructions"
        >
          Specific Instructions
        </label>
        <textarea
          id="specificInstructions"
          rows={2}
          value={state.specificInstructions}
          onChange={(e) => onChange({ specificInstructions: e.target.value })}
          className="w-full rounded-lg border-2 border-pine/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald focus:shadow-[0_0_0_3px_rgba(0,133,111,0.09)]"
        />
      </div>
    </div>
  );
}
