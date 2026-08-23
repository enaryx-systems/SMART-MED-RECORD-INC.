import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { CaseType, DeliverySpeed } from "@prisma/client";
import { ADDITIONAL_SERVICES_CATALOG, SERVICES_DESIRED_CATALOG } from "../case-catalog";

export class CreateCaseDto {
  @IsString()
  @MinLength(2)
  matterName!: string;

  @IsEnum(CaseType)
  caseType!: CaseType;

  @IsOptional()
  @IsString()
  attorneyName?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  caseOverview?: string;

  @IsOptional()
  @IsString()
  caseIssues?: string;

  @IsOptional()
  @IsString()
  specificInstructions?: string;

  @IsOptional()
  @IsArray()
  @IsIn(SERVICES_DESIRED_CATALOG, { each: true })
  servicesDesired?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(ADDITIONAL_SERVICES_CATALOG, { each: true })
  additionalServices?: string[];

  @IsOptional()
  @IsString()
  otherServicesNote?: string;

  @IsOptional()
  @IsEnum(DeliverySpeed)
  deliverySpeed?: DeliverySpeed;

  @IsOptional()
  @IsBoolean()
  pdfReference?: boolean;

  @IsOptional()
  @IsBoolean()
  batesReference?: boolean;
}
