import { getSession, clearSession } from "@/lib/auth/session";
import type {
  ActivityRecord,
  CaseRecord,
  CaseStatus,
  DashboardSummary,
  DocumentRecord,
  InvoiceRecord,
  MessageRecord,
  Session,
  UserRecord,
} from "@/lib/types/portal";

const DEFAULT_API_URL = "http://localhost:4000/api";
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl() {
  if (
    typeof window !== "undefined" &&
    (!configuredApiUrl || configuredApiUrl === DEFAULT_API_URL)
  ) {
    return `http://${window.location.hostname}:4000/api`;
  }
  return configuredApiUrl ?? DEFAULT_API_URL;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getSession();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (session?.accessToken) headers.set("Authorization", `Bearer ${session.accessToken}`);

  const response = await fetch(`${getApiUrl()}${path}`, { ...options, headers, cache: "no-store" });

  if (response.status === 401) {
    clearSession();
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(Array.isArray(message) ? message.join(", ") : message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// ---------- Auth ----------
export async function login(payload: { email: string; password: string }): Promise<Session> {
  return apiFetch<Session>("/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export async function getMe() {
  return apiFetch<{ user: Session["user"] }>("/auth/me");
}

// ---------- Cases ----------
export async function getCases(params?: { q?: string; status?: string }) {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.status) search.set("status", params.status);
  const qs = search.toString();
  return apiFetch<CaseRecord[]>(`/cases${qs ? `?${qs}` : ""}`);
}

export async function getCase(id: string) {
  return apiFetch<CaseRecord>(`/cases/${id}`);
}

export async function createCase(payload: {
  clientName: string;
  matterName: string;
  matterNumber?: string;
  claimNumber?: string;
  service: string;
  priority?: string;
  dueAt?: string;
  instructions?: string;
}) {
  return apiFetch<CaseRecord>("/cases", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateCase(id: string, payload: Record<string, unknown>) {
  return apiFetch<CaseRecord>(`/cases/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export type CaseAction =
  | "approve"
  | "assign"
  | "acknowledge"
  | "submitForReview"
  | "reviewerApprove"
  | "reviewerReturn"
  | "qcApprove"
  | "qcReturn"
  | "markFollowUp"
  | "close"
  | "hold"
  | "resume";

export async function transitionCase(
  id: string,
  action: CaseAction,
  payload?: { assigneeId?: string; reviewerId?: string; qcById?: string; note?: string },
) {
  return apiFetch<CaseRecord>(`/cases/${id}/transition`, {
    method: "POST",
    body: JSON.stringify({ action, ...payload }),
  });
}

export async function getActivity(caseId: string) {
  return apiFetch<ActivityRecord[]>(`/cases/${caseId}/activity`);
}

export function caseStatusLabelColor(status: CaseStatus) {
  switch (status) {
    case "CLOSED":
      return "closed";
    case "DELIVERED":
    case "FOLLOW_UP":
    case "PAYMENT_PENDING":
      return "success";
    case "UNDER_REVIEW":
    case "FINAL_AUDIT":
      return "review";
    case "AWAITING_APPROVAL":
      return "pending";
    default:
      return "active";
  }
}

// ---------- Documents ----------
export async function listDocuments(caseId: string) {
  return apiFetch<DocumentRecord[]>(`/cases/${caseId}/documents`);
}

export async function uploadDocument(caseId: string, file: File, category?: string) {
  const form = new FormData();
  form.append("file", file);
  if (category) form.append("category", category);
  return apiFetch<DocumentRecord>(`/cases/${caseId}/documents`, { method: "POST", body: form });
}

export async function downloadDocument(caseId: string, documentId: string, name: string) {
  const session = getSession();
  const response = await fetch(
    `${getApiUrl()}/cases/${caseId}/documents/${documentId}/download`,
    { headers: session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {} },
  );
  if (!response.ok) throw new ApiError("Could not download this file", response.status);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------- Messages ----------
export async function listMessages(caseId: string) {
  return apiFetch<MessageRecord[]>(`/cases/${caseId}/messages`);
}

export async function sendMessage(caseId: string, body: string, visibility?: "CLIENT" | "INTERNAL") {
  return apiFetch<MessageRecord>(`/cases/${caseId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body, visibility }),
  });
}

// ---------- Invoices ----------
export async function listInvoices(params?: { caseId?: string; status?: string }) {
  const search = new URLSearchParams();
  if (params?.caseId) search.set("caseId", params.caseId);
  if (params?.status) search.set("status", params.status);
  const qs = search.toString();
  return apiFetch<InvoiceRecord[]>(`/invoices${qs ? `?${qs}` : ""}`);
}

export async function createInvoice(payload: { caseId: string; amountCents: number; dueAt: string }) {
  return apiFetch<InvoiceRecord>("/invoices", { method: "POST", body: JSON.stringify(payload) });
}

export async function markInvoicePaid(id: string) {
  return apiFetch<InvoiceRecord>(`/invoices/${id}/pay`, { method: "PATCH" });
}

// ---------- Users ----------
export async function listUsers(role?: string) {
  const qs = role ? `?role=${encodeURIComponent(role)}` : "";
  return apiFetch<UserRecord[]>(`/users${qs}`);
}

// ---------- Dashboard ----------
export async function getDashboardSummary() {
  return apiFetch<DashboardSummary>("/dashboard/summary");
}

// ---------- Services catalog ----------
export async function getServices() {
  return apiFetch<{ key: string; name: string; description: string }[]>("/services");
}
