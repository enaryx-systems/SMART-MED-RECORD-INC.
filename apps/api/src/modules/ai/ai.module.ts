import { Module } from "@nestjs/common";
import { CasesModule } from "../cases/cases.module";
import { AiController, SearchController } from "./ai.controller";
import { AiExtractionService } from "./ai-extraction.service";
import { AiSummaryService } from "./ai-summary.service";
import { AiSearchService } from "./ai-search.service";
import { DocumentProcessor } from "./document.processor";

// The `document-processing` queue itself is registered once, globally, in
// QueueModule — importing CasesModule here just for AiController's use of
// CasesService.findOne() for RBAC scoping.
@Module({
  imports: [CasesModule],
  controllers: [AiController, SearchController],
  providers: [AiExtractionService, AiSummaryService, AiSearchService, DocumentProcessor],
  exports: [AiExtractionService, AiSearchService],
})
export class AiModule {}
