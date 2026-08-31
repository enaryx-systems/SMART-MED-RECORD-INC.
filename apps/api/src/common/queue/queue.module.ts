import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";

export const DOCUMENT_PROCESSING_QUEUE = "document-processing";
export const EMAIL_QUEUE = "email";

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" },
    }),
    BullModule.registerQueue({ name: DOCUMENT_PROCESSING_QUEUE }, { name: EMAIL_QUEUE }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
