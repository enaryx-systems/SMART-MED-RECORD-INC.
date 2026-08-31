import { PrismaClient, CaseStatus, CaseType, OrgKind, Role } from "@prisma/client";
import { createClerkClient } from "@clerk/backend";
import { SERVICES_DESIRED_CATALOG } from "../src/modules/cases/case-catalog";

const prisma = new PrismaClient();

if (!process.env.CLERK_SECRET_KEY) {
  console.error(
    "CLERK_SECRET_KEY is not set — demo users need a real Clerk identity to log in. " +
      "Set it in apps/api/.env before seeding.",
  );
  process.exit(1);
}
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Seeding runs repeatedly against the same demo emails, but Clerk user
// creation isn't itself idempotent — reuse the existing Clerk identity for an
// email if one is already there instead of erroring on every re-seed.
async function findOrCreateClerkUser(opts: { email: string; name: string; password: string }) {
  const existing = await clerk.users.getUserList({ emailAddress: [opts.email] });
  if (existing.data[0]) return existing.data[0].id;

  const [firstName, ...rest] = opts.name.trim().split(/\s+/);
  const created = await clerk.users.createUser({
    emailAddress: [opts.email],
    password: opts.password,
    firstName,
    lastName: rest.join(" ") || undefined,
    skipPasswordChecks: false,
  });
  return created.id;
}

const STATUSES: CaseStatus[] = [
  "DRAFT",
  "NEW",
  "IN_PROGRESS",
  "ON_HOLD",
  "AWAITING_DELIVERY",
  "DELIVERED",
  "CANCELED",
];

const CASE_TYPES: CaseType[] = [
  "PERSONAL_INJURY",
  "MEDICAL_MALPRACTICE",
  "MASS_TORT_CLASS_ACTION",
  "SSD_CLAIMS",
  "NURSING_HOME",
  "SEXUAL_ABUSE_CASES",
  "WORKERS_COMPENSATION",
  "OTHER",
];

async function upsertUser(opts: {
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  password: string;
}) {
  const clerkUserId = await findOrCreateClerkUser(opts);
  return prisma.user.upsert({
    where: { email: opts.email },
    update: { name: opts.name, role: opts.role, organizationId: opts.organizationId, clerkUserId },
    create: {
      email: opts.email,
      clerkUserId,
      name: opts.name,
      role: opts.role,
      organizationId: opts.organizationId,
    },
  });
}

