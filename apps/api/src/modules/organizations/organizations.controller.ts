import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Role } from "@prisma/client";
import { OrganizationsService } from "./organizations.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { Roles } from "../../common/auth/roles.decorator";
import type { PageQuery } from "../../common/pagination/pagination";

@Roles(Role.ADMIN)
@Controller("organizations")
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get()
  list(@Query() query: PageQuery) {
    return this.organizationsService.list(query);
  }

  @Roles(Role.ADMIN, Role.REVIEWER, Role.BILLING)
  @Get("options")
  listAll() {
    return this.organizationsService.listAll();
  }

  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.organizationsService.findOne(id);
  }
}
