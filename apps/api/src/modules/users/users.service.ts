import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuthUser } from "../../common/auth/jwt.strategy";
import { parsePagination, parseSort, type PageQuery } from "../../common/pagination/pagination";
import { CreateUserDto } from "./dto/create-user.dto";

const USER_SORT_COLUMNS = ["name", "email", "createdAt"] as const;

export interface ListUsersQuery extends PageQuery {
  organizationId?: string;
  role?: Role;
}

const SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  organizationId: true,
  organization: { select: { id: true, name: true } },
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListUsersQuery) {
    const { page, pageSize, skip, take } = parsePagination(query);
    const { column, dir } = parseSort(query, USER_SORT_COLUMNS, "createdAt");
    const where = {
      ...(query.organizationId ? { organizationId: query.organizationId } : {}),
      ...(query.role ? { role: query.role } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { [column]: dir },
        skip,
        take,
        select: { ...SELECT, _count: { select: { cases: true } } },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException("A user with this email already exists.");

    const organization = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });
    if (!organization) throw new BadRequestException("Organization not found.");

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        organizationId: dto.organizationId,
      },
      select: SELECT,
    });
  }

  async setStatus(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found.");
    return this.prisma.user.update({ where: { id }, data: { isActive }, select: SELECT });
  }

  colleagues(user: AuthUser) {
    return this.prisma.user.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  reviewers() {
    return this.prisma.user.findMany({
      where: { role: Role.REVIEWER, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    });
  }
}
