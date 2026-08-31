import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk is portal-only (see CLAUDE.md: the marketing site and portal stay
// independently deletable) — scoping the matcher to /portal keeps the public
// marketing site working even when no Clerk key is configured yet, since
// clerkMiddleware() throws immediately for any route it actually runs on
// without one.
export default clerkMiddleware();

export const config = {
  matcher: ["/portal/:path*"],
};
