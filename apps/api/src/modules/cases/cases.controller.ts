import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Role } from "@prisma/client";
import { CasesService, type ListCasesQuery } from "./cases.service";
import { CreateCaseDto } from "./dto/create-case.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";
import { UpdateCaseStatusDto } from "./dto/update-case-status.dto";
import { AssignCaseDto } from "./dto/assign-case.dto";
import { CreateCaseEventDto } from "./dto/create-case-event.dto";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import type { AuthUser } from "../../common/auth/auth-user";

@Controller("cases")
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Roles(Role.CLIENT, Role.ADMIN, Role.REVIEWER)
  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListCasesQuery) {
    return this.casesService.list(user, query);
  }

  @Roles(Role.CLIENT, Role.ADMIN, Role.REVIEWER)
  @Get("stats")
  stats(@CurrentUser() user: AuthUser, @Query("organizationId") organizationId?: string) {
    return this.casesService.stats(user, organizationId);
  }

  @Roles(Role.CLIENT, Role.ADMIN, Role.REVIEWER)
  @Get(":id")
  findOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.casesService.findOne(user, id);
  }

  @Roles(Role.CLIENT)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCaseDto) {
    return this.casesService.create(user, dto);
  }

  @Roles(Role.CLIENT)
  @Patch(":id")
  update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateCaseDto) {
    return this.casesService.update(user, id, dto);
  }

  @Roles(Role.CLIENT)
  @Post(":id/submit")
  submit(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.casesService.submit(user, id);
  }

  @Roles(Role.ADMIN, Role.REVIEWER)
  @Patch(":id/status")
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateCaseStatusDto,
  ) {
    return this.casesService.updateStatus(user, id, dto);
  }

  @Roles(Role.ADMIN)
  @Patch(":id/assign")
  assign(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: AssignCaseDto) {
    return this.casesService.assign(user, id, dto);
  }

  @Roles(Role.CLIENT, Role.ADMIN, Role.REVIEWER)
  @Get(":id/events")
  listEvents(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.casesService.listEvents(user, id);
  }

  @Roles(Role.CLIENT, Role.ADMIN, Role.REVIEWER)
  @Post(":id/events")
  addEvent(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: CreateCaseEventDto,
  ) {
    return this.casesService.addEvent(user, id, dto);
  }
}
