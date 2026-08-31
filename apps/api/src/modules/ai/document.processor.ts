import { Logger } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { DOCUMENT_PROCESSING_QUEUE } from "../../common/queue/queue.module";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RealtimeGateway } from "../../common/realtime/realtime.gateway";
import { AiExtractionService } from "./ai-extraction.service";
import { AiSearchService } from "./ai-search.service";

interface DocumentJobData {
  documentId: string;
}

@Processor(DOCUMENT_PROCESSING_QUEUE)
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    private extraction: AiExtractionService,
    private search: AiSearchService,
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {
    super();
  }

  async process(job: Job<DocumentJobData>): Promise<void> {
    const { documentId } = job.data;

    try {
      await this.extraction.extract(documentId);
      // Embedding is a secondary, best-effort step — a search-index failure
      // shouldn't mark the whole extraction job (and its user-visible status)
      // as failed.
      await this.search.embedDocument(documentId).catch((err) => {
        this.logger.warn(`Embedding failed for document ${documentId}: ${(err as Error).message}`);
      });
    } finally {
      const doc = await this.prisma.document.findUnique({
        where: { id: documentId },
        include: {
          extraction: { select: { status: true } },
          case: { select: { id: true, organizationId: true, assignedReviewerId: true } },
        },
      });
      if (doc) {
        this.realtime.emitForCase(doc.case, "document:extraction-updated", {
          documentId,
          caseId: doc.case.id,
          status: doc.extraction?.status,
        });
      }
    }
  }
}
