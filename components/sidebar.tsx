"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  ListOrdered,
  Users,
  GitCompare,
  Building2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Rankings", href: "/rankings", icon: ListOrdered },
  { name: "Players", href: "/players", icon: Users },
  { name: "Compare", href: "/compare", icon: GitCompare },
  { name: "Clubs", href: "/clubs", icon: Building2, disabled: true, label: "Coming Soon" },
  { name: "AI Search", href: "/ai-search", icon: Sparkles, disabled: true, label: "Coming Soon" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#070D1A] border-r border-[rgba(255,255,255,0.06)] flex flex-col z-50">
      {/* Logo */}
      <div className="h-[52px] flex items-center px-5 border-b border-[rgba(255,255,255,0.06)]">
        <Link href="/" className="flex items-center">
          <span className="text-lg font-bold tracking-[-0.03em] text-foreground">
            SPORTS<span className="text-accent-primary">SCOPE</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            return (
              <li key={item.name}>
                {item.disabled ? (
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150",
                      "text-foreground-tertiary cursor-not-allowed"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{item.name}</span>
                    {item.label && (
                      <span className="ml-auto label-tag text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-foreground-tertiary">
                        Soon
                      </span>
                    )}
                  </div>
                ) : (
                  <Link href={item.href}>
                    <motion.div
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150",
                        isActive
                          ? "bg-[rgba(0,255,135,0.1)] text-accent-primary"
                          : "text-foreground-secondary hover:text-foreground hover:bg-[rgba(255,255,255,0.04)]"
                      )}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-accent-primary rounded-full"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <Icon className="w-[18px] h-[18px]" />
                      <span>{item.name}</span>
                    </motion.div>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
            <span className="text-xs font-medium text-foreground">JS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Scout</p>
            <p className="text-xs text-foreground-tertiary truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
