import { Injectable, NotFoundException } from "@nestjs/common";

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

@Injectable()
export class CasesService {
  private cases: CaseRecord[] = [
    {
      id: "1",
      caseNumber: "SMR-2026-1274",
      clientName: "Maya Robinson",
      matterName: "Robinson v. Northstar",
      service: "Medical Chronology",
      status: "Physician review",
      priority: "Urgent",
      updatedAt: "Today, 10:42 AM",
      dueAt: "Jul 17, 2026",
      progress: 78,
      pages: 1842,
      reviewer: "Dr. A. Mehta",
    },
    {
      id: "2",
      caseNumber: "SMR-2026-1273",
      clientName: "Daniel Kim",
      matterName: "Kim — Personal Injury",
      service: "Narrative Summary",
      status: "Processing",
      priority: "Standard",
      updatedAt: "Today, 9:18 AM",
      dueAt: "Jul 18, 2026",
      progress: 52,
      pages: 964,
      reviewer: "A. Joseph",
    },
    {
      id: "3",
      caseNumber: "SMR-2026-1269",
      clientName: "Olivia Carter",
      matterName: "Carter v. Metro Health",
      service: "Demand Letter",
      status: "Completed",
      priority: "Standard",
      updatedAt: "Yesterday",
      dueAt: "Jul 15, 2026",
      progress: 100,
      pages: 2216,
      reviewer: "Dr. N. Shah",
    },
    {
      id: "4",
      caseNumber: "SMR-2026-1264",
      clientName: "Ethan Brooks",
      matterName: "Brooks Workers’ Comp",
      service: "Billing Analysis",
      status: "Intake",
      priority: "Standard",
      updatedAt: "Jul 14, 2026",
      dueAt: "Jul 19, 2026",
      progress: 18,
      pages: 486,
      reviewer: "Unassigned",
    },
  ];
  findAll(q?: string) {
    return q
      ? this.cases.filter((c) =>
          JSON.stringify(c).toLowerCase().includes(q.toLowerCase()),
        )
      : this.cases;
  }
  findOne(id: string) {
    const found = this.cases.find((c) => c.id === id);
    if (!found) throw new NotFoundException("Case not found");
    return found;
  }
  create(input: Partial<CaseRecord>) {
    const next = {
      ...this.cases[0],
      ...input,
      id: String(this.cases.length + 1),
      caseNumber: `SMR-2026-${1274 + this.cases.length}`,
      status: "Intake",
      progress: 10,
      updatedAt: "Just now",
    } as CaseRecord;
    this.cases.unshift(next);
    return next;
  }
  update(id: string, input: Partial<CaseRecord>) {
    const index = this.cases.findIndex((c) => c.id === id);
    if (index < 0) throw new NotFoundException("Case not found");
    this.cases[index] = {
      ...this.cases[index],
      ...input,
      updatedAt: "Just now",
    };
    return this.cases[index];
  }
}
