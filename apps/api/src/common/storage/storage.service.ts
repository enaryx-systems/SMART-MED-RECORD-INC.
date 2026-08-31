import * as fs from "fs";
import * as path from "path";
import { Injectable } from "@nestjs/common";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Response } from "express";

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Local disk in dev (fine for one machine), S3-compatible object storage
 * whenever S3_BUCKET is configured (required in production — most hosts,
 * Railway included, don't guarantee a container's disk survives a redeploy).
 * Selecting the backend by env var, not a flag/shim, since dev and prod
 * genuinely need different storage for the same reason DATABASE_URL differs.
 */
@Injectable()
export class StorageService {
  private s3?: S3Client;
  private bucket?: string;
  private localRoot: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || undefined;
    this.localRoot = process.env.UPLOAD_ROOT ?? path.join(process.cwd(), "uploads");

    if (this.bucket) {
      this.s3 = new S3Client({
        region: process.env.S3_REGION || "auto",
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
        credentials:
          process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
            ? {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              }
            : undefined,
      });
    }
  }

  get usingObjectStorage() {
    return !!this.s3 && !!this.bucket;
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<void> {
    if (this.s3 && this.bucket) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      return;
    }
    const filePath = path.join(this.localRoot, key);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
  }

  /** Reads the stored file's raw bytes — for internal processing (AI
   * extraction/embedding) rather than serving it to a browser. */
  async download(key: string): Promise<Buffer> {
    if (this.s3 && this.bucket) {
      const result = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      return streamToBuffer(result.Body as NodeJS.ReadableStream);
    }
    return fs.promises.readFile(path.join(this.localRoot, key));
  }

  /** Sends the stored file as the HTTP response — a redirect to a short-lived
   * signed URL for S3, or a direct file stream for local disk. */
  async sendFile(res: Response, key: string, fileName: string): Promise<void> {
    if (this.s3 && this.bucket) {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
      });
      const url = await getSignedUrl(this.s3, command, { expiresIn: 60 });
      res.redirect(url);
      return;
    }
    res.download(path.join(this.localRoot, key), fileName);
  }
}
