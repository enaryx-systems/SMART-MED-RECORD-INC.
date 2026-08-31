import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { ClerkService } from "../../common/auth/clerk.service";
import { EmailService } from "../../common/email/email.service";
import type { AuthUser } from "../../common/auth/auth-user";
import { parsePagination, parseSort, type PageQuery } from "../../common/pagination/pagination";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import type { BulkCreateUserRow } from "./dto/bulk-create-users.dto";

const USER_SORT_COLUMNS = ["name", "email", "createdAt"] as const;

export interface ListUsersQuery extends PageQuery {
  organizationId?: string;
  role?: string;
  search?: string;
}

const ROLE_VALUES = new Set<string>(Object.values(Role));

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

const ROLE_BY_LABEL: Record<string, Role> = {
  client: Role.CLIENT,
  admin: Role.ADMIN,
  reviewer: Role.REVIEWER,
  billing: Role.BILLING,
};

function randomTempPassword() {
  // 12 chars drawn from an alphanumeric + symbol set, always satisfying
  // Clerk's default complexity requirements (upper/lower/digit present).
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private clerk: ClerkService,
    private email: EmailService,
  ) {}

  async list(query: ListUsersQuery) {
    const { page, pageSize, skip, take } = parsePagination(query);
    const { column, dir } = parseSort(query, USER_SORT_COLUMNS, "createdAt");
    const search = query.search?.trim();
    const orgIds =
      query.organizationId
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) ?? [];
    const roles = (query.role
      ?.split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((r) => ROLE_VALUES.has(r)) ?? []) as Role[];
    const where: Prisma.UserWhereInput = {
      ...(orgIds.length === 1
        ? { organizationId: orgIds[0] }
        : orgIds.length > 1
          ? { organizationId: { in: orgIds } }
          : {}),
      ...(roles.length === 1
        ? { role: roles[0] }
        : roles.length > 1
          ? { role: { in: roles } }
          : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
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

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { ...SELECT, _count: { select: { cases: true, assignedCases: true } } },
    });
    if (!user) throw new NotFoundException("User not found.");
    return user;
  }

  async create(dto: CreateUserDto) {
    if (!process.env.CLERK_SECRET_KEY) {
      throw new ServiceUnavailableException("Identity provider is not configured.");
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException("A user with this email already exists.");

    const organization = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });
    if (!organization) throw new BadRequestException("Organization not found.");

    const [firstName, ...rest] = dto.name.trim().split(/\s+/);
    let clerkUserId: string;
    try {
      const clerkUser = await this.clerk.client.users.createUser({
        emailAddress: [dto.email],
        password: dto.password,
        firstName,
        lastName: rest.join(" ") || undefined,
        skipPasswordChecks: false,
      });
      clerkUserId = clerkUser.id;
    } catch {
      throw new BadRequestException(
        "Could not create the identity-provider account for this user (check the email/password meet Clerk's requirements).",
      );
    }

    const created = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        clerkUserId,
        role: dto.role,
        organizationId: dto.organizationId,
      },
      select: SELECT,
    });

    void this.email.send({
      to: dto.email,
      subject: "Your Smart Med Records account is ready",
      text: `Hi ${dto.name}, an account has been created for you on Smart Med Records as a ${dto.role.toLowerCase()}. Sign in at ${process.env.FRONTEND_URL}/portal/login with the email/password your administrator shared with you.`,
    });

    return created;
  }

  // Resolves each row's free-text role/organization label against our
  // enums/table, since the uploaded file speaks in labels ("Client",
  // "Harborview Legal Group"), not internal ids — then creates each user the
  // same way the single-create form does (Clerk identity + local row +
  // notification email), collecting a per-row result instead of failing the
  // whole batch on the first bad row.
  async bulkCreate(rows: BulkCreateUserRow[]) {
    if (!process.env.CLERK_SECRET_KEY) {
      throw new ServiceUnavailableException("Identity provider is not configured.");
    }

    const organizations = await this.prisma.organization.findMany({
      select: { id: true, name: true, kind: true },
    });
    const internalOrg = organizations.find((o) => o.kind === "INTERNAL");
    const orgByName = new Map(organizations.map((o) => [o.name.trim().toLowerCase(), o]));

    const results: { row: number; email: string; status: "created" | "failed"; error?: string }[] =
      [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;
      try {
        const role = ROLE_BY_LABEL[row.role.trim().toLowerCase()];
        if (!role) {
          throw new Error(
            `Unrecognized role "${row.role}" (use Client, Admin, Reviewer, or Billing).`,
          );
        }

        const isInternal = role !== Role.CLIENT;
        const org = isInternal
          ? internalOrg
          : row.organization
            ? orgByName.get(row.organization.trim().toLowerCase())
            : undefined;
        if (!org) {
          throw new Error(
            isInternal
              ? "Internal organization is not set up."
              : `Organization "${row.organization ?? ""}" was not found.`,
          );
        }

        const existing = await this.prisma.user.findUnique({ where: { email: row.email } });
        if (existing) throw new Error("A user with this email already exists.");

        const password = randomTempPassword();
        const [firstName, ...rest] = row.name.trim().split(/\s+/);
        const clerkUser = await this.clerk.client.users.createUser({
          emailAddress: [row.email],
          password,
          firstName,
          lastName: rest.join(" ") || undefined,
          skipPasswordChecks: false,
        });

        await this.prisma.user.create({
          data: {
            name: row.name,
            email: row.email,
            clerkUserId: clerkUser.id,
            role,
            organizationId: org.id,
          },
        });

        void this.email.send({
          to: row.email,
          subject: "Your Smart Med Records account is ready",
          text: `Hi ${row.name}, an account has been created for you on Smart Med Records as a ${role.toLowerCase()}. Sign in at ${process.env.FRONTEND_URL}/portal/login — your temporary password is ${password}.`,
        });

        results.push({ row: rowNumber, email: row.email, status: "created" });
      } catch (err) {
        results.push({
          row: rowNumber,
          email: row.email,
          status: "failed",
          error: err instanceof Error ? err.message : "Could not create this user.",
        });
      }
    }

    return {
      created: results.filter((r) => r.status === "created").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    };
  }

  // Name/role/org only — email is the Clerk sign-in identity, and changing
  // it requires a separate verified-address flow, so it stays read-only here.
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found.");

    if (dto.organizationId) {
      const organization = await this.prisma.organization.findUnique({
        where: { id: dto.organizationId },
      });
      if (!organization) throw new BadRequestException("Organization not found.");
    }

    if (dto.name && dto.name !== user.name) {
      try {
        const [firstName, ...rest] = dto.name.trim().split(/\s+/);
        await this.clerk.client.users.updateUser(user.clerkUserId, {
          firstName,
          lastName: rest.join(" ") || undefined,
        });
      } catch {
        throw new BadRequestException(
          "Could not update the identity-provider account for this user.",
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.organizationId !== undefined ? { organizationId: dto.organizationId } : {}),
      },
      select: SELECT,
    });
  }

  async resetPassword(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found.");

    const password = randomTempPassword();
    try {
      await this.clerk.client.users.updateUser(user.clerkUserId, {
        password,
        skipPasswordChecks: false,
      });
    } catch {
      throw new BadRequestException("Could not reset the password with the identity provider.");
    }

    void this.email.send({
      to: user.email,
      subject: "Your Smart Med Records password was reset",
      text: `Hi ${user.name}, your password was reset by an administrator. Your new temporary password is ${password}. Sign in at ${process.env.FRONTEND_URL}/portal/login.`,
    });

    return { password };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        clerkUserId: true,
        _count: {
          select: { cases: true, assignedCases: true, uploadedDocuments: true, caseEvents: true },
        },
      },
    });
    if (!user) throw new NotFoundException("User not found.");

    const { cases, assignedCases, uploadedDocuments, caseEvents } = user._count;
    if (cases + assignedCases + uploadedDocuments + caseEvents > 0) {
      throw new BadRequestException(
        "This user has activity on the platform (owned cases, assigned reviews, uploads, or comments) and can't be deleted. Suspend the account instead.",
      );
    }

    try {
      await this.clerk.client.users.deleteUser(user.clerkUserId);
    } catch {
      // identity-provider account may already be gone — proceed with the local delete regardless
    }

    await this.prisma.user.delete({ where: { id } });
    return { id };
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
