import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Role } from "@prisma/client";
import { UsersService, type ListUsersQuery } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { BulkCreateUsersDto } from "./dto/bulk-create-users.dto";
import { Roles } from "../../common/auth/roles.decorator";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import type { AuthUser } from "../../common/auth/auth-user";

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
  @Post("bulk")
  bulkCreate(@Body() dto: BulkCreateUsersDto) {
    return this.usersService.bulkCreate(dto.rows);
  }

  @Roles(Role.ADMIN)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Patch(":id/status")
  setStatus(@Param("id") id: string, @Body("isActive") isActive: boolean) {
    return this.usersService.setStatus(id, isActive);
  }

  @Roles(Role.ADMIN)
  @Post(":id/reset-password")
  resetPassword(@Param("id") id: string) {
    return this.usersService.resetPassword(id);
  }

  @Roles(Role.ADMIN)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  @Roles(Role.CLIENT, Role.ADMIN, Role.REVIEWER, Role.BILLING)
  @Get("me/colleagues")
  colleagues(@CurrentUser() user: AuthUser) {
    return this.usersService.colleagues(user);
  }
}
