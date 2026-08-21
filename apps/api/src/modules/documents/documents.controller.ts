import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import { diskStorage } from "multer";
import * as fs from "fs";
import * as path from "path";
import type { Response } from "express";
import { randomUUID } from "crypto";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../../common/auth/jwt.strategy";
import { DocumentsService, UPLOAD_ROOT } from "./documents.service";

@ApiTags("documents")
@Controller("cases/:caseId/documents")
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  list(@Param("caseId") caseId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documents.list(caseId, user);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const caseId = (req.params as { caseId: string }).caseId;
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
    @Param("caseId") caseId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body("category") category: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.documents.create(caseId, file, category, user);
  }

  @Get(":documentId/download")
  async download(
    @Param("caseId") caseId: string,
    @Param("documentId") documentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const file = await this.documents.getFileForDownload(caseId, documentId, user);
    res.download(file.path, file.name);
  }
}
