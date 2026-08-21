import { IsIn, IsISO8601, IsOptional, IsString, MinLength } from "class-validator";
import { PRIORITIES } from "../../../common/constants";

export class UpdateCaseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  clientName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  matterName?: string;

  @IsOptional()
  @IsString()
  matterNumber?: string;

  @IsOptional()
  @IsString()
  claimNumber?: string;

  @IsOptional()
  @IsString()
  service?: string;

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
