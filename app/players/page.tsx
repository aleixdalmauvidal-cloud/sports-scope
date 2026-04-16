"use client"

import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { PlayerAvatar } from "@/components/player-avatar"
import { TierBadge } from "@/components/tier-badge"
import { ScoreBar } from "@/components/score-bar"
import { AnimatedNumber } from "@/components/animated-number"
import { DeltaIndicator } from "@/components/delta-indicator"
import { StatusDot } from "@/components/status-dot"
import { mockPlayers } from "@/lib/mock-data"
import { Search, Filter, Grid3X3, List } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

export default function PlayersPage() {
  return (
    <AppShell title="Players">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Filters Bar */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
              <input
                type="text"
                placeholder="Search players..."
                className="w-full pl-10 pr-4 py-2 bg-background-surface border border-border-default rounded-lg text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-border-hover transition-colors"
              />
            </div>

            {/* Filter Buttons */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-border-default rounded-lg text-sm text-foreground-secondary hover:border-border-hover hover:text-foreground transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </motion.button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-background-surface rounded-lg border border-border-default">
            <button className="p-1.5 rounded bg-accent-primary/10 text-accent-primary">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded text-foreground-tertiary hover:text-foreground-secondary">
              <List className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Player Cards Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-3 gap-4"
        >
          {mockPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="bg-background-surface rounded-lg p-5 shadow-card cursor-pointer transition-all duration-150 hover:shadow-elevated"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={player.name} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{player.name}</p>
                      <StatusDot status="active" />
                    </div>
                    <p className="text-sm text-foreground-secondary">{player.club}</p>
                  </div>
                </div>
                <TierBadge tier={player.tier} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="label-tag text-foreground-tertiary mb-1">Market Value</p>
                  <p className="font-mono font-semibold text-foreground">
                    €<AnimatedNumber value={player.marketValue} />M
                  </p>
                </div>
                <div>
                  <p className="label-tag text-foreground-tertiary mb-1">Overall Score</p>
                  <p className="font-mono font-semibold text-foreground">
                    <AnimatedNumber value={player.overallScore} />
                  </p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-foreground-tertiary">Commercial</span>
                    <span className="font-mono text-xs text-foreground-secondary">
                      {player.commercialScore}
                    </span>
                  </div>
                  <ScoreBar value={player.commercialScore} delay={0.1 + index * 0.03} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-foreground-tertiary">Performance</span>
                    <span className="font-mono text-xs text-foreground-secondary">
                      {player.performanceScore}
                    </span>
                  </div>
                  <ScoreBar value={player.performanceScore} delay={0.15 + index * 0.03} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-foreground-tertiary">Social</span>
                    <span className="font-mono text-xs text-foreground-secondary">
                      {player.socialScore}
                    </span>
                  </div>
                  <ScoreBar value={player.socialScore} delay={0.2 + index * 0.03} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-default">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground-tertiary">Rank</span>
                  <span className="font-mono font-semibold text-foreground">#{player.rank}</span>
                </div>
                <DeltaIndicator value={player.rankChange} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AppShell>
  )
}
