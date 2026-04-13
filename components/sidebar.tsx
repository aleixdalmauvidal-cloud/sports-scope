"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, User, ArrowLeftRight, Shield, Sparkles, Settings } from "lucide-react"

const navItems = [
  { icon: Trophy, label: "Rankings", href: "/", active: true },
  { icon: User, label: "Players", href: "/players" },
  { icon: ArrowLeftRight, label: "Compare", href: "/compare" },
  { icon: Shield, label: "Clubs", href: "/clubs" },
  { icon: Sparkles, label: "AI Search", href: "/ai-search", soon: true },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-20 flex-col items-center border-r border-border bg-sidebar py-4">
      {/* Logo */}
      <Link href="/" className="mb-8 group flex flex-col items-center gap-0.5">
        <svg viewBox="0 0 44 44" width={32} height={32} fill="none" aria-hidden className="shrink-0">
          <circle cx="22" cy="22" r="18" stroke="#2D7A3A" strokeWidth={1.5} />
          <circle cx="22" cy="22" r="10" stroke="#38A047" strokeWidth={1.5} />
          <circle cx="22" cy="22" r="3" fill="#38A047" />
          <line x1="4" y1="22" x2="12" y2="22" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
          <line x1="32" y1="22" x2="40" y2="22" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
          <line x1="22" y1="4" x2="22" y2="12" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
          <line x1="22" y1="32" x2="22" y2="40" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
        <span
          className="font-display uppercase"
          style={{ fontSize: "8px", color: "#2E3D38", letterSpacing: "0.15em" }}
        >
          SCOPE
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "bg-[rgba(45,122,58,0.2)] text-[#38A047]"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              
              {/* Tooltip */}
              <div className="pointer-events-none absolute left-14 top-1/2 whitespace-nowrap rounded border border-border bg-card px-2 py-1 text-xs font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {item.label}
                {item.soon && (
                  <span className="ml-2 rounded bg-[#38A047]/20 px-1.5 py-0.5 text-[10px] text-[#38A047]">
                    Soon
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-2">
        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
          <Settings className="w-5 h-5" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2D7A3A] to-[#38A047] text-xs font-medium text-white">
          JD
        </div>
      </div>
    </aside>
  )
}
