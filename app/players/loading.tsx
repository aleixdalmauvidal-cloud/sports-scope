function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border-default bg-background-surface p-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-white/[0.06]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded-md bg-white/[0.06]" />
          <div className="h-3 w-1/2 rounded-md bg-white/[0.06]" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="h-8 rounded-md bg-white/[0.06]" />
        <div className="h-8 rounded-md bg-white/[0.06]" />
        <div className="h-8 rounded-md bg-white/[0.06]" />
      </div>
    </div>
  );
}

export default function PlayersLoading() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 h-9 w-48 animate-pulse rounded-md bg-white/[0.06]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
