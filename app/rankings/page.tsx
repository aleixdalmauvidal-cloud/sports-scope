"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { KpiCard } from "@/components/kpi-card"
import { WeeklyMovers } from "@/components/weekly-movers"
import { LeagueTabs } from "@/components/league-tabs"
import { RankingsTable } from "@/components/rankings-table"
import { mockPlayers, weeklyMovers, type League } from "@/lib/mock-data"

export default function RankingsPage() {
  const [activeLeague, setActiveLeague] = useState<League>("All")

  const filteredPlayers =
    activeLeague === "All"
      ? mockPlayers
      : mockPlayers.filter((p) => p.league === activeLeague)

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-[32px] font-bold tracking-[-0.02em] text-foreground mb-1">
              CMV Rankings
            </h1>
            <p className="text-sm text-foreground-secondary">
              Commercial Market Value · Football · 964 athletes across 5 leagues
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-[rgba(255,255,255,0.03)] transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-[rgba(255,255,255,0.03)] transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
          </div>
        </motion.div>

        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-3">
          <KpiCard
            label="TOP CMV"
            value="63"
            sub="Lamine Yamal · Barcelona"
            stripeColor="#00E5A0"
            delay={0}
          />
          <KpiCard
            label="TOP RISER 7D"
            value="+3.4"
            sub="Lamine Yamal"
            stripeColor="#F04E6B"
            delay={0.05}
          />
          <KpiCard
            label="ELITE TIER"
            value="12"
            sub="CMV above 55"
            stripeColor="#7C3AED"
            delay={0.1}
          />
          <KpiCard
            label="PLAYERS TRACKED"
            value="964"
            sub="Across 5 leagues"
            stripeColor="#3B82F6"
            delay={0.15}
          />
        </div>

        {/* Weekly Movers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <WeeklyMovers risers={weeklyMovers.risers} fallers={weeklyMovers.fallers} />
        </motion.div>

        {/* Filter Toolbar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          {/* League Tabs */}
          <LeagueTabs activeLeague={activeLeague} onLeagueChange={setActiveLeague} />

          {/* Filter Chips */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-[rgba(255,255,255,0.03)] transition-colors border border-transparent hover:border-[rgba(255,255,255,0.07)]">
              Position
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-[rgba(255,255,255,0.03)] transition-colors border border-transparent hover:border-[rgba(255,255,255,0.07)]">
              CMV Range
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-[rgba(255,255,255,0.03)] transition-colors border border-transparent hover:border-[rgba(255,255,255,0.07)]">
              Sort: CMV Score
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Rankings Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <RankingsTable players={filteredPlayers} />
        </motion.div>

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="flex items-center justify-between"
        >
          <span className="text-sm text-foreground-secondary">
            Showing 1–15 of 964
          </span>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-[rgba(255,255,255,0.03)] transition-colors border border-[rgba(255,255,255,0.07)]">
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-[rgba(255,255,255,0.03)] transition-colors border border-[rgba(255,255,255,0.07)]">
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}
