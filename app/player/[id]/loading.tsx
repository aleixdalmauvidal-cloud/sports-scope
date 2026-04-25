function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} aria-hidden />;
}

export default function PlayerProfileLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border-default bg-background-surface px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <Pulse className="h-44 w-44 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-4">
            <Pulse className="h-3 w-32" />
            <Pulse className="h-10 w-2/3 max-w-md" />
            <div className="flex flex-wrap gap-2">
              <Pulse className="h-6 w-16" />
              <Pulse className="h-6 w-24" />
              <Pulse className="h-6 w-28" />
            </div>
            <div className="flex gap-6 pt-2">
              <Pulse className="h-12 w-20" />
              <Pulse className="h-12 w-24" />
              <Pulse className="h-12 w-28" />
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 md:w-[220px]">
            <Pulse className="h-28 w-full rounded-xl" />
            <Pulse className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-4 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 md:px-10">
        <Pulse className="h-40 w-full rounded-xl border border-border-default bg-background-surface/50" />
        <Pulse className="h-40 w-full rounded-xl border border-border-default bg-background-surface/50" />
        <Pulse className="h-40 w-full rounded-xl border border-border-default bg-background-surface/50" />
        <Pulse className="h-40 w-full rounded-xl border border-border-default bg-background-surface/50" />
      </div>
    </div>
  );
}
