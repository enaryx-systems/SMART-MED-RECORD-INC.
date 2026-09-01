import * as fs from "fs";
import * as path from "path";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { InvoiceStatus, Prisma, Role } from "@prisma/client";
import puppeteer from "puppeteer";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EmailService } from "../../common/email/email.service";
import type { AuthUser } from "../../common/auth/auth-user";
import { parsePagination, parseSort, type PageQuery } from "../../common/pagination/pagination";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { renderInvoiceHtml } from "./invoice-pdf.template";

let cachedLogoDataUri: string | undefined;
function logoDataUri(): string {
  if (!cachedLogoDataUri) {
    const buffer = fs.readFileSync(path.join(process.cwd(), "assets", "invoice-logo.png"));
    cachedLogoDataUri = `data:image/png;base64,${buffer.toString("base64")}`;
  }
  return cachedLogoDataUri;
}

const INVOICE_SORT_COLUMNS = ["number", "amountCents", "dueAt", "status", "createdAt"] as const;

const LINE_ITEM_INCLUDE = {
  lineItems: {
    include: { case: { select: { id: true, caseNumber: true, matterName: true } } },
  },
  organization: { select: { id: true, name: true } },
} as const;

export interface ListInvoicesQuery extends PageQuery {
  caseId?: string;
  organizationId?: string;
  status?: InvoiceStatus;
}

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  private async notifyOrganization(organizationId: string, subject: string, text: string) {
    const users = await this.prisma.user.findMany({
      where: { organizationId },
      select: { email: true },
    });
    for (const u of users) void this.email.send({ to: u.email, subject, text });
  }

  private orgWhere(user: AuthUser, organizationId?: string) {
    if (user.role === Role.CLIENT) return user.organizationId;
    return organizationId;
  }

  async list(user: AuthUser, query: ListInvoicesQuery) {
    const { page, pageSize, skip, take } = parsePagination(query);
    const { column, dir } = parseSort(query, INVOICE_SORT_COLUMNS, "createdAt");
    const organizationId = this.orgWhere(user, query.organizationId);
    const where: Prisma.InvoiceWhereInput = {
      ...(organizationId ? { organizationId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.caseId ? { lineItems: { some: { caseId: query.caseId } } } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy: { [column]: dir },
        skip,
        take,
        include: LINE_ITEM_INCLUDE,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(user: AuthUser, id: string) {
    const organizationId = this.orgWhere(user, undefined);
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, ...(organizationId ? { organizationId } : {}) },
      include: LINE_ITEM_INCLUDE,
    });
    if (!invoice) throw new NotFoundException("Invoice not found.");
    return invoice;
  }

  async summary(user: AuthUser, organizationId?: string) {
    const scoped = this.orgWhere(user, organizationId);
    const where = scoped ? { organizationId: scoped } : {};

    const [pending, paid] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { ...where, status: "PENDING" },
        _sum: { amountCents: true },
        _count: { _all: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: "PAID" },
        _sum: { amountCents: true },
        _count: { _all: true },
      }),
    ]);

    return {
      outstandingCents: pending._sum.amountCents ?? 0,
      paidCents: paid._sum.amountCents ?? 0,
      pendingCount: pending._count._all,
      paidCount: paid._count._all,
    };
  }

  // Cases with no line item on any invoice yet — the billable pool. Scoping
  // to organizationId lets the consolidated-invoice picker list one firm's
  // open cases without exposing every other firm's.
  caseOptions(organizationId?: string) {
    return this.prisma.case.findMany({
      where: {
        invoiceLineItem: null,
        ...(organizationId ? { organizationId } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        caseNumber: true,
        status: true,
        organization: { select: { id: true, name: true } },
      },
    });
  }

  async create(user: AuthUser, dto: CreateInvoiceDto) {
    const caseIds = dto.lineItems.map((li) => li.caseId);
    const cases = await this.prisma.case.findMany({ where: { id: { in: caseIds } } });
    if (cases.length !== caseIds.length) {
      throw new BadRequestException("One or more cases could not be found.");
    }
    if (cases.some((c) => c.organizationId !== dto.organizationId)) {
      throw new BadRequestException(
        "All cases on an invoice must belong to the invoiced organization.",
      );
    }

    const amountCents = dto.lineItems.reduce((sum, li) => sum + li.amountCents, 0);

    let invoice;
    try {
      invoice = await this.prisma.$transaction(async (tx) => {
        const seq = await tx.invoiceNumberSequence.update({
          where: { id: 1 },
          data: { value: { increment: 1 } },
        });
        const number = `INV-${new Date().getFullYear()}-${String(seq.value).padStart(4, "0")}`;
        return tx.invoice.create({
          data: {
            number,
            organizationId: dto.organizationId,
            amountCents,
            dueAt: new Date(dto.dueAt),
            lineItems: {
              create: dto.lineItems.map((li) => ({
                caseId: li.caseId,
                description: li.description,
                amountCents: li.amountCents,
              })),
            },
          },
          include: LINE_ITEM_INCLUDE,
        });
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException("One or more of these cases already have an invoice.");
      }
      throw err;
    }

    await this.prisma.caseEvent.createMany({
      data: dto.lineItems.map((li) => ({
        caseId: li.caseId,
        authorId: user.id,
        type: "INVOICE_ISSUED" as const,
        body: `Invoice ${invoice.number} issued for $${(li.amountCents / 100).toFixed(2)}.`,
      })),
    });

    void this.notifyOrganization(
      dto.organizationId,
      `Invoice ${invoice.number} issued`,
      `A new invoice (${invoice.number}) for $${(amountCents / 100).toFixed(2)} covering ${dto.lineItems.length} case(s) has been issued, due ${new Date(dto.dueAt).toLocaleDateString()}.`,
    );

    return invoice;
  }

  async update(user: AuthUser, id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: LINE_ITEM_INCLUDE,
    });
    if (!invoice) throw new NotFoundException("Invoice not found.");
    if (invoice.status !== "PENDING") {
      throw new ConflictException("Only pending invoices can be edited.");
    }

    const lineItemById = new Map(invoice.lineItems.map((li) => [li.caseId, li]));

    return this.prisma.$transaction(async (tx) => {
      if (dto.lineItems) {
        for (const update of dto.lineItems) {
          if (!lineItemById.has(update.caseId)) continue; // ignore cases not already on this invoice
          await tx.invoiceLineItem.update({
            where: { id: lineItemById.get(update.caseId)!.id },
            data: {
              ...(update.description !== undefined ? { description: update.description } : {}),
              ...(update.amountCents !== undefined ? { amountCents: update.amountCents } : {}),
            },
          });
        }
      }

      const refreshedLineItems = await tx.invoiceLineItem.findMany({
        where: { invoiceId: id },
      });
      const amountCents = refreshedLineItems.reduce((sum, li) => sum + li.amountCents, 0);

      const updated = await tx.invoice.update({
        where: { id },
        data: {
          amountCents,
          ...(dto.dueAt !== undefined ? { dueAt: new Date(dto.dueAt) } : {}),
        },
        include: LINE_ITEM_INCLUDE,
      });

      await tx.caseEvent.createMany({
        data: invoice.lineItems.map((li) => ({
          caseId: li.caseId,
          authorId: user.id,
          type: "INVOICE_UPDATED" as const,
          body: `Invoice ${invoice.number} updated.`,
        })),
      });

      return updated;
    });
  }

  async remove(user: AuthUser, id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: LINE_ITEM_INCLUDE,
    });
    if (!invoice) throw new NotFoundException("Invoice not found.");
    if (invoice.status !== "PENDING") {
      throw new ConflictException("Only pending invoices can be deleted.");
    }

    // Line items cascade-delete with the invoice, freeing their cases back
    // into caseOptions() for a future invoice.
    await this.prisma.$transaction([
      this.prisma.caseEvent.createMany({
        data: invoice.lineItems.map((li) => ({
          caseId: li.caseId,
          authorId: user.id,
          type: "INVOICE_UPDATED" as const,
          body: `Invoice ${invoice.number} deleted.`,
        })),
      }),
      this.prisma.invoice.delete({ where: { id } }),
    ]);
    return { id };
  }

  async renderPdf(user: AuthUser, id: string): Promise<Buffer> {
    const invoice = await this.findOne(user, id);

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(renderInvoiceHtml(invoice, logoDataUri()), { waitUntil: "load" });
      const pdf = await page.pdf({ format: "A4", printBackground: true });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async markPaid(user: AuthUser, id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: LINE_ITEM_INCLUDE,
    });
    if (!invoice) throw new NotFoundException("Invoice not found.");

    const [updated] = await this.prisma.$transaction([
      this.prisma.invoice.update({
        where: { id },
        data: { status: "PAID", paidAt: new Date() },
        include: LINE_ITEM_INCLUDE,
      }),
      this.prisma.caseEvent.createMany({
        data: invoice.lineItems.map((li) => ({
          caseId: li.caseId,
          authorId: user.id,
          type: "INVOICE_PAID" as const,
          body: `Invoice ${invoice.number} marked paid.`,
        })),
      }),
    ]);

    void this.notifyOrganization(
      invoice.organizationId,
      `Invoice ${invoice.number} paid`,
      `Payment for invoice ${invoice.number} has been received. Any deliverables tied to it are now available to download.`,
    );

    return updated;
  }
}
