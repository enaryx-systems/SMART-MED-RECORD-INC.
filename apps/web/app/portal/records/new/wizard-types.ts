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

export function isStep1Valid(state: WizardState) {
  return state.matterName.trim().length >= 2 && state.caseType !== "";
}

export function isStep2Valid(state: WizardState) {
  return state.servicesDesired.length > 0;
}
