import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { verifyToken } from "@clerk/backend";
import type { Server, Socket } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? "http://localhost:3000", credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
      const user = await this.prisma.user.findUnique({ where: { clerkUserId: claims.sub } });
      if (!user || !user.isActive) {
        client.disconnect(true);
        return;
      }

      // Every user joins their own org's room (covers CLIENT team-seat
      // visibility directly); ADMIN/BILLING also join a role-wide room since
      // their visibility spans every client org, not just their own
      // (INTERNAL) one. REVIEWER gets a personal room since their assigned
      // cases can span multiple client orgs.
      client.join(`org:${user.organizationId}`);
      if (user.role === "ADMIN" || user.role === "BILLING") {
        client.join(`role:${user.role}`);
      }
      if (user.role === "REVIEWER") {
        client.join(`reviewer:${user.id}`);
      }
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  emitToOrg(organizationId: string, event: string, payload: unknown) {
    this.server.to(`org:${organizationId}`).emit(event, payload);
  }

  emitToReviewer(reviewerId: string, event: string, payload: unknown) {
    this.server.to(`reviewer:${reviewerId}`).emit(event, payload);
  }

  emitToStaff(event: string, payload: unknown) {
    this.server.to(["role:ADMIN", "role:BILLING"]).emit(event, payload);
  }

  // Convenience for events tied to one case: reaches the case's org (client
  // team seats), staff, and the assigned reviewer (if any) in one call —
  // callers already have this data from their own query, so no extra
  // lookup happens inside the gateway.
  emitForCase(
    target: { organizationId: string; assignedReviewerId?: string | null },
    event: string,
    payload: unknown,
  ) {
    this.emitToOrg(target.organizationId, event, payload);
    this.emitToStaff(event, payload);
    if (target.assignedReviewerId) this.emitToReviewer(target.assignedReviewerId, event, payload);
  }
}
