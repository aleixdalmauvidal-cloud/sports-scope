"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function HomepageNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[rgba(11,17,32,0.95)] backdrop-blur-xl border-b border-border-default"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5 font-bold text-lg tracking-tight shrink-0">
          <span className="text-foreground">SPORTS</span>
          <span className="text-accent-primary">SCOPE</span>
        </Link>

        {/* Search in nav (appears when scrolled) */}
        <div
          className={cn(
            "hidden lg:flex items-center gap-2 flex-1 max-w-md transition-all duration-300",
            scrolled ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
            <input
              type="text"
              placeholder="Search players, clubs, leagues..."
              className="w-full bg-surface-1 border border-border-default rounded-lg pl-10 pr-4 h-9 text-sm placeholder:text-foreground-tertiary focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>
        </div>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-7 shrink-0">
          <Link
            href="/rankings"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            Rankings
          </Link>
          <Link
            href="/players"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            Players
          </Link>
          <Link
            href="/compare"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            Compare
          </Link>
          <Link
            href="/clubs"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            Clubs
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
        </div>

        {/* CTA */}
        <Link
          href="/rankings"
          className="bg-accent-primary hover:bg-accent-primary/90 text-primary-foreground font-medium text-sm px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          Browse Database
        </Link>
      </div>
    </nav>
  )
}
