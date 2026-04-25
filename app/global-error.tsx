"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-md rounded-xl border border-border-default bg-background-surface p-8 text-center shadow-lg">
            <p className="font-mono text-xs uppercase tracking-widest text-foreground-tertiary">
              Error
            </p>
            <h1 className="mt-2 text-xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-foreground-secondary">
              An unexpected error occurred while rendering this page.
            </p>
            <Button type="button" className="mt-6" onClick={() => reset()}>
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
