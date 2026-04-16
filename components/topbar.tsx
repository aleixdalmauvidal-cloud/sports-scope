"use client"

import { Search, Bell } from "lucide-react"
import { motion } from "framer-motion"

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-[52px] bg-[rgba(8,9,14,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-bold tracking-[-0.03em] text-foreground">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.14)] transition-colors duration-150"
        >
          <Search className="w-4 h-4 text-foreground-tertiary" />
          <span className="text-sm text-foreground-tertiary">Search players...</span>
          <kbd className="ml-4 font-mono text-[10px] text-foreground-tertiary bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="relative p-2 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-150"
        >
          <Bell className="w-5 h-5 text-foreground-secondary" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-primary rounded-full" />
        </motion.button>
      </div>
    </header>
  )
}
