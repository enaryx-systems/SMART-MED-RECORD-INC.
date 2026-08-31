"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/lib/api/client";

// Clerk owns identity/session; role and organizationId still live in our own
// Prisma User table, so every portal page that needs them fetches /auth/me
// once (cached) rather than decoding a locally-stored session blob.
export function useCurrentUser() {
  const { isLoaded, isSignedIn } = useAuth();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: isLoaded && !!isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: query.data ?? null,
    isLoading: !isLoaded || (!!isSignedIn && query.isLoading),
    isSignedIn: !!isSignedIn,
  };
}
