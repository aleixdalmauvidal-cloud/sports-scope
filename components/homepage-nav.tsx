"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
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
          ? "bg-[rgba(8,9,14,0.9)] backdrop-blur-xl border-b border-border-default"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5 font-bold text-lg tracking-tight">
          <span className="text-foreground">SPORTS</span>
          <span className="text-accent-primary">SCOPE</span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8">
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
        </div>

        {/* CTA */}
        <Link
          href="/rankings"
          className="bg-accent-primary hover:bg-accent-primary/90 text-primary-foreground font-medium text-sm px-5 py-2 rounded-lg transition-colors"
        >
          Request Access
        </Link>
      </div>
    </nav>
  )
}
