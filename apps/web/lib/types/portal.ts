export type Role = "attorney" | "case-manager" | "physician" | "reviewer" | "billing" | "admin";

export const ROLE_LABEL: Record<Role, string> = {
  attorney: "Attorney / client",
  "case-manager": "Case manager",
  physician: "Physician reviewer",
  reviewer: "Medical reviewer",
  billing: "Billing specialist",
  admin: "Administrator",
};

export type CaseStatus =
  | "AWAITING_APPROVAL"
  | "IN_PROCESSING"
  | "UNDER_REVIEW"
  | "FINAL_AUDIT"
  | "DELIVERED"
  | "FOLLOW_UP"
  | "PAYMENT_PENDING"
  | "CLOSED";

export type PersonRef = { id: string; name: string; email: string; role: Role } | null;

export type CaseRecord = {
  id: string;
  caseNumber: string;
  clientName: string;
  matterName: string;
  matterNumber?: string | null;
  claimNumber?: string | null;
  service: string;
  status: CaseStatus;
  statusLabel: string;
  onHold: boolean;
  priority: string;
  instructions?: string | null;
  progress: number;
  pages: number;
  dueAt: string | null;
  approvedAt: string | null;
  approvedPending: boolean;
  assignedAt: string | null;
  acknowledgedAt: string | null;
  deliveredAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  creator: PersonRef;
  assignee: PersonRef;
  reviewer: PersonRef;
  qcBy: PersonRef;
  documentCount: number;
  invoiceCount: number;
};

export type DocumentRecord = {
  id: string;
  name: string;
  storageKey: string;
  mimeType: string;
  size: number;
  category: string;
  caseId: string;
  uploadedById: string | null;
  createdAt: string;
};

export type MessageRecord = {
  id: string;
  body: string;
  visibility: "CLIENT" | "INTERNAL";
  caseId: string;
  createdAt: string;
  user: { id: string; name: string; role: Role };
};

export type InvoiceRecord = {
  id: string;
  number: string;
  amountCents: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueAt: string;
  paidAt: string | null;
  createdAt: string;
  caseId: string;
  case?: { id: string; caseNumber: string; matterName: string; clientName: string };
};

export type ActivityRecord = {
  id: string;
  action: string;
  entity: string;
  metadata: Record<string, unknown> | null;
  user: { id: string; name: string; role: Role };
  createdAt: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: Role;
  firm: string | null;
  createdAt: string;
  activeCaseCount: number;
};

export type DashboardSummary = {
  role: Role;
  stats: {
    totalCases: number;
    awaitingApproval: number;
    inProcessing: number;
    underReview: number;
    delivered: number;
    closed: number;
  };
  cases: Array<{
    id: string;
    caseNumber: string;
    clientName: string;
    matterName: string;
    service: string;
    status: CaseStatus;
    statusLabel: string;
    priority: string;
    updatedAt: string;
    dueAt: string | null;
    reviewer: string;
  }>;
  activity: Array<{
    id: string;
    action: string;
    actor: string;
    caseNumber?: string;
    createdAt: string;
  }>;
  statusBreakdown: Array<{ status: CaseStatus; label: string; count: number }>;
  upcomingDeadlines: Array<{
    id: string;
    caseNumber: string;
    matterName: string;
    dueAt: string;
    priority: string;
  }>;
  topClients: Array<{ clientName: string; count: number }>;
};

export type Session = {
  accessToken: string;
  user: { id: string; name: string; email: string; role: Role; firm: string | null };
};
