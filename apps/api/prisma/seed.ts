import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "smartmed123";

const DEMO_USERS = [
  { email: "attorney@demo.smartmedrecords.com", name: "Jordan Smith", role: "attorney", firm: "Hamilton & Pierce LLP" },
  { email: "ops@demo.smartmedrecords.com", name: "Sarah Johnson", role: "case-manager", firm: "Smart Med Records" },
  { email: "physician@demo.smartmedrecords.com", name: "Dr. Alan Mehta", role: "physician", firm: "Smart Med Records" },
  { email: "reviewer@demo.smartmedrecords.com", name: "Alex Joseph", role: "reviewer", firm: "Smart Med Records" },
  { email: "billing@demo.smartmedrecords.com", name: "Priya Rao", role: "billing", firm: "Smart Med Records" },
  { email: "admin@demo.smartmedrecords.com", name: "Morgan Lee", role: "admin", firm: "Smart Med Records" },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const users: Record<string, { id: string }> = {};
  for (const u of DEMO_USERS) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash },
    });
    users[u.role] = created;
  }

  const existingCases = await prisma.case.count();
  if (existingCases === 0) {
    const attorney = users["attorney"];
    const caseManager = users["case-manager"];
    const reviewer = users["reviewer"];
    const physician = users["physician"];

    const c1 = await prisma.case.create({
      data: {
        caseNumber: "SMR-2026-1001",
        clientName: "Maya Robinson",
        matterName: "Robinson v. Northstar",
        matterNumber: "ALF-78592",
        claimNumber: "CLM-2026-8471",
        service: "Medical Chronology",
        status: "IN_PROCESSING",
        priority: "URGENT",
        pages: 1842,
        instructions: "Detailed timeline of all treatments and procedures.",
        dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        creatorId: attorney.id,
        approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        approvedById: attorney.id,
        assigneeId: caseManager.id,
        reviewerId: reviewer.id,
        assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });

    const c2 = await prisma.case.create({
      data: {
        caseNumber: "SMR-2026-1002",
        clientName: "Daniel Kim",
        matterName: "Kim — Personal Injury",
        service: "Narrative Summary",
        status: "UNDER_REVIEW",
        priority: "STANDARD",
        pages: 964,
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        creatorId: attorney.id,
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        approvedById: attorney.id,
        assigneeId: caseManager.id,
        reviewerId: reviewer.id,
        assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });

    const c3 = await prisma.case.create({
      data: {
        caseNumber: "SMR-2026-1003",
        clientName: "Olivia Carter",
        matterName: "Carter v. Metro Health",
        service: "Demand Letter Drafting",
        status: "CLOSED",
        priority: "STANDARD",
        pages: 2216,
        dueAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        creatorId: attorney.id,
        approvedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        approvedById: attorney.id,
        assigneeId: caseManager.id,
        reviewerId: physician.id,
        qcById: caseManager.id,
        assignedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        closedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.case.create({
      data: {
        caseNumber: "SMR-2026-1004",
        clientName: "Ethan Brooks",
        matterName: "Brooks Workers' Comp",
        service: "Medical Billing Analysis",
        status: "AWAITING_APPROVAL",
        priority: "STANDARD",
        pages: 486,
        dueAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        creatorId: attorney.id,
      },
    });

    await prisma.message.createMany({
      data: [
        { caseId: c1.id, userId: caseManager.id, body: "Client approved the scope and pricing. Proceeding with detailed chronology.", visibility: "INTERNAL" },
        { caseId: c1.id, userId: attorney.id, body: "Please flag any gaps longer than 30 days.", visibility: "CLIENT" },
        { caseId: c2.id, userId: reviewer.id, body: "Draft is ready for comments.", visibility: "CLIENT" },
      ],
    });

    await prisma.invoice.create({
      data: {
        number: "INV-2026-1001",
        caseId: c3.id,
        amountCents: 284000,
        status: "PAID",
        dueAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.invoice.create({
      data: {
        number: "INV-2026-1002",
        caseId: c2.id,
        amountCents: 118000,
        status: "PENDING",
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("Seed complete. Demo login password for all accounts:", DEMO_PASSWORD);
  for (const u of DEMO_USERS) console.log(` - ${u.role.padEnd(12)} ${u.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
