import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  body!: string;

  @IsOptional()
  @IsIn(["CLIENT", "INTERNAL"])
  visibility?: "CLIENT" | "INTERNAL";
}
