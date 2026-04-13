import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.1] bg-surface/90 shadow-panel-inset backdrop-blur-xl backdrop-saturate-150">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-10 xl:px-14">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-dim ring-1 ring-accent/30 transition group-hover:ring-accent/50 sm:h-11 sm:w-11">
            <span className="font-mono text-sm font-bold text-accent sm:text-base">SS</span>
          </span>
          <div>
            <p className="text-base font-semibold leading-tight tracking-tight text-white sm:text-lg">
              Sports Scope
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 sm:text-sm">
              CMV Intelligence
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/rankings"
            className="rounded-lg px-4 py-2 text-base font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            Ranking
          </Link>
        </nav>
      </div>
    </header>
  );
}
