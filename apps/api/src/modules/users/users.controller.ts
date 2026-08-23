import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Role } from "@prisma/client";
import { UsersService, type ListUsersQuery } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { Roles } from "../../common/auth/roles.decorator";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import type { AuthUser } from "../../common/auth/jwt.strategy";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @Get()
  list(@Query() query: ListUsersQuery) {
    return this.usersService.list(query);
  }

  @Roles(Role.ADMIN)
  @Get("reviewers")
  reviewers() {
    return this.usersService.reviewers();
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Patch(":id/status")
  setStatus(@Param("id") id: string, @Body("isActive") isActive: boolean) {
    return this.usersService.setStatus(id, isActive);
  }

  @Roles(Role.CLIENT, Role.ADMIN, Role.REVIEWER, Role.BILLING)
  @Get("me/colleagues")
  colleagues(@CurrentUser() user: AuthUser) {
    return this.usersService.colleagues(user);
  }
}
