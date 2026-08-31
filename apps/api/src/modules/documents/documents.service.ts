import * as path from "path";
import { randomUUID } from "crypto";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import type { Response } from "express";
import { DocumentKind, Role } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { DOCUMENT_PROCESSING_QUEUE } from "../../common/queue/queue.module";
import { enqueueWithTimeout } from "../../common/queue/enqueue-with-timeout";
import type { AuthUser } from "../../common/auth/auth-user";
import { CasesService } from "../cases/cases.service";

const TERMINAL_STATUSES = new Set(["DELIVERED", "CANCELED"]);
const EXTRACTABLE_MIME_TYPES = new Set(["application/pdf"]);

function isExtractable(mimeType: string) {
  return EXTRACTABLE_MIME_TYPES.has(mimeType) || mimeType.startsWith("image/");
}

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private casesService: CasesService,
    private storage: StorageService,
    @InjectQueue(DOCUMENT_PROCESSING_QUEUE) private queue: Queue,
  ) {}

  // A case unlocks its deliverable once its invoice (if any) is paid — no
  // invoice yet counts as unpaid, so a deliverable is never freely
  // downloadable by a client ahead of billing.
  private async isCasePaid(caseId: string) {
    const lineItem = await this.prisma.invoiceLineItem.findUnique({
      where: { caseId },
      include: { invoice: { select: { status: true } } },
    });
    return lineItem?.invoice.status === "PAID";
  }

  async list(user: AuthUser, caseId: string) {
    await this.casesService.findOne(user, caseId);
    const docs = await this.prisma.document.findMany({
      where: { caseId },
      orderBy: { createdAt: "desc" },
      include: { extraction: { select: { status: true } } },
    });

    if (user.role !== Role.CLIENT) {
      return docs.map((d) => ({ ...d, locked: false }));
    }

    const paid = await this.isCasePaid(caseId);
    return docs.map((d) => ({ ...d, locked: d.kind === DocumentKind.DELIVERABLE && !paid }));
  }

  async create(user: AuthUser, caseId: string, file: Express.Multer.File) {
    const found = await this.casesService.findOne(user, caseId);
    if (TERMINAL_STATUSES.has(found.status)) {
      throw new ForbiddenException("This case is closed and no longer accepts uploads.");
    }

    const kind: DocumentKind =
      user.role === Role.ADMIN || user.role === Role.REVIEWER
        ? DocumentKind.DELIVERABLE
        : DocumentKind.CLIENT_UPLOAD;

    const storageKey = `${caseId}/${randomUUID()}${path.extname(file.originalname)}`;
    await this.storage.upload(storageKey, file.buffer, file.mimetype);

    const doc = await this.prisma.document.create({
      data: {
        caseId,
        fileName: file.originalname,
        storageKey,
        mimeType: file.mimetype,
        size: file.size,
        uploadedById: user.id,
        kind,
      },
    });

    await this.prisma.caseEvent.create({
      data: {
        caseId,
        authorId: user.id,
        type: "DOCUMENT_UPLOADED",
        body:
          kind === DocumentKind.DELIVERABLE
            ? `Deliverable uploaded: ${file.originalname}`
            : `Document uploaded: ${file.originalname}`,
      },
    });

    // Only client-submitted source records get AI extraction — a reviewer's
    // finished deliverable has nothing to extract. Unsupported file types
    // (docx, etc.) are silently skipped rather than queued to fail.
    if (kind === DocumentKind.CLIENT_UPLOAD && isExtractable(file.mimetype)) {
      await this.prisma.documentExtraction.create({ data: { documentId: doc.id, status: "PENDING" } });
      await enqueueWithTimeout(this.queue, "extract-document", { documentId: doc.id });
    }

    return doc;
  }

  async getForDownload(user: AuthUser, caseId: string, documentId: string) {
    await this.casesService.findOne(user, caseId);
    const doc = await this.prisma.document.findFirst({ where: { id: documentId, caseId } });
    if (!doc) throw new NotFoundException("Document not found.");

    if (user.role === Role.CLIENT && doc.kind === DocumentKind.DELIVERABLE) {
      const paid = await this.isCasePaid(caseId);
      if (!paid) {
        throw new ForbiddenException("This deliverable unlocks once the case's invoice is paid.");
      }
    }

    return doc;
  }

  sendFile(res: Response, doc: { storageKey: string; fileName: string }) {
    return this.storage.sendFile(res, doc.storageKey, doc.fileName);
  }
}