async function main() {
  // --- Organizations -------------------------------------------------
  const internalOrg = await prisma.organization.upsert({
    where: { id: "org_internal" },
    update: {},
    create: { id: "org_internal", name: "Smart Med Records — Internal", kind: OrgKind.INTERNAL },
  });

  const firmA = await prisma.organization.upsert({
    where: { id: "org_firm_blake" },
    update: {},
    create: { id: "org_firm_blake", name: "Blake & Associates", kind: OrgKind.CLIENT_FIRM },
  });

  const firmB = await prisma.organization.upsert({
    where: { id: "org_firm_harborview" },
    update: {},
    create: { id: "org_firm_harborview", name: "Harborview Legal Group", kind: OrgKind.CLIENT_FIRM },
  });

  // --- Users -----------------------------------------------------------
  const admin = await upsertUser({
    email: "admin@smartmedrecords.com",
    name: "Alex Morgan",
    role: Role.ADMIN,
    organizationId: internalOrg.id,
    password: "AdminPortal123!",
  });

  const reviewer = await upsertUser({
    email: "reviewer@smartmedrecords.com",
    name: "Riley Chen",
    role: Role.REVIEWER,
    organizationId: internalOrg.id,
    password: "ReviewerPortal123!",
  });

  const billing = await upsertUser({
    email: "billing@smartmedrecords.com",
    name: "Sam Patel",
    role: Role.BILLING,
    organizationId: internalOrg.id,
    password: "BillingPortal123!",
  });

  const clientA1 = await upsertUser({
    email: "client@smartmedrecords.com",
    name: "Jordan Blake",
    role: Role.CLIENT,
    organizationId: firmA.id,
    password: "ClientPortal123!",
  });

  const clientA2 = await upsertUser({
    email: "paralegal@blakeassociates.com",
    name: "Casey Rivera",
    role: Role.CLIENT,
    organizationId: firmA.id,
    password: "ClientPortal123!",
  });

  const clientB1 = await upsertUser({
    email: "attorney@harborviewlegal.com",
    name: "Taylor Nguyen",
    role: Role.CLIENT,
    organizationId: firmB.id,
    password: "ClientPortal123!",
  });

  // --- Cases -------------------------------------------------------------
  await prisma.case.deleteMany({ where: { organizationId: { in: [firmA.id, firmB.id] } } });

  const counts: Record<CaseStatus, number> = {
    DRAFT: 3,
    NEW: 6,
    IN_PROGRESS: 4,
    ON_HOLD: 3,
    AWAITING_DELIVERY: 5,
    DELIVERED: 12,
    CANCELED: 2,
  };

  const firms = [
    { org: firmA, owner: clientA1 },
    { org: firmB, owner: clientB1 },
  ];

  let seq = 1;
  const createdCases: { id: string; status: CaseStatus; organizationId: string }[] = [];
  for (const status of STATUSES) {
    for (let i = 0; i < counts[status]; i++) {
      const { org, owner } = firms[seq % firms.length];
      const caseNumber = `SMR-${String(seq).padStart(5, "0")}`;
      const caseType = CASE_TYPES[seq % CASE_TYPES.length];
      const servicesDesired = [
        SERVICES_DESIRED_CATALOG[seq % SERVICES_DESIRED_CATALOG.length],
        SERVICES_DESIRED_CATALOG[(seq + 1) % SERVICES_DESIRED_CATALOG.length],
      ];
      const assignReviewer = status !== "DRAFT" && seq % 3 === 0;
      const created = await prisma.case.create({
        data: {
          caseNumber,
          matterName: `${caseType.replace(/_/g, " ")} — Matter ${seq}`,
          caseType,
          contactName: owner.name,
          servicesDesired,
          status,
          submittedAt: status === "DRAFT" ? null : new Date(),
          dueAt: new Date(Date.now() + (seq % 14) * 24 * 60 * 60 * 1000),
          organizationId: org.id,
          ownerId: owner.id,
          assignedReviewerId: assignReviewer ? reviewer.id : null,
        },
      });
      createdCases.push({ id: created.id, status, organizationId: org.id });
      seq++;
    }
  }

  await prisma.caseNumberSequence.upsert({
    where: { id: 1 },
    update: { value: seq - 1 },
    create: { id: 1, value: seq - 1 },
  });
  await prisma.invoiceNumberSequence.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, value: 0 },
  });

  // --- Sample timeline events & invoices ---------------------------------
  const delivered = createdCases.find((c) => c.status === "DELIVERED");
  const inProgress = createdCases.find((c) => c.status === "IN_PROGRESS");
  // A second DELIVERED case from the same firm as `delivered`, to demonstrate
  // a consolidated (multi-case) invoice rather than every example being 1:1.
  const deliveredSameFirm = createdCases.find(
    (c) => c.status === "DELIVERED" && delivered && c.organizationId === delivered.organizationId && c.id !== delivered.id,
  );

  async function nextInvoiceNumber() {
    const seq = await prisma.invoiceNumberSequence.update({
      where: { id: 1 },
      data: { value: { increment: 1 } },
    });
    return `INV-${new Date().getFullYear()}-${String(seq.value).padStart(4, "0")}`;
  }

  if (delivered) {
    await prisma.caseEvent.createMany({
      data: [
        { caseId: delivered.id, authorId: admin.id, type: "ASSIGNMENT", body: "Case assigned to reviewer." },
        { caseId: delivered.id, authorId: reviewer.id, type: "NOTE", body: "Chronology drafted and cross-checked against source records." },
        { caseId: delivered.id, authorId: reviewer.id, type: "STATUS_CHANGE", body: "Status changed from IN_PROGRESS to DELIVERED." },
      ],
    });

    // Consolidated invoice covering both delivered cases from this firm when
    // a second one exists; otherwise a plain single-case invoice.
    const lineItems = [
      { caseId: delivered.id, description: `Medical records review — ${delivered.id}`, amountCents: 45000 },
      ...(deliveredSameFirm
        ? [{ caseId: deliveredSameFirm.id, description: `Medical records review — ${deliveredSameFirm.id}`, amountCents: 32000 }]
        : []),
    ];
    await prisma.invoice.create({
      data: {
        number: await nextInvoiceNumber(),
        organizationId: delivered.organizationId,
        amountCents: lineItems.reduce((sum, li) => sum + li.amountCents, 0),
        status: "PAID",
        dueAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        paidAt: new Date(),
        lineItems: { create: lineItems },
      },
    });
  }

  if (inProgress) {
    await prisma.caseEvent.create({
      data: {
        caseId: inProgress.id,
        authorId: clientA1.id,
        type: "NOTE",
        body: "Please prioritize the imaging records for this matter — expedited review requested.",
      },
    });

    await prisma.invoice.create({
      data: {
        number: await nextInvoiceNumber(),
        organizationId: inProgress.organizationId,
        amountCents: 32000,
        status: "PENDING",
        dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        lineItems: {
          create: [{ caseId: inProgress.id, description: `Medical records review — ${inProgress.id}`, amountCents: 32000 }],
        },
      },
    });
  }

  console.log("Seeded organizations:", { internalOrg: internalOrg.name, firmA: firmA.name, firmB: firmB.name });
  console.log("Seeded users:", {
    admin: admin.email,
    reviewer: reviewer.email,
    billing: billing.email,
    clientA1: clientA1.email,
    clientA2: clientA2.email,
    clientB1: clientB1.email,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
