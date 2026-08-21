import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../../common/auth/jwt.strategy";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { InvoicesService } from "./invoices.service";

@ApiTags("invoices")
@Controller("invoices")
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query("caseId") caseId?: string,
    @Query("status") status?: string,
  ) {
    return this.invoices.list(user, caseId, status);
  }

  @Post()
  create(@Body() body: CreateInvoiceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.invoices.create(body, user);
  }

  @Patch(":id/pay")
  markPaid(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.invoices.markPaid(id, user);
  }
}
