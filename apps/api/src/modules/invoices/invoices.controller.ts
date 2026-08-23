import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Role } from "@prisma/client";
import { InvoicesService, type ListInvoicesQuery } from "./invoices.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { Roles } from "../../common/auth/roles.decorator";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import type { AuthUser } from "../../common/auth/jwt.strategy";

@Controller("invoices")
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Roles(Role.CLIENT, Role.ADMIN, Role.BILLING)
  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListInvoicesQuery) {
    return this.invoicesService.list(user, query);
  }

  @Roles(Role.CLIENT, Role.ADMIN, Role.BILLING)
  @Get("summary")
  summary(@CurrentUser() user: AuthUser, @Query("organizationId") organizationId?: string) {
    return this.invoicesService.summary(user, organizationId);
  }

  @Roles(Role.ADMIN, Role.BILLING)
  @Get("case-options")
  caseOptions(@Query("organizationId") organizationId?: string) {
    return this.invoicesService.caseOptions(organizationId);
  }

  @Roles(Role.CLIENT, Role.ADMIN, Role.BILLING)
  @Get(":id")
  findOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.invoicesService.findOne(user, id);
  }

  @Roles(Role.ADMIN, Role.BILLING)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(user, dto);
  }

  @Roles(Role.ADMIN, Role.BILLING)
  @Patch(":id")
  update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(user, id, dto);
  }

  @Roles(Role.ADMIN, Role.BILLING)
  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.invoicesService.remove(user, id);
  }

  @Roles(Role.ADMIN, Role.BILLING)
  @Patch(":id/pay")
  markPaid(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.invoicesService.markPaid(user, id);
  }
}
