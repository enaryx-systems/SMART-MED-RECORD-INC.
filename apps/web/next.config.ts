import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// The portal and the marketing site share this one Next app. On hosts where the
// API isn't reachable yet (e.g. the Vercel marketing deploy), leave
// NEXT_PUBLIC_PORTAL_ENABLED unset and every /portal/* request is redirected to
// the homepage instead of rendering a portal that can't talk to its backend.
// Set NEXT_PUBLIC_PORTAL_ENABLED=true (and redeploy) once the API is hosted.
const portalEnabled = process.env.NEXT_PUBLIC_PORTAL_ENABLED === "true";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    clientTraceMetadata: ["sentry-trace", "baggage"],
  },
  async redirects() {
    if (portalEnabled) return [];
    return [
      {
        source: "/portal/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  // No auth token configured yet — this only disables sourcemap upload, not
  // error reporting, which works the moment NEXT_PUBLIC_SENTRY_DSN is set.
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
