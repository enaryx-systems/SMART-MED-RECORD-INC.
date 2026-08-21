import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuthenticatedUser } from "../../common/auth/jwt.strategy";
import { CASE_STATUSES, statusLabelFor } from "../../common/constants";

const STAFF_ROLES = ["case-manager", "physician", "reviewer", "billing", "admin"];

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(user: AuthenticatedUser) {
    const scope = STAFF_ROLES.includes(user.role) ? {} : { creatorId: user.id };

    const [
      totalCases,
      awaitingApproval,
      inProcessing,
      underReviewOrAudit,
      delivered,
      closed,
      recent,
      activity,
      statusCounts,
      upcoming,
      clientGroups,
    ] = await Promise.all([
      this.prisma.case.count({ where: scope }),
      this.prisma.case.count({ where: { ...scope, status: "AWAITING_APPROVAL" } }),
      this.prisma.case.count({ where: { ...scope, status: "IN_PROCESSING" } }),
      this.prisma.case.count({ where: { ...scope, status: { in: ["UNDER_REVIEW", "FINAL_AUDIT"] } } }),
      this.prisma.case.count({
        where: { ...scope, status: { in: ["DELIVERED", "FOLLOW_UP", "PAYMENT_PENDING"] } },
      }),
      this.prisma.case.count({ where: { ...scope, status: "CLOSED" } }),
      this.prisma.case.findMany({
        where: scope,
        orderBy: { updatedAt: "desc" },
        take: 8,
        include: {
          assignee: { select: { name: true } },
          reviewer: { select: { name: true } },
        },
      }),
      this.prisma.auditLog.findMany({
        where: STAFF_ROLES.includes(user.role) ? {} : { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true } }, case: { select: { caseNumber: true } } },
      }),
      this.prisma.case.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
      this.prisma.case.findMany({
        where: { ...scope, status: { not: "CLOSED" }, dueAt: { not: null } },
        orderBy: { dueAt: "asc" },
        take: 5,
        select: { id: true, caseNumber: true, matterName: true, dueAt: true, priority: true },
      }),
      this.prisma.case.groupBy({
        by: ["clientName"],
        where: scope,
        _count: { _all: true },
        orderBy: { _count: { clientName: "desc" } },
        take: 5,
      }),
    ]);

    const countByStatus = new Map(statusCounts.map((s) => [s.status, s._count._all]));

    return {
      role: user.role,
      stats: {
        totalCases,
        awaitingApproval,
        inProcessing,
        underReview: underReviewOrAudit,
        delivered,
        closed,
      },
      statusBreakdown: CASE_STATUSES.map((status) => ({
        status,
        label: statusLabelFor(user.role, status),
        count: countByStatus.get(status) ?? 0,
      })),
      cases: recent.map((c) => ({
        id: c.id,
        caseNumber: c.caseNumber,
        clientName: c.clientName,
        matterName: c.matterName,
        service: c.service,
        status: c.status,
        statusLabel: statusLabelFor(user.role, c.status),
        priority: c.priority,
        updatedAt: c.updatedAt,
        dueAt: c.dueAt,
        reviewer: c.reviewer?.name ?? c.assignee?.name ?? "Unassigned",
      })),
      activity: activity.map((a) => ({
        id: a.id,
        action: a.action,
        actor: a.user.name,
        caseNumber: a.case?.caseNumber,
        createdAt: a.createdAt,
      })),
      upcomingDeadlines: upcoming,
      topClients: clientGroups.map((g) => ({ clientName: g.clientName, count: g._count._all })),
    };
  }
}
