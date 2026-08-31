import {
  ArrayMinSize,
  IsArray,
  IsISO8601,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateInvoiceLineItemDto } from "./create-invoice-line-item.dto";

export class CreateInvoiceDto {
  @IsString()
  @MinLength(1)
  organizationId!: string;

  @IsISO8601()
  dueAt!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineItemDto)
  lineItems!: CreateInvoiceLineItemDto[];
}
