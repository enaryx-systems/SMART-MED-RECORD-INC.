import { IsString, MinLength } from "class-validator";

export class CreateCaseEventDto {
  @IsString()
  @MinLength(1)
  body!: string;
}
