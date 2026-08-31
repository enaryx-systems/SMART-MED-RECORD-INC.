import { z } from "zod";
import type { CaseType, DeliverySpeed } from "@/lib/types/portal";

export interface WizardState {
  matterName: string;
  caseType: CaseType | "";
  attorneyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  caseOverview: string;
  caseIssues: string;
  specificInstructions: string;
  servicesDesired: string[];
  additionalServices: string[];
  otherServicesNote: string;
  deliverySpeed: DeliverySpeed;
  pdfReference: boolean;
  batesReference: boolean;
}

export const EMPTY_WIZARD_STATE: WizardState = {
  matterName: "",
  caseType: "",
  attorneyName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  caseOverview: "",
  caseIssues: "",
  specificInstructions: "",
  servicesDesired: [],
  additionalServices: [],
  otherServicesNote: "",
  deliverySpeed: "STANDARD",
  pdfReference: false,
  batesReference: false,
};

const step1Schema = z.object({
  matterName: z.string().trim().min(2, "Case name must be at least 2 characters."),
  caseType: z.string().min(1, "Select a case type."),
  contactEmail: z
    .string()
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Enter a valid email address.",
    }),
});

const step2Schema = z.object({
  servicesDesired: z.array(z.string()).min(1, "Select at least one service."),
});

export function isStep1Valid(state: WizardState) {
  return step1Schema.safeParse(state).success;
}

export function isStep2Valid(state: WizardState) {
  return step2Schema.safeParse(state).success;
}

// Per-field error message for a single field, for inline display — the
// step-valid checks above stay boolean (unchanged call sites), this is for
// the form to surface a specific reason rather than a generic "required".
export function step1FieldError(state: WizardState, field: keyof z.infer<typeof step1Schema>) {
  const result = step1Schema.safeParse(state);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}
