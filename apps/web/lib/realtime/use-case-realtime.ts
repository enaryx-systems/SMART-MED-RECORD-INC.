"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth/token";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

async function getSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  const token = await getAuthToken();
  if (socket) socket.disconnect();
  socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket"] });
  return socket;
}

// Joins no case-specific room server-side (the gateway broadcasts by org/
// staff-role/reviewer, not per-case — see realtime.gateway.ts) — this hook
// just listens for events concerning this case and invalidates the matching
// query so the UI updates without polling.
export function useCaseRealtime(caseId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!caseId) return;
    let active = true;
    let currentSocket: Socket | null = null;

    function onExtractionUpdated(payload: { caseId: string; documentId: string }) {
      if (payload.caseId !== caseId) return;
      queryClient.invalidateQueries({ queryKey: ["documents", caseId] });
      queryClient.invalidateQueries({ queryKey: ["extraction", payload.documentId] });
    }

    getSocket().then((s) => {
      if (!active) return;
      currentSocket = s;
      s.on("document:extraction-updated", onExtractionUpdated);
    });

    return () => {
      active = false;
      currentSocket?.off("document:extraction-updated", onExtractionUpdated);
    };
  }, [caseId, queryClient]);
}
