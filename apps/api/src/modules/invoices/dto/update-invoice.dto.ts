import { IsArray, IsISO8601, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UpdateInvoiceLineItemDto } from "./update-invoice-line-item.dto";

export class UpdateInvoiceDto {
  @IsOptional()
  @IsISO8601()
  dueAt?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInvoiceLineItemDto)
  lineItems?: UpdateInvoiceLineItemDto[];
}
