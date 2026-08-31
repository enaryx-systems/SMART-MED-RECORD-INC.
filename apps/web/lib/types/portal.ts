export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type SortDir = "asc" | "desc";

export type Role = "CLIENT" | "ADMIN" | "REVIEWER" | "BILLING";

export const ROLE_LABEL: Record<Role, string> = {
  CLIENT: "Client",
  ADMIN: "Admin",
  REVIEWER: "Reviewer",
  BILLING: "Billing",
};

// One solid color per role, reused for avatars/badges so a role reads the
// same color everywhere in the portal.
export const ROLE_COLOR: Record<Role, string> = {
  CLIENT: "#00856F",
  ADMIN: "#00453A",
  REVIEWER: "#B78A3D",
  BILLING: "#7C5295",
};

export type CaseStatus =
  | "DRAFT"
  | "NEW"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "AWAITING_DELIVERY"
  | "DELIVERED"
  | "CANCELED";

export const CASE_STATUSES: CaseStatus[] = [
  "DRAFT",
  "NEW",
  "IN_PROGRESS",
  "ON_HOLD",
  "AWAITING_DELIVERY",
  "DELIVERED",
  "CANCELED",
];

export const STATUS_LABEL: Record<CaseStatus, string> = {
  DRAFT: "Draft",
  NEW: "New",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  AWAITING_DELIVERY: "Awaiting Delivery",
  DELIVERED: "Delivered",
  CANCELED: "Canceled",
};

// Tints/shades of the brand hues (pine, emerald, gold, ink) — kept in-palette
// rather than introducing arbitrary new colors for chart/status differentiation.
export const STATUS_COLOR: Record<CaseStatus, string> = {
  DRAFT: "#94A3A0",
  NEW: "#00856F",
  IN_PROGRESS: "#00453A",
  ON_HOLD: "#B78A3D",
  AWAITING_DELIVERY: "#4FB39E",
  DELIVERED: "#8A6425",
  CANCELED: "#6B7568",
};

export type CaseType =
  | "PERSONAL_INJURY"
  | "MEDICAL_MALPRACTICE"
  | "MASS_TORT_CLASS_ACTION"
  | "SSD_CLAIMS"
  | "NURSING_HOME"
  | "SEXUAL_ABUSE_CASES"
  | "WORKERS_COMPENSATION"
  | "OTHER";

export const CASE_TYPE_LABEL: Record<CaseType, string> = {
  PERSONAL_INJURY: "Personal Injury",
  MEDICAL_MALPRACTICE: "Medical Malpractice",
  MASS_TORT_CLASS_ACTION: "Mass Tort/Class Action",
  SSD_CLAIMS: "SSD Claims",
  NURSING_HOME: "Nursing Home",
  SEXUAL_ABUSE_CASES: "Sexual Abuse Cases",
  WORKERS_COMPENSATION: "Worker Compensation",
  OTHER: "Others",
};

export type DeliverySpeed = "STANDARD" | "EXPEDITED";

export const DELIVERY_SPEED_LABEL: Record<DeliverySpeed, string> = {
  STANDARD: "1 Week TAT",
  EXPEDITED: "Expedited",
};

export type DocumentKind = "CLIENT_UPLOAD" | "DELIVERABLE";

export type CaseEventType =
  | "NOTE"
  | "STATUS_CHANGE"
  | "ASSIGNMENT"
  | "DOCUMENT_UPLOADED"
  | "INVOICE_ISSUED"
  | "INVOICE_PAID"
  | "INVOICE_UPDATED";

export type InvoiceStatus = "PENDING" | "PAID";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  organizationName: string;
}

export interface OrgRef {
  id: string;
  name: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
  organizationId?: string;
  organization?: OrgRef;
  _count?: { cases: number; assignedCases?: number };
}

export interface BulkCreateUserRow {
  name: string;
  email: string;
  role: string;
  organization?: string;
}

export interface BulkCreateResult {
  created: number;
  failed: number;
  results: { row: number; email: string; status: "created" | "failed"; error?: string }[];
}

export interface OrgCaseSummary {
  id: string;
  caseNumber: string;
  matterName: string;
  status: CaseStatus;
  createdAt: string;
}

export interface OrgUserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  _count?: { users: number; cases: number };
  users?: OrgUserSummary[];
  cases?: OrgCaseSummary[];
}

export interface Case {
  id: string;
  caseNumber: string;
  matterName: string;
  caseType: CaseType;
  attorneyName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  caseOverview: string | null;
  caseIssues: string | null;
  specificInstructions: string | null;
  servicesDesired: string[];
  additionalServices: string[];
  otherServicesNote: string | null;
  deliverySpeed: DeliverySpeed;
  pdfReference: boolean;
  batesReference: boolean;
  status: CaseStatus;
  dueAt: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  organization?: OrgRef;
  ownerId: string;
  owner?: { name: string; email: string };
  assignedReviewerId: string | null;
  assignedReviewer?: { id: string; name: string } | null;
}

export interface CaseStats {
  counts: Record<CaseStatus, number>;
  total: number;
  byOrganization: CaseOrgBreakdown[];
  byReviewer: CaseReviewerBreakdown[];
}

export type ExtractionStatus = "PENDING" | "PROCESSING" | "COMPLETE" | "FAILED";

export interface CaseDocument {
  id: string;
  caseId: string;
  fileName: string;
  mimeType: string;
  size: number;
  kind: DocumentKind;
  createdAt: string;
  locked: boolean;
  extraction?: { status: ExtractionStatus } | null;
}

export interface ExtractedRecord {
  documentType?: string | null;
  providerName?: string | null;
  datesOfService: string[];
  diagnoses: string[];
  summary?: string | null;
}

export interface DocumentExtraction {
  id: string;
  documentId: string;
  status: ExtractionStatus;
  extractedText: string | null;
  structuredData: ExtractedRecord | null;
  model: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaseSummary {
  id: string;
  caseId: string;
  summary: string;
  model: string | null;
  generatedAt: string;
}

export interface SearchResult {
  score: number;
  caseId: string;
  caseNumber?: string;
  matterName?: string;
  documentId: string;
  fileName?: string;
  snippet: string;
}

export interface CaseEvent {
  id: string;
  caseId: string;
  authorId: string;
  author?: { name: string; role: Role };
  type: CaseEventType;
  body: string | null;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  caseId: string;
  case: { id: string; caseNumber: string; matterName: string };
  description: string;
  amountCents: number;
}

export interface Invoice {
  id: string;
  number: string;
  organizationId: string;
  organization: OrgRef;
  amountCents: number;
  status: InvoiceStatus;
  dueAt: string;
  paidAt: string | null;
  createdAt: string;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceCaseOption {
  id: string;
  caseNumber: string;
  status: CaseStatus;
  organization: { id: string; name: string };
}

export interface InvoiceSummary {
  outstandingCents: number;
  paidCents: number;
  pendingCount: number;
  paidCount: number;
}

export interface OrgOption {
  id: string;
  name: string;
}

export interface CaseOrgBreakdown {
  organizationId: string;
  organizationName: string;
  count: number;
}

export interface CaseReviewerBreakdown {
  reviewerId: string;
  reviewerName: string;
  count: number;
}
