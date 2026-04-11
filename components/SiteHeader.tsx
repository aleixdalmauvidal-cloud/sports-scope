import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface/85 shadow-panel-inset backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[3.25rem] max-w-[90rem] items-center justify-between px-4 sm:h-14 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-2.5 sm:gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-dim ring-1 ring-accent/25 transition group-hover:ring-accent/45 sm:h-9 sm:w-9 sm:rounded-lg">
            <span className="font-mono text-xs font-bold text-accent sm:text-sm">
              SS
            </span>
          </span>
          <div>
            <p className="text-[13px] font-semibold leading-tight tracking-tight text-white sm:text-sm">
              Sports Scope
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              CMV Data
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            Ranking
          </Link>
        </nav>
      </div>
    </header>
  );
}
