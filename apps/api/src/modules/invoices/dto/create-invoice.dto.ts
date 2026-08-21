import { IsInt, IsISO8601, IsString, Min, MinLength } from "class-validator";

export class CreateInvoiceDto {
  @IsString()
  @MinLength(1)
  caseId!: string;

  @IsInt()
  @Min(1)
  amountCents!: number;

  @IsISO8601()
  dueAt!: string;
}
