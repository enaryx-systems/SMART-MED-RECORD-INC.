import { NotFoundException } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { OrgKind } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { parsePagination, parseSort, type PageQuery } from "../../common/pagination/pagination";
import { CreateOrganizationDto } from "./dto/create-organization.dto";

const ORG_SORT_COLUMNS = ["name", "createdAt"] as const;

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async list(query: PageQuery) {
    const { page, pageSize, skip, take } = parsePagination(query);
    const { column, dir } = parseSort(query, ORG_SORT_COLUMNS, "name");
    const where = { kind: OrgKind.CLIENT_FIRM };

    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        orderBy: { [column]: dir },
        skip,
        take,
        include: { _count: { select: { users: true, cases: true } } },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  /** Unpaginated firm list for pickers (org filter dropdown, user-creation form). */
  listAll() {
    return this.prisma.organization.findMany({
      where: { kind: OrgKind.CLIENT_FIRM },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  }

  create(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: { name: dto.name, kind: OrgKind.CLIENT_FIRM },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, email: true, role: true, isActive: true },
        },
        cases: {
          orderBy: { createdAt: "desc" },
          select: { id: true, caseNumber: true, matterName: true, status: true, createdAt: true },
        },
      },
    });
    if (!org) throw new NotFoundException("Organization not found.");
    return org;
  }
}
