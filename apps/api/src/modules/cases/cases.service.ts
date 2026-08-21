import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Case } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { AuthenticatedUser } from "../../common/auth/jwt.strategy";
import { CASE_STATUSES, CaseStatusValue, STATUS_PROGRESS, statusLabelFor } from "../../common/constants";
import { CreateCaseDto } from "./dto/create-case.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";
import { CaseAction, TransitionCaseDto } from "./dto/transition-case.dto";

const STAFF_ROLES = ["case-manager", "physician", "reviewer", "billing", "admin"];
const OPERATIONS_ROLES = ["case-manager", "admin"];

const CASE_INCLUDE = {
  creator: { select: { id: true, name: true, email: true, role: true } },
  assignee: { select: { id: true, name: true, email: true, role: true } },
  reviewer: { select: { id: true, name: true, email: true, role: true } },
  qcBy: { select: { id: true, name: true, email: true, role: true } },
  documents: { orderBy: { createdAt: "desc" as const } },
  invoices: { orderBy: { createdAt: "desc" as const } },
};

type CaseWithRelations = Case & {
  creator: { id: string; name: string; email: string; role: string };
  assignee: { id: string; name: string; email: string; role: string } | null;
  reviewer: { id: string; name: string; email: string; role: string } | null;
  qcBy: { id: string; name: string; email: string; role: string } | null;
  documents: unknown[];
  invoices: unknown[];
};

