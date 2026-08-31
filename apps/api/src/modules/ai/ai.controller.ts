import { BadRequestException, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { Role } from "@prisma/client";
import { DOCUMENT_PROCESSING_QUEUE } from "../../common/queue/queue.module";
import { enqueueWithTimeout } from "../../common/queue/enqueue-with-timeout";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import type { AuthUser } from "../../common/auth/auth-user";
import { CasesService } from "../cases/cases.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AiSummaryService } from "./ai-summary.service";
import { AiSearchService } from "./ai-search.service";

@Roles(Role.CLIENT, Role.ADMIN, Role.REVIEWER)
@Controller("cases/:caseId")
export class AiController {
  constructor(
    @InjectQueue(DOCUMENT_PROCESSING_QUEUE) private queue: Queue,
    private casesService: CasesService,
    private prisma: PrismaService,
    private summaryService: AiSummaryService,
  ) {}

  @Roles(Role.ADMIN, Role.REVIEWER)
  @Post("documents/:documentId/extract")
  async extract(
    @CurrentUser() user: AuthUser,
    @Param("caseId") caseId: string,
    @Param("documentId") documentId: string,
  ) {
    await this.casesService.findOne(user, caseId); // enforces RBAC scope, throws 404 otherwise
    const doc = await this.prisma.document.findFirst({ where: { id: documentId, caseId } });
    if (!doc) throw new BadRequestException("Document not found on this case.");

    await this.prisma.documentExtraction.upsert({
      where: { documentId },
      update: { status: "PENDING", error: null },
      create: { documentId, status: "PENDING" },
    });
    const queued = await enqueueWithTimeout(this.queue, "extract-document", { documentId });
    return { queued };
  }

  @Get("documents/:documentId/extraction")
  async getExtraction(
    @CurrentUser() user: AuthUser,
    @Param("caseId") caseId: string,
    @Param("documentId") documentId: string,
  ) {
    await this.casesService.findOne(user, caseId);
    return this.prisma.documentExtraction.findUnique({ where: { documentId } });
  }

  @Roles(Role.ADMIN, Role.REVIEWER)
  @Post("summary")
  async generateSummary(@CurrentUser() user: AuthUser, @Param("caseId") caseId: string) {
    await this.casesService.findOne(user, caseId);
    return this.summaryService.generate(caseId);
  }

  @Get("summary")
  async getSummary(@CurrentUser() user: AuthUser, @Param("caseId") caseId: string) {
    await this.casesService.findOne(user, caseId);
    return this.summaryService.getLatest(caseId);
  }
}

@Roles(Role.CLIENT, Role.ADMIN, Role.REVIEWER)
@Controller("search")
export class SearchController {
  constructor(private searchService: AiSearchService) {}

  @Get()
  search(@CurrentUser() user: AuthUser, @Query("q") q: string, @Query("caseId") caseId?: string) {
    if (!q || q.trim().length < 2) {
      throw new BadRequestException("Provide a search query of at least 2 characters.");
    }
    return this.searchService.search(user, q.trim(), caseId);
  }
}
