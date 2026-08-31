import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    clientTraceMetadata: ["sentry-trace", "baggage"],
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