@Injectable()
export class CasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  serialize(c: CaseWithRelations, viewer: AuthenticatedUser) {
    const status = c.status as CaseStatusValue;
    return {
      id: c.id,
      caseNumber: c.caseNumber,
      clientName: c.clientName,
      matterName: c.matterName,
      matterNumber: c.matterNumber,
      claimNumber: c.claimNumber,
      service: c.service,
      status: c.status,
      statusLabel: statusLabelFor(viewer.role, c.status),
      onHold: c.onHold,
      priority: c.priority,
      instructions: viewer.role === "attorney" ? undefined : c.instructions,
      progress: c.onHold ? STATUS_PROGRESS[status] ?? 0 : STATUS_PROGRESS[status] ?? 0,
      pages: c.pages,
      dueAt: c.dueAt,
      approvedAt: c.approvedAt,
      approvedPending: !c.approvedAt && c.status === "AWAITING_APPROVAL",
      assignedAt: c.assignedAt,
      acknowledgedAt: c.acknowledgedAt,
      deliveredAt: c.deliveredAt,
      closedAt: c.closedAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      creator: c.creator,
      assignee: c.assignee,
      reviewer: c.reviewer,
      qcBy: c.qcBy,
      documentCount: c.documents.length,
      invoiceCount: c.invoices.length,
    };
  }

  private canView(caseRecord: Case, user: AuthenticatedUser) {
    if (STAFF_ROLES.includes(user.role)) return true;
    return caseRecord.creatorId === user.id;
  }

  private async getRawOrThrow(id: string) {
    const found = await this.prisma.case.findUnique({ where: { id }, include: CASE_INCLUDE });
    if (!found) throw new NotFoundException("Case not found");
    return found as unknown as CaseWithRelations;
  }

  async findAll(user: AuthenticatedUser, q?: string, status?: string) {
    const where: Record<string, unknown> = {};
    if (!STAFF_ROLES.includes(user.role)) where.creatorId = user.id;
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { caseNumber: { contains: q } },
        { clientName: { contains: q } },
        { matterName: { contains: q } },
        { service: { contains: q } },
      ];
    }
    const cases = await this.prisma.case.findMany({
      where,
      include: CASE_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });
    return (cases as unknown as CaseWithRelations[]).map((c) => this.serialize(c, user));
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const found = await this.getRawOrThrow(id);
    if (!this.canView(found, user)) throw new ForbiddenException("You cannot view this case");
    return this.serialize(found, user);
  }

  private async getForMutation(id: string, user: AuthenticatedUser) {
    const found = await this.getRawOrThrow(id);
    if (!this.canView(found, user)) throw new ForbiddenException("You cannot view this case");
    return found;
  }

  async create(dto: CreateCaseDto, user: AuthenticatedUser) {
    if (!["attorney", "case-manager", "admin"].includes(user.role)) {
      throw new ForbiddenException("Only clients or operations staff can open a new case");
    }
    const year = new Date().getFullYear();
    const count = await this.prisma.case.count();
    const caseNumber = `SMR-${year}-${String(1000 + count + 1)}`;
    const created = await this.prisma.case.create({
      data: {
        caseNumber,
        clientName: dto.clientName,
        matterName: dto.matterName,
        matterNumber: dto.matterNumber,
        claimNumber: dto.claimNumber,
        service: dto.service,
        priority: dto.priority ?? "STANDARD",
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        instructions: dto.instructions,
        status: "AWAITING_APPROVAL",
        creatorId: user.id,
      },
      include: CASE_INCLUDE,
    });
    await this.audit.log({
      userId: user.id,
      action: "CASE_CREATED",
      entity: "Case",
      entityId: created.id,
      caseId: created.id,
      metadata: { caseNumber },
    });
    return this.serialize(created as unknown as CaseWithRelations, user);
  }

  async update(id: string, dto: UpdateCaseDto, user: AuthenticatedUser) {
    if (!OPERATIONS_ROLES.includes(user.role)) {
      throw new ForbiddenException("Only operations staff can edit case details");
    }
    await this.getForMutation(id, user);
    const updated = await this.prisma.case.update({
      where: { id },
      data: {
        ...dto,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
      include: CASE_INCLUDE,
    });
    await this.audit.log({
      userId: user.id,
      action: "CASE_UPDATED",
      entity: "Case",
      entityId: id,
      caseId: id,
    });
    return this.serialize(updated as unknown as CaseWithRelations, user);
  }

  async transition(id: string, dto: TransitionCaseDto, user: AuthenticatedUser) {
    const c = await this.getForMutation(id, user);
    const updated = await this.applyAction(c, dto, user);
    await this.audit.log({
      userId: user.id,
      action: `CASE_${dto.action.toUpperCase()}`,
      entity: "Case",
      entityId: id,
      caseId: id,
      metadata: { note: dto.note, fromStatus: c.status, toStatus: updated.status },
    });
    if (dto.note) {
      await this.prisma.message.create({
        data: {
          caseId: id,
          userId: user.id,
          body: dto.note,
          visibility: "INTERNAL",
        },
      });
    }
    const fresh = await this.getRawOrThrow(id);
    return this.serialize(fresh, user);
  }

  private assertRole(user: AuthenticatedUser, allowed: string[], message: string) {
    if (!allowed.includes(user.role)) throw new ForbiddenException(message);
  }

  private assertOwnerOrRole(
    user: AuthenticatedUser,
    ownerId: string | null,
    allowed: string[],
    message: string,
  ) {
    if (ownerId === user.id) return;
    if (allowed.includes(user.role)) return;
    throw new ForbiddenException(message);
  }

  private async applyAction(c: Case, dto: TransitionCaseDto, user: AuthenticatedUser) {
    const action: CaseAction = dto.action;

    switch (action) {
      case "approve": {
        if (c.status !== "AWAITING_APPROVAL") {
          throw new BadRequestException("Only cases awaiting approval can be approved");
        }
        this.assertRole(
          user,
          ["attorney", "case-manager", "admin"],
          "Only the client or operations staff can record approval",
        );
        if (c.approvedAt) throw new BadRequestException("This case is already approved");
        return this.prisma.case.update({
          where: { id: c.id },
          data: { approvedAt: new Date(), approvedById: user.id },
        });
      }
      case "assign": {
        if (c.status !== "AWAITING_APPROVAL") {
          throw new BadRequestException("Only approved cases can be assigned");
        }
        this.assertRole(user, OPERATIONS_ROLES, "Only operations staff can assign a case");
        if (!c.approvedAt) {
          throw new ForbiddenException(
            "Cannot assign: client approval has not been documented yet",
          );
        }
        if (!dto.assigneeId) throw new BadRequestException("assigneeId is required to assign a case");
        return this.prisma.case.update({
          where: { id: c.id },
          data: {
            status: "IN_PROCESSING",
            assigneeId: dto.assigneeId,
            reviewerId: dto.reviewerId ?? c.reviewerId,
            qcById: dto.qcById ?? c.qcById,
            assignedAt: new Date(),
          },
        });
      }
      case "acknowledge": {
        if (c.status !== "IN_PROCESSING") {
          throw new BadRequestException("Only in-processing cases can be acknowledged");
        }
        this.assertOwnerOrRole(
          user,
          c.assigneeId,
          ["admin"],
          "Only the assigned staff member can acknowledge this case",
        );
        return this.prisma.case.update({
          where: { id: c.id },
          data: { acknowledgedAt: new Date() },
        });
      }
      case "submitForReview": {
        if (c.status !== "IN_PROCESSING") {
          throw new BadRequestException("Only in-processing cases can be submitted for review");
        }
        this.assertOwnerOrRole(
          user,
          c.assigneeId,
          OPERATIONS_ROLES,
          "Only the assigned staff member can submit this case for review",
        );
        return this.prisma.case.update({
          where: { id: c.id },
          data: { status: "UNDER_REVIEW" },
        });
      }
      case "reviewerApprove":
      case "reviewerReturn": {
        if (c.status !== "UNDER_REVIEW") {
          throw new BadRequestException("Only cases under review can be reviewed");
        }
        if (c.reviewerId) {
          this.assertOwnerOrRole(
            user,
            c.reviewerId,
            ["admin"],
            "Only the assigned reviewer can act on this case",
          );
        } else {
          this.assertRole(
            user,
            ["reviewer", "physician", "admin"],
            "Only a reviewer can pick up this case",
          );
        }
        return this.prisma.case.update({
          where: { id: c.id },
          data: {
            status: action === "reviewerApprove" ? "FINAL_AUDIT" : "IN_PROCESSING",
            reviewerId: c.reviewerId ?? user.id,
          },
        });
      }
      case "qcApprove":
      case "qcReturn": {
        if (c.status !== "FINAL_AUDIT") {
          throw new BadRequestException("Only cases in final audit can be QC'd");
        }
        this.assertRole(
          user,
          OPERATIONS_ROLES,
          "Only final audit / operations staff can complete quality control",
        );
        return this.prisma.case.update({
          where: { id: c.id },
          data: {
            status: action === "qcApprove" ? "DELIVERED" : "IN_PROCESSING",
            qcById: user.id,
            deliveredAt: action === "qcApprove" ? new Date() : null,
          },
        });
      }
      case "markFollowUp": {
        if (c.status !== "DELIVERED") {
          throw new BadRequestException("Only delivered cases can move to follow-up");
        }
        this.assertRole(
          user,
          ["case-manager", "billing", "admin"],
          "Only operations or billing staff can record follow-up",
        );
        return this.prisma.case.update({
          where: { id: c.id },
          data: { status: "FOLLOW_UP" },
        });
      }
      case "close": {
        if (!["FOLLOW_UP", "PAYMENT_PENDING", "DELIVERED"].includes(c.status)) {
          throw new BadRequestException("Only delivered cases can be closed");
        }
        this.assertRole(user, OPERATIONS_ROLES, "Only operations staff can close a case");
        if (!c.deliveredAt) {
          throw new ForbiddenException("Cannot close: the case has not been delivered yet");
        }
        const unpaid = await this.prisma.invoice.count({
          where: { caseId: c.id, status: { not: "PAID" } },
        });
        if (unpaid > 0) {
          throw new ForbiddenException("Cannot close: this case has unpaid invoices");
        }
        return this.prisma.case.update({
          where: { id: c.id },
          data: { status: "CLOSED", closedAt: new Date() },
        });
      }
      case "hold": {
        this.assertRole(user, OPERATIONS_ROLES, "Only operations staff can place a case on hold");
        if (c.status === "CLOSED") throw new BadRequestException("Closed cases cannot be held");
        return this.prisma.case.update({ where: { id: c.id }, data: { onHold: true } });
      }
      case "resume": {
        this.assertRole(user, OPERATIONS_ROLES, "Only operations staff can resume a case");
        return this.prisma.case.update({ where: { id: c.id }, data: { onHold: false } });
      }
      default:
        throw new BadRequestException("Unknown action");
    }
  }

  async activity(id: string, user: AuthenticatedUser) {
    const c = await this.getForMutation(id, user);
    const logs = await this.prisma.auditLog.findMany({
      where: { caseId: c.id },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
    return logs.map((l) => ({
      id: l.id,
      action: l.action,
      entity: l.entity,
      metadata: l.metadata ? JSON.parse(l.metadata) : null,
      user: l.user,
      createdAt: l.createdAt,
    }));
  }

  statuses() {
    return CASE_STATUSES;
  }
}
