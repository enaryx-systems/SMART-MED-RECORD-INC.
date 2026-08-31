import {
  CASE_TYPE_LABEL,
  DELIVERY_SPEED_LABEL,
  type CaseType,
  type DeliverySpeed,
} from "@/lib/types/portal";

export const CASE_TYPES: { value: CaseType; label: string }[] = (
  Object.entries(CASE_TYPE_LABEL) as [CaseType, string][]
).map(([value, label]) => ({ value, label }));

export const DELIVERY_SPEEDS: { value: DeliverySpeed; label: string }[] = (
  Object.entries(DELIVERY_SPEED_LABEL) as [DeliverySpeed, string][]
).map(([value, label]) => ({ value, label }));

// Mirrors apps/api/src/modules/cases/case-catalog.ts — kept in sync manually since
// the two apps install independently and share no package.
export const SERVICES_DESIRED = [
  "Medical Chronology",
  "Narrative Summary",
  "Demand Letter",
  "Deposition Summary",
  "Medical Opinion",
  "Medical Synopsis Drafting",
  "IME Report",
  "Life Care Plan",
  "APS Summary",
  "Billing Summary",
];

export const ADDITIONAL_SERVICES = [
  "Accident Timeline",
  "List of Injuries",
  "Pre-Existing Injuries",
  "Pain & Suffering Chart",
  "Comparative Chart",
  "Medical Record Sorting",
  "Med-A-Word",
  "Provider List",
  "Medical Transcription",
  "Bookmarks",
  "Hyperlinks",
];
