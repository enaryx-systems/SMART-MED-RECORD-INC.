import { Logger } from "@nestjs/common";
import type { Queue } from "bullmq";

const logger = new Logger("QueueEnqueue");

// BullMQ/ioredis retries a lost Redis connection for many seconds before an
// `add()` call rejects, which would otherwise hang the HTTP request that
// triggered it. Fail fast instead so the request completes — the job just
// doesn't get queued, and can be retried once Redis is back.
export async function enqueueWithTimeout(
  queue: Queue,
  name: string,
  data: Record<string, unknown>,
  timeoutMs = 3000,
): Promise<boolean> {
  try {
    await Promise.race([
      queue.add(name, data),
      new Promise((_, reject) => setTimeout(() => reject(new Error("queue unavailable (timeout)")), timeoutMs)),
    ]);
    return true;
  } catch (err) {
    logger.warn(`Could not enqueue "${name}": ${(err as Error).message}`);
    return false;
  }
}
