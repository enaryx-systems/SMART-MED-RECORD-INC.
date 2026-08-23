import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import type { Response } from "express";
import { Role } from "@prisma/client";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import type { AuthUser } from "../../common/auth/jwt.strategy";
import { DocumentsService } from "./documents.service";

// Case ids are Prisma cuids; reject anything else before it's used to build
// a storage key or a local filesystem path.
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
      storage: memoryStorage(),
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  upload(
    @CurrentUser() user: AuthUser,
    @Param("caseId") caseId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!SAFE_ID.test(caseId)) {
      throw new BadRequestException("Invalid case id.");
    }
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
    await this.documentsService.sendFile(res, doc);
  }
}
