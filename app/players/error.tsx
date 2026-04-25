"use client";

import { Button } from "@/components/ui/button";

export default function PlayersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-border-default bg-background-surface p-8 text-center shadow-lg">
        <p className="font-mono text-xs uppercase tracking-widest text-foreground-tertiary">
          Error
        </p>
        <h2 className="mt-2 text-lg font-semibold text-foreground">Failed to load players</h2>
        <p className="mt-2 text-sm text-foreground-secondary">
          Something went wrong while loading this page.
        </p>
        <Button type="button" className="mt-6" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
