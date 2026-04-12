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
    <aside className="fixed left-0 top-0 h-screen w-20 bg-sidebar flex flex-col items-center py-4 border-r border-border z-50">
      {/* Logo */}
      <Link href="/" className="mb-8 group flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7C6FFF] to-[#5B4FD9] flex items-center justify-center">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <span className="text-[9px] font-medium text-muted-foreground tracking-wider uppercase">Scope</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/" && pathname === "/")
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
                    ? "bg-[#7C6FFF]/20 text-[#7C6FFF]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-card rounded text-xs font-medium text-foreground opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                {item.label}
                {item.soon && (
                  <span className="ml-2 px-1.5 py-0.5 bg-[#FFB547]/20 text-[#FFB547] rounded text-[10px]">
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
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C6FFF] to-[#00E5A0] flex items-center justify-center text-xs font-medium text-white">
          JD
        </div>
      </div>
    </aside>
  )
}
