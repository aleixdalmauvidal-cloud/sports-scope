"use client"

import { Search } from "lucide-react"
import { motion } from "framer-motion"

interface TopbarProps {
  breadcrumb?: string
  showLiveBadge?: boolean
}

export function Topbar({ breadcrumb, showLiveBadge = false }: TopbarProps) {
  return (
    <header className="h-[52px] bg-[rgba(8,9,14,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left - Breadcrumb */}
      <div className="flex items-center gap-4">
        {breadcrumb && (
          <span className="text-sm font-medium text-foreground-secondary">
            {breadcrumb}
          </span>
        )}
      </div>

      {/* Center - Search */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F1117] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.14)] transition-colors duration-150 min-w-[320px]"
      >
        <Search className="w-4 h-4 text-foreground-tertiary" />
        <span className="text-sm text-foreground-tertiary flex-1 text-left">
          Search players, clubs or leagues...
        </span>
        <kbd className="font-mono text-[10px] text-foreground-tertiary bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </motion.button>

      {/* Right - Live Badge */}
      {showLiveBadge && (
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5A0] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5A0]" />
          </span>
          <span className="font-mono text-[11px] text-foreground-secondary">
            Updated 4h ago
          </span>
        </div>
      )}
    </header>
  )
}
