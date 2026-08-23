import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class UpdateInvoiceLineItemDto {
  @IsString()
  @MinLength(1)
  caseId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  amountCents?: number;
}
