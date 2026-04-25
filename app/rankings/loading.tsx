function SkeletonCell({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/[0.06] ${className ?? ""}`}
      aria-hidden
    />
  );
}

export default function RankingsLoading() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-6xl">
        <SkeletonCell className="mb-6 h-8 w-48" />
        <div className="overflow-hidden rounded-xl border border-border-default bg-background-surface">
          <div className="grid grid-cols-12 gap-3 border-b border-border-default px-4 py-3">
            <SkeletonCell className="col-span-1 h-4" />
            <SkeletonCell className="col-span-4 h-4" />
            <SkeletonCell className="col-span-2 hidden h-4 sm:block" />
            <SkeletonCell className="col-span-2 h-4" />
            <SkeletonCell className="col-span-2 hidden h-4 md:block" />
            <SkeletonCell className="col-span-1 h-4 text-right" />
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-12 items-center gap-3 border-b border-border-default px-4 py-4 last:border-b-0"
            >
              <SkeletonCell className="col-span-1 h-5 w-8" />
              <div className="col-span-4 flex items-center gap-3">
                <SkeletonCell className="h-9 w-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonCell className="h-4 w-3/4 max-w-[180px]" />
                  <SkeletonCell className="h-3 w-1/2 max-w-[120px]" />
                </div>
              </div>
              <SkeletonCell className="col-span-2 hidden h-4 sm:block" />
              <SkeletonCell className="col-span-2 h-5 w-12 justify-self-end" />
              <SkeletonCell className="col-span-2 hidden h-4 md:block" />
              <SkeletonCell className="col-span-1 h-6 w-14 justify-self-end rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
