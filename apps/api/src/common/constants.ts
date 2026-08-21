export const ROLES = [
  "attorney",
  "case-manager",
  "physician",
  "reviewer",
  "billing",
  "admin",
] as const;
export type RoleValue = (typeof ROLES)[number];

export const CASE_STATUSES = [
  "AWAITING_APPROVAL",
  "IN_PROCESSING",
  "UNDER_REVIEW",
  "FINAL_AUDIT",
  "DELIVERED",
  "FOLLOW_UP",
  "PAYMENT_PENDING",
  "CLOSED",
] as const;
export type CaseStatusValue = (typeof CASE_STATUSES)[number];

export const PRIORITIES = ["STANDARD", "URGENT"] as const;
export type PriorityValue = (typeof PRIORITIES)[number];

export const DOCUMENT_CATEGORIES = [
  "MEDICAL_RECORDS",
  "IMAGING",
  "BILLING_RECORDS",
  "PHARMACY",
  "LEGAL_DOCUMENTS",
  "OTHER",
] as const;
export type DocumentCategoryValue = (typeof DOCUMENT_CATEGORIES)[number];

export const INVOICE_STATUSES = ["PENDING", "PAID", "OVERDUE"] as const;
export type InvoiceStatusValue = (typeof INVOICE_STATUSES)[number];

// Approximate workflow completion, used to drive progress bars in the UI.
export const STATUS_PROGRESS: Record<CaseStatusValue, number> = {
  AWAITING_APPROVAL: 10,
  IN_PROCESSING: 35,
  UNDER_REVIEW: 60,
  FINAL_AUDIT: 75,
  DELIVERED: 90,
  FOLLOW_UP: 95,
  PAYMENT_PENDING: 97,
  CLOSED: 100,
};

// Simplified status shown to client-facing roles, per the SOP's two-layer
// status model (internal ops detail vs. what the client actually sees).
export const CLIENT_STATUS_LABEL: Record<CaseStatusValue, string> = {
  AWAITING_APPROVAL: "Awaiting your approval",
  IN_PROCESSING: "In progress",
  UNDER_REVIEW: "Quality review",
  FINAL_AUDIT: "Quality review",
  DELIVERED: "Delivered",
  FOLLOW_UP: "Delivered",
  PAYMENT_PENDING: "Delivered",
  CLOSED: "Closed",
};

export const INTERNAL_STATUS_LABEL: Record<CaseStatusValue, string> = {
  AWAITING_APPROVAL: "Awaiting approval",
  IN_PROCESSING: "In processing",
  UNDER_REVIEW: "Under review",
  FINAL_AUDIT: "Final audit / QC",
  DELIVERED: "Delivered",
  FOLLOW_UP: "Follow-up",
  PAYMENT_PENDING: "Payment pending",
  CLOSED: "Closed",
};

export function statusLabelFor(role: string, status: string): string {
  const s = status as CaseStatusValue;
  if (role === "attorney") return CLIENT_STATUS_LABEL[s] ?? status;
  return INTERNAL_STATUS_LABEL[s] ?? status;
}
