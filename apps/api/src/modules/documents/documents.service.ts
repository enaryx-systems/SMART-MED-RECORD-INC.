import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { AuthenticatedUser } from "../../common/auth/jwt.strategy";
import { DOCUMENT_CATEGORIES } from "../../common/constants";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const STAFF_ROLES = ["case-manager", "physician", "reviewer", "billing", "admin"];

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async assertCaseAccess(caseId: string, user: AuthenticatedUser) {
    const c = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!c) throw new NotFoundException("Case not found");
    if (!STAFF_ROLES.includes(user.role) && c.creatorId !== user.id) {
      throw new ForbiddenException("You cannot access documents for this case");
    }
    return c;
  }

  async list(caseId: string, user: AuthenticatedUser) {
    await this.assertCaseAccess(caseId, user);
    return this.prisma.document.findMany({
      where: { caseId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(
    caseId: string,
    file: Express.Multer.File,
    category: string | undefined,
    user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException("A file is required");
    await this.assertCaseAccess(caseId, user);
    const resolvedCategory = DOCUMENT_CATEGORIES.includes(category as never)
      ? (category as string)
      : "OTHER";

    const doc = await this.prisma.document.create({
      data: {
        caseId,
        name: file.originalname,
        storageKey: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        category: resolvedCategory,
        uploadedById: user.id,
      },
    });
    await this.audit.log({
      userId: user.id,
      action: "DOCUMENT_UPLOADED",
      entity: "Document",
      entityId: doc.id,
      caseId,
      metadata: { name: file.originalname, size: file.size },
    });
    return doc;
  }

  async getFileForDownload(caseId: string, documentId: string, user: AuthenticatedUser) {
    await this.assertCaseAccess(caseId, user);
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc || doc.caseId !== caseId) throw new NotFoundException("Document not found");
    const filePath = path.join(UPLOAD_ROOT, caseId, doc.storageKey);
    if (!fs.existsSync(filePath)) throw new NotFoundException("File is no longer available");
    return { path: filePath, name: doc.name, mimeType: doc.mimeType };
  }
}
