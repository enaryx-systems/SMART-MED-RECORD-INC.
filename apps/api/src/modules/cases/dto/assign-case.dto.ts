import { IsOptional, IsString } from "class-validator";

export class AssignCaseDto {
  @IsOptional()
  @IsString()
  assignedReviewerId?: string | null;
}
