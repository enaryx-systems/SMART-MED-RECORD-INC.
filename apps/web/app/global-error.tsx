"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ivory text-ink">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-ink/60">The error has been reported. Please try again.</p>
        <button
          onClick={reset}
          className="rounded-full bg-pine px-5 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
