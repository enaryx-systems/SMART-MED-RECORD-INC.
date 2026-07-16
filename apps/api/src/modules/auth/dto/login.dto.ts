import { IsEmail, IsIn, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsIn([
    "attorney",
    "case-manager",
    "physician",
    "reviewer",
    "billing",
    "admin",
  ])
  role!: string;
}
