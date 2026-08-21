import { IsIn, IsOptional, IsString } from "class-validator";

export const CASE_ACTIONS = [
  "approve",
  "assign",
  "acknowledge",
  "submitForReview",
  "reviewerApprove",
  "reviewerReturn",
  "qcApprove",
  "qcReturn",
  "markFollowUp",
  "close",
  "hold",
  "resume",
] as const;
export type CaseAction = (typeof CASE_ACTIONS)[number];

export class TransitionCaseDto {
  @IsIn(CASE_ACTIONS)
  action!: CaseAction;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsString()
  qcById?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
