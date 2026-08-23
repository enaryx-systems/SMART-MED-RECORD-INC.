import type {
  Case,
  CaseDocument,
  CaseEvent,
  CaseStats,
  CaseStatus,
  CaseType,
  DeliverySpeed,
  Invoice,
  InvoiceCaseOption,
  InvoiceStatus,
  InvoiceSummary,
  Organization,
  OrgOption,
  Paginated,
  Role,
  Session,
  SortDir,
  UserSummary,
} from "@/lib/types/portal";
import { clearSession, getSession } from "@/lib/auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getSession();
  const headers = new Headers(init.headers);
  const isFormData = init.body instanceof FormData;
  if (!isFormData) headers.set("Content-Type", "application/json");
  if (session) headers.set("Authorization", `Bearer ${session.token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearSession();
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.message ?? "Request failed.", res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: SortDir;
}

function pageParams(params: PageParams) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortDir) qs.set("sortDir", params.sortDir);
  return qs;
}

export function login(email: string, password: string) {
  return request<Session>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchMe() {
  return request<Session["user"]>("/auth/me");
}

export interface FetchCasesParams extends PageParams {
  status?: CaseStatus;
  caseType?: CaseType;
  organizationId?: string;
  reviewerId?: string;
  createdFrom?: string;
  createdTo?: string;
}

export function fetchCases(params: FetchCasesParams = {}) {
  const qs = pageParams(params);
  if (params.status) qs.set("status", params.status);
  if (params.caseType) qs.set("caseType", params.caseType);
  if (params.organizationId) qs.set("organizationId", params.organizationId);
  if (params.reviewerId) qs.set("reviewerId", params.reviewerId);
  if (params.createdFrom) qs.set("createdFrom", params.createdFrom);
  if (params.createdTo) qs.set("createdTo", params.createdTo);
  return request<Paginated<Case>>(`/cases?${qs.toString()}`);
}

export function fetchCaseStats(organizationId?: string) {
  const qs = organizationId ? `?organizationId=${organizationId}` : "";
  return request<CaseStats>(`/cases/stats${qs}`);
}

export function fetchCase(id: string) {
  return request<Case>(`/cases/${id}`);
}

export interface CaseInput {
  matterName?: string;
  caseType?: CaseType;
  attorneyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  caseOverview?: string;
  caseIssues?: string;
  specificInstructions?: string;
  servicesDesired?: string[];
  additionalServices?: string[];
  otherServicesNote?: string;
  deliverySpeed?: DeliverySpeed;
  pdfReference?: boolean;
  batesReference?: boolean;
}

export function createCase(input: CaseInput) {
  return request<Case>("/cases", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCase(id: string, input: CaseInput) {
  return request<Case>(`/cases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function submitCase(id: string) {
  return request<Case>(`/cases/${id}/submit`, { method: "POST" });
}

export function updateCaseStatus(id: string, status: CaseStatus) {
  return request<Case>(`/cases/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function assignCase(id: string, assignedReviewerId: string | null) {
  return request<Case>(`/cases/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedReviewerId }),
  });
}

export function fetchCaseEvents(caseId: string) {
  return request<CaseEvent[]>(`/cases/${caseId}/events`);
}

export function addCaseComment(caseId: string, body: string) {
  return request<CaseEvent>(`/cases/${caseId}/events`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function fetchDocuments(caseId: string) {
  return request<CaseDocument[]>(`/cases/${caseId}/documents`);
}

export function uploadDocument(caseId: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  return request<CaseDocument>(`/cases/${caseId}/documents`, {
    method: "POST",
    body,
  });
}

export function downloadUrl(caseId: string, documentId: string) {
  return `${API_URL}/cases/${caseId}/documents/${documentId}/download`;
}

export function fetchOrganizations(params: PageParams = {}) {
  const qs = pageParams(params);
  return request<Paginated<Organization>>(`/organizations?${qs.toString()}`);
}

export function fetchOrganizationOptions() {
  return request<OrgOption[]>("/organizations/options");
}

export function fetchOrganization(id: string) {
  return request<Organization>(`/organizations/${id}`);
}

export function createOrganization(name: string) {
  return request<Organization>("/organizations", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export interface FetchUsersParams extends PageParams {
  organizationId?: string;
  role?: Role;
}

export function fetchUsers(params: FetchUsersParams = {}) {
  const qs = pageParams(params);
  if (params.organizationId) qs.set("organizationId", params.organizationId);
  if (params.role) qs.set("role", params.role);
  return request<Paginated<UserSummary>>(`/users?${qs.toString()}`);
}

export function fetchReviewers() {
  return request<UserSummary[]>("/users/reviewers");
}

export function fetchColleagues() {
  return request<UserSummary[]>("/users/me/colleagues");
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  organizationId: string;
}

export function createUser(input: CreateUserInput) {
  return request<UserSummary>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function setUserStatus(id: string, isActive: boolean) {
  return request<UserSummary>(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export interface FetchInvoicesParams extends PageParams {
  caseId?: string;
  organizationId?: string;
  status?: InvoiceStatus;
}

export function fetchInvoices(params: FetchInvoicesParams = {}) {
  const qs = pageParams(params);
  if (params.caseId) qs.set("caseId", params.caseId);
  if (params.organizationId) qs.set("organizationId", params.organizationId);
  if (params.status) qs.set("status", params.status);
  return request<Paginated<Invoice>>(`/invoices?${qs.toString()}`);
}

export function fetchInvoiceSummary(organizationId?: string) {
  const qs = organizationId ? `?organizationId=${organizationId}` : "";
  return request<InvoiceSummary>(`/invoices/summary${qs}`);
}

export function fetchInvoice(id: string) {
  return request<Invoice>(`/invoices/${id}`);
}

export function fetchInvoiceCaseOptions(organizationId?: string) {
  const qs = organizationId ? `?organizationId=${organizationId}` : "";
  return request<InvoiceCaseOption[]>(`/invoices/case-options${qs}`);
}

export interface InvoiceLineItemInput {
  caseId: string;
  description: string;
  amountCents: number;
}

export interface CreateInvoiceInput {
  organizationId: string;
  dueAt: string;
  lineItems: InvoiceLineItemInput[];
}

export function createInvoice(input: CreateInvoiceInput) {
  return request<Invoice>("/invoices", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface UpdateInvoiceInput {
  dueAt?: string;
  lineItems?: { caseId: string; description?: string; amountCents?: number }[];
}

export function updateInvoice(id: string, input: UpdateInvoiceInput) {
  return request<Invoice>(`/invoices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteInvoice(id: string) {
  return request<{ id: string }>(`/invoices/${id}`, { method: "DELETE" });
}

export function markInvoicePaid(id: string) {
  return request<Invoice>(`/invoices/${id}/pay`, { method: "PATCH" });
}
