import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { AuthenticatedUser } from "../../common/auth/jwt.strategy";
import { CreateMessageDto } from "../cases/dto/create-message.dto";

const STAFF_ROLES = ["case-manager", "physician", "reviewer", "billing", "admin"];

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async assertCaseAccess(caseId: string, user: AuthenticatedUser) {
    const c = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!c) throw new NotFoundException("Case not found");
    if (!STAFF_ROLES.includes(user.role) && c.creatorId !== user.id) {
      throw new ForbiddenException("You cannot access messages for this case");
    }
    return c;
  }

  async list(caseId: string, user: AuthenticatedUser) {
    await this.assertCaseAccess(caseId, user);
    const visibility = STAFF_ROLES.includes(user.role) ? undefined : "CLIENT";
    return this.prisma.message.findMany({
      where: { caseId, ...(visibility ? { visibility } : {}) },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(caseId: string, dto: CreateMessageDto, user: AuthenticatedUser) {
    await this.assertCaseAccess(caseId, user);
    const visibility = STAFF_ROLES.includes(user.role) ? (dto.visibility ?? "CLIENT") : "CLIENT";
    const message = await this.prisma.message.create({
      data: { caseId, userId: user.id, body: dto.body, visibility },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
    await this.audit.log({
      userId: user.id,
      action: "MESSAGE_SENT",
      entity: "Message",
      entityId: message.id,
      caseId,
    });
    return message;
  }
}
