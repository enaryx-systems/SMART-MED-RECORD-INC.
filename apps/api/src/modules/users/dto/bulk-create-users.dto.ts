import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";

// Role and organization are free-text here (row.role, row.organization) —
// resolved against Role/Organization by name in the service, since the
// uploaded file supplies human labels ("Client", "Harborview Legal Group"),
// not internal ids.
export class BulkCreateUserRow {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  role!: string;

  @IsOptional()
  @IsString()
  organization?: string;
}

export class BulkCreateUsersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => BulkCreateUserRow)
  rows!: BulkCreateUserRow[];
}
