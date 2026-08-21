import { IsIn, IsISO8601, IsOptional, IsString, MinLength } from "class-validator";
import { PRIORITIES } from "../../../common/constants";

export class CreateCaseDto {
  @IsString()
  @MinLength(1)
  clientName!: string;

  @IsString()
  @MinLength(1)
  matterName!: string;

  @IsOptional()
  @IsString()
  matterNumber?: string;

  @IsOptional()
  @IsString()
  claimNumber?: string;

  @IsString()
  @MinLength(1)
  service!: string;

  @IsOptional()
  @IsIn(PRIORITIES)
  priority?: string;

  @IsOptional()
  @IsISO8601()
  dueAt?: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}
