import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import type { Response } from "express";
import { Role } from "@prisma/client";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import type { AuthUser } from "../../common/auth/jwt.strategy";
import { DocumentsService } from "./documents.service";

const UPLOAD_ROOT = process.env.UPLOAD_ROOT ?? path.join(process.cwd(), "uploads");
// Case ids are Prisma cuids; reject anything else before it ever touches a filesystem path
// (the upload interceptor runs before the controller's ownership check, so this guards against
// path traversal via a crafted :caseId route segment).
const SAFE_ID = /^[a-zA-Z0-9_-]+$/;

@Roles(Role.CLIENT, Role.ADMIN, Role.REVIEWER)
@Controller("cases/:caseId/documents")
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param("caseId") caseId: string) {
    return this.documentsService.list(user, caseId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const caseId = (req.params as { caseId: string }).caseId;
          if (!SAFE_ID.test(caseId)) {
            cb(new Error("Invalid case id."), "");
            return;
          }
          const dir = path.join(UPLOAD_ROOT, caseId);
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  upload(
    @CurrentUser() user: AuthUser,
    @Param("caseId") caseId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.create(user, caseId, file);
  }

  @Get(":documentId/download")
  async download(
    @CurrentUser() user: AuthUser,
    @Param("caseId") caseId: string,
    @Param("documentId") documentId: string,
    @Res() res: Response,
  ) {
    const doc = await this.documentsService.getForDownload(user, caseId, documentId);
    res.download(path.join(UPLOAD_ROOT, doc.caseId, doc.storageKey), doc.fileName);
  }
}
