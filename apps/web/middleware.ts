import { NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

const portalEnabled = process.env.NEXT_PUBLIC_PORTAL_ENABLED === "true";

// Clerk is portal-only (see CLAUDE.md: the marketing site and portal stay
// independently deletable) — scoping the matcher to /portal keeps the public
// marketing site working even when no Clerk key is configured yet, since
// clerkMiddleware() throws immediately for any route it actually runs on
// without one.
//
// When the portal is disabled (NEXT_PUBLIC_PORTAL_ENABLED unset — e.g. the
// Vercel marketing deploy) we never run Clerk: next.config's redirect already
// sends /portal/* to the homepage, and this no-op keeps the middleware from
// touching Clerk without a key.
export default portalEnabled ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: ["/portal/:path*"],
};
