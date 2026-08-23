import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CaseStatus, CaseType, Role } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuthUser } from "../../common/auth/jwt.strategy";
import { parsePagination, parseSort, type PageQuery } from "../../common/pagination/pagination";
import { CreateCaseDto } from "./dto/create-case.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";
import { UpdateCaseStatusDto } from "./dto/update-case-status.dto";
import { AssignCaseDto } from "./dto/assign-case.dto";
import { CreateCaseEventDto } from "./dto/create-case-event.dto";

const ALL_STATUSES: CaseStatus[] = [
  "DRAFT",
  "NEW",
  "IN_PROGRESS",
  "ON_HOLD",
  "AWAITING_DELIVERY",
  "DELIVERED",
  "CANCELED",
];

const CASE_SORT_COLUMNS = ["createdAt", "caseNumber", "matterName", "status", "dueAt"] as const;

export interface ListCasesQuery extends PageQuery {
  status?: CaseStatus;
  caseType?: CaseType;
  organizationId?: string;
  reviewerId?: string;
  createdFrom?: string;
  createdTo?: string;
}

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  private scopeFor(user: AuthUser) {
    switch (user.role) {
      case Role.CLIENT:
        return { organizationId: user.organizationId };
      case Role.REVIEWER:
        return { assignedReviewerId: user.id };
      case Role.ADMIN:
      default:
        return {};
    }
  }

  async list(user: AuthUser, query: ListCasesQuery) {
    const { page, pageSize, skip, take } = parsePagination(query);
    const { column, dir } = parseSort(query, CASE_SORT_COLUMNS, "createdAt");
    const where = {
      ...this.scopeFor(user),
      ...(query.status ? { status: query.status } : {}),
      ...(query.caseType ? { caseType: query.caseType } : {}),
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.reviewerId ? { assignedReviewerId: query.reviewerId } : {}),
      ...(query.createdFrom || query.createdTo
        ? {
            createdAt: {
              ...(query.createdFrom ? { gte: new Date(query.createdFrom) } : {}),
              ...(query.createdTo ? { lte: new Date(query.createdTo) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        orderBy: { [column]: dir },
        skip,
        take,
        include: {
          owner: { select: { name: true, email: true } },
          organization: { select: { id: true, name: true } },
          assignedReviewer: { select: { id: true, name: true } },
        },
      }),
      this.prisma.case.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  private statsScope(user: AuthUser, organizationId?: string) {
    return {
      ...this.scopeFor(user),
      ...(organizationId ? { organizationId } : {}),
    };
  }

  async stats(user: AuthUser, organizationId?: string) {
    const where = this.statsScope(user, organizationId);

    const [grouped, byOrg, byReviewer] = await Promise.all([
      this.prisma.case.groupBy({ by: ["status"], where, _count: { _all: true } }),
      this.prisma.case.groupBy({ by: ["organizationId"], where, _count: { _all: true } }),
      this.prisma.case.groupBy({ by: ["assignedReviewerId"], where, _count: { _all: true } }),
    ]);

    const counts = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0])) as Record<
      CaseStatus,
      number
    >;
    for (const row of grouped) counts[row.status] = row._count._all;

    const orgIds = byOrg.map((r) => r.organizationId);
    const orgs = orgIds.length
      ? await this.prisma.organization.findMany({
          where: { id: { in: orgIds } },
          select: { id: true, name: true },
        })
      : [];
    const orgNameById = new Map(orgs.map((o) => [o.id, o.name]));
    const byOrganization = byOrg
      .map((row) => ({
        organizationId: row.organizationId,
        organizationName: orgNameById.get(row.organizationId) ?? "Unknown",
        count: row._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    const reviewerIds = byReviewer.map((r) => r.assignedReviewerId).filter((id): id is string => !!id);
    const reviewers = reviewerIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: reviewerIds } },
          select: { id: true, name: true },
        })
      : [];
    const reviewerNameById = new Map(reviewers.map((r) => [r.id, r.name]));
    const byReviewerList = byReviewer
      .filter((row) => row.assignedReviewerId)
      .map((row) => ({
        reviewerId: row.assignedReviewerId as string,
        reviewerName: reviewerNameById.get(row.assignedReviewerId as string) ?? "Unknown",
        count: row._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
      byOrganization,
      byReviewer: byReviewerList,
    };
  }

  async create(user: AuthUser, dto: CreateCaseDto) {
    return this.prisma.$transaction(async (tx) => {
      const seq = await tx.caseNumberSequence.update({
        where: { id: 1 },
        data: { value: { increment: 1 } },
      });
      const caseNumber = `SMR-${String(seq.value).padStart(5, "0")}`;
      return tx.case.create({
        data: {
          caseNumber,
          matterName: dto.matterName,
          caseType: dto.caseType,
          attorneyName: dto.attorneyName,
          contactName: dto.contactName,
          contactEmail: dto.contactEmail,
          contactPhone: dto.contactPhone,
          caseOverview: dto.caseOverview,
          caseIssues: dto.caseIssues,
          specificInstructions: dto.specificInstructions,
          servicesDesired: dto.servicesDesired ?? [],
          additionalServices: dto.additionalServices ?? [],
          otherServicesNote: dto.otherServicesNote,
          deliverySpeed: dto.deliverySpeed,
          pdfReference: dto.pdfReference,
          batesReference: dto.batesReference,
          status: "DRAFT",
          organizationId: user.organizationId,
          ownerId: user.id,
        },
      });
    });
  }

  async findOne(user: AuthUser, id: string) {
    const found = await this.prisma.case.findFirst({
      where: { id, ...this.scopeFor(user) },
      include: {
        owner: { select: { name: true, email: true } },
        organization: { select: { id: true, name: true } },
        assignedReviewer: { select: { id: true, name: true } },
      },
    });
    if (!found) throw new NotFoundException("Case not found.");
    return found;
  }

  async update(user: AuthUser, id: string, dto: UpdateCaseDto) {
    const found = await this.findOne(user, id);
    if (found.status !== "DRAFT") {
      throw new ForbiddenException("Only draft cases can be edited.");
    }

    return this.prisma.case.update({
      where: { id: found.id },
      data: {
        ...(dto.matterName !== undefined ? { matterName: dto.matterName } : {}),
        ...(dto.caseType !== undefined ? { caseType: dto.caseType } : {}),
        ...(dto.attorneyName !== undefined ? { attorneyName: dto.attorneyName } : {}),
        ...(dto.contactName !== undefined ? { contactName: dto.contactName } : {}),
        ...(dto.contactEmail !== undefined ? { contactEmail: dto.contactEmail } : {}),
        ...(dto.contactPhone !== undefined ? { contactPhone: dto.contactPhone } : {}),
        ...(dto.caseOverview !== undefined ? { caseOverview: dto.caseOverview } : {}),
        ...(dto.caseIssues !== undefined ? { caseIssues: dto.caseIssues } : {}),
        ...(dto.specificInstructions !== undefined
          ? { specificInstructions: dto.specificInstructions }
          : {}),
        ...(dto.servicesDesired !== undefined ? { servicesDesired: dto.servicesDesired } : {}),
        ...(dto.additionalServices !== undefined
          ? { additionalServices: dto.additionalServices }
          : {}),
        ...(dto.otherServicesNote !== undefined
          ? { otherServicesNote: dto.otherServicesNote }
          : {}),
        ...(dto.deliverySpeed !== undefined ? { deliverySpeed: dto.deliverySpeed } : {}),
        ...(dto.pdfReference !== undefined ? { pdfReference: dto.pdfReference } : {}),
        ...(dto.batesReference !== undefined ? { batesReference: dto.batesReference } : {}),
      },
    });
  }

  async submit(user: AuthUser, id: string) {
    const found = await this.findOne(user, id);
    if (found.status !== "DRAFT") {
      throw new ForbiddenException("This case has already been submitted.");
    }

    const missing: string[] = [];
    if (!found.matterName || found.matterName.trim().length < 2) missing.push("case name");
    if (!found.caseType) missing.push("case type");
    if (!found.servicesDesired || found.servicesDesired.length === 0) missing.push("services desired");
    if (missing.length > 0) {
      throw new BadRequestException(`Missing required fields: ${missing.join(", ")}.`);
    }

    return this.prisma.case.update({
      where: { id: found.id },
      data: { status: "NEW", submittedAt: new Date() },
    });
  }

  async updateStatus(user: AuthUser, id: string, dto: UpdateCaseStatusDto) {
    const found = await this.findOne(user, id);
    const updated = await this.prisma.case.update({
      where: { id: found.id },
      data: { status: dto.status },
    });
    await this.prisma.caseEvent.create({
      data: {
        caseId: found.id,
        authorId: user.id,
        type: "STATUS_CHANGE",
        body: `Status changed from ${found.status} to ${dto.status}.`,
      },
    });
    return updated;
  }

  async assign(user: AuthUser, id: string, dto: AssignCaseDto) {
    const found = await this.findOne(user, id);
    const reviewerId = dto.assignedReviewerId ?? null;

    if (reviewerId) {
      const reviewer = await this.prisma.user.findFirst({
        where: { id: reviewerId, role: Role.REVIEWER, isActive: true },
      });
      if (!reviewer) throw new BadRequestException("Reviewer not found.");
    }

    const updated = await this.prisma.case.update({
      where: { id: found.id },
      data: { assignedReviewerId: reviewerId },
    });
    await this.prisma.caseEvent.create({
      data: {
        caseId: found.id,
        authorId: user.id,
        type: "ASSIGNMENT",
        body: reviewerId ? `Case assigned to reviewer.` : `Case unassigned.`,
      },
    });
    return updated;
  }

  async listEvents(user: AuthUser, id: string) {
    await this.findOne(user, id);
    return this.prisma.caseEvent.findMany({
      where: { caseId: id },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { name: true, role: true } } },
    });
  }

  async addEvent(user: AuthUser, id: string, dto: CreateCaseEventDto) {
    await this.findOne(user, id);
    return this.prisma.caseEvent.create({
      data: {
        caseId: id,
        authorId: user.id,
        type: "NOTE",
        body: dto.body,
      },
      include: { author: { select: { name: true, role: true } } },
    });
  }
}
