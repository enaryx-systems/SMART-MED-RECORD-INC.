import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { AuthenticatedUser } from "../../common/auth/jwt.strategy";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";

const STAFF_ROLES = ["case-manager", "physician", "reviewer", "billing", "admin"];
const BILLING_ROLES = ["case-manager", "billing", "admin"];

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(user: AuthenticatedUser, caseId?: string, status?: string) {
    const where: Record<string, unknown> = {};
    if (caseId) where.caseId = caseId;
    if (status) where.status = status;
    if (!STAFF_ROLES.includes(user.role)) {
      where.case = { creatorId: user.id };
    }
    return this.prisma.invoice.findMany({
      where,
      include: { case: { select: { id: true, caseNumber: true, matterName: true, clientName: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(dto: CreateInvoiceDto, user: AuthenticatedUser) {
    if (!BILLING_ROLES.includes(user.role)) {
      throw new ForbiddenException("Only billing or operations staff can issue invoices");
    }
    const c = await this.prisma.case.findUnique({ where: { id: dto.caseId } });
    if (!c) throw new NotFoundException("Case not found");

    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count();
    const number = `INV-${year}-${String(1000 + count + 1)}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        caseId: dto.caseId,
        number,
        amountCents: dto.amountCents,
        dueAt: new Date(dto.dueAt),
      },
    });

    if (["DELIVERED", "FOLLOW_UP"].includes(c.status)) {
      await this.prisma.case.update({ where: { id: c.id }, data: { status: "PAYMENT_PENDING" } });
    }

    await this.audit.log({
      userId: user.id,
      action: "INVOICE_ISSUED",
      entity: "Invoice",
      entityId: invoice.id,
      caseId: c.id,
      metadata: { number, amountCents: dto.amountCents },
    });

    return invoice;
  }

  async markPaid(id: string, user: AuthenticatedUser) {
    if (!BILLING_ROLES.includes(user.role)) {
      throw new ForbiddenException("Only billing or operations staff can record payment");
    }
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException("Invoice not found");

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date() },
    });

    await this.audit.log({
      userId: user.id,
      action: "INVOICE_PAID",
      entity: "Invoice",
      entityId: id,
      caseId: invoice.caseId,
    });

    return updated;
  }
}
