export type Role =
  "attorney" | "case-manager" | "physician" | "reviewer" | "billing" | "admin";

export type CaseRecord = {
  id: string;
  caseNumber: string;
  clientName: string;
  matterName: string;
  service: string;
  status: string;
  priority: string;
  updatedAt: string;
  dueAt: string;
  progress: number;
  pages: number;
  reviewer: string;
};
