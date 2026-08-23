import { IsInt, IsString, Min, MinLength } from "class-validator";

export class CreateInvoiceLineItemDto {
  @IsString()
  @MinLength(1)
  caseId!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsInt()
  @Min(1)
  amountCents!: number;
}
