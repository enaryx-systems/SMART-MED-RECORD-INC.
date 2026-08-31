import { Injectable } from "@nestjs/common";
import { createClerkClient } from "@clerk/backend";

@Injectable()
export class ClerkService {
  readonly client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
}
