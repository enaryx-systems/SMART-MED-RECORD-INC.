import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // apps/web is an independent pnpm install (no root workspace), but Next.js's
  // heuristic still finds the sibling root pnpm-lock.yaml and mis-detects the
  // monorepo root. Pin the tracing root to this app so standalone output isn't
  // nested under a phantom apps/web/apps/web path.
  outputFileTracingRoot: process.cwd(),
  // Repo-wide linting runs separately (`pnpm run lint` at the root, using
  // eslint.config.mjs's shared devDependencies) as part of the quality gate.
  // This app's own node_modules doesn't carry those shared lint deps under
  // the independent-install model, so skip the redundant in-build lint pass.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
