import Link from "next/link"

export function Header() {
  return (
    <header className="px-6 py-6 md:px-12 lg:px-16">
      <Link href="/" className="inline-flex items-center gap-3 group">
        <span className="text-[#00ff87] font-light text-xl tracking-tight">SS</span>
        <span className="text-zinc-500 font-extralight text-sm tracking-wide group-hover:text-zinc-400 transition-colors">
          Sports Scope
        </span>
      </Link>
    </header>
  )
}
