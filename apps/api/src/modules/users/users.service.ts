import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(role?: string) {
    const users = await this.prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firm: true,
        createdAt: true,
        _count: { select: { assignedCases: true, reviewedCases: true, auditedCases: true } },
      },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      firm: u.firm,
      createdAt: u.createdAt,
      activeCaseCount: u._count.assignedCases + u._count.reviewedCases + u._count.auditedCases,
    }));
  }
}
