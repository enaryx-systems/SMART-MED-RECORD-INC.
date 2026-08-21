import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../../common/auth/jwt.strategy";
import { Roles } from "../../common/auth/roles.decorator";
import { CasesService } from "./cases.service";
import { CreateCaseDto } from "./dto/create-case.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";
import { TransitionCaseDto } from "./dto/transition-case.dto";

@ApiTags("cases")
@Controller("cases")
export class CasesController {
  constructor(private readonly cases: CasesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query("q") q?: string,
    @Query("status") status?: string,
  ) {
    return this.cases.findAll(user, q, status);
  }

  @Get("statuses")
  statuses() {
    return this.cases.statuses();
  }

  @Get(":id")
  detail(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.cases.findOne(id, user);
  }

  @Get(":id/activity")
  activity(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.cases.activity(id, user);
  }

  @Post()
  @Roles("attorney", "case-manager", "admin")
  create(@Body() body: CreateCaseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cases.create(body, user);
  }

  @Patch(":id")
  @Roles("case-manager", "admin")
  update(
    @Param("id") id: string,
    @Body() body: UpdateCaseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cases.update(id, body, user);
  }

  @Post(":id/transition")
  transition(
    @Param("id") id: string,
    @Body() body: TransitionCaseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cases.transition(id, body, user);
  }
}
