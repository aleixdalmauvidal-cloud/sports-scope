"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { leagues, type League } from "@/lib/mock-data"

interface LeagueTabsProps {
  activeLeague: League
  onLeagueChange: (league: League) => void
}

export function LeagueTabs({ activeLeague, onLeagueChange }: LeagueTabsProps) {
  return (
    <div className="bg-[#0F1117] border border-[rgba(255,255,255,0.07)] rounded-lg p-[3px] flex">
      {leagues.map((league) => (
        <button
          key={league}
          onClick={() => onLeagueChange(league)}
          className={cn(
            "relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            activeLeague === league
              ? "text-foreground"
              : "text-foreground-secondary hover:text-foreground"
          )}
        >
          {activeLeague === league && (
            <motion.div
              layoutId="activeLeague"
              className="absolute inset-0 bg-[#161B27] rounded-md"
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{league}</span>
        </button>
      ))}
    </div>
  )
}
