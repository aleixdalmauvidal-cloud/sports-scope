"use client"

import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { PlayerAvatar } from "@/components/player-avatar"
import { TierBadge } from "@/components/tier-badge"
import { Sparkline } from "@/components/sparkline"
import { ScoreBar } from "@/components/score-bar"
import { DeltaIndicator } from "@/components/delta-indicator"
import { AnimatedNumber } from "@/components/animated-number"
import { mockPlayers, mockStats } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

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

export default function RankingsPage() {
  return (
    <AppShell title="Rankings">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4">
          {mockStats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-background-surface rounded-lg p-5 shadow-card"
            >
              <p className="text-foreground-secondary text-sm mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-mono font-semibold text-foreground">
                  {typeof stat.value === "number" ? (
                    <AnimatedNumber value={stat.value} />
                  ) : (
                    stat.value
                  )}
                </span>
                <DeltaIndicator value={stat.change} />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Rankings Table */}
        <motion.div
          variants={itemVariants}
          className="bg-background-surface rounded-lg shadow-card overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-[60px_1fr_120px_100px_140px_100px_80px_80px] gap-4 px-5 py-3 border-b border-[rgba(255,255,255,0.05)]">
            <span className="label-tag text-foreground-tertiary">Rank</span>
            <span className="label-tag text-foreground-tertiary">Player</span>
            <span className="label-tag text-foreground-tertiary">Club</span>
            <span className="label-tag text-foreground-tertiary">Position</span>
            <span className="label-tag text-foreground-tertiary">Market Value</span>
            <span className="label-tag text-foreground-tertiary">Tier</span>
            <span className="label-tag text-foreground-tertiary">Score</span>
            <span className="label-tag text-foreground-tertiary">Trend</span>
          </div>

          {/* Table Body */}
          <div>
            {mockPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                variants={itemVariants}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                className={cn(
                  "grid grid-cols-[60px_1fr_120px_100px_140px_100px_80px_80px] gap-4 px-5 py-4 items-center cursor-pointer transition-colors duration-[120ms]",
                  index !== mockPlayers.length - 1 && "border-b border-[rgba(255,255,255,0.05)]",
                  player.rank === 1 && "shadow-glow-green"
                )}
              >
                {/* Rank */}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-mono font-semibold text-lg",
                      player.rank === 1 ? "text-accent-primary" : "text-foreground"
                    )}
                  >
                    {player.rank}
                  </span>
                  {player.rankChange !== 0 && (
                    <DeltaIndicator value={player.rankChange} showIcon={false} className="text-xs" />
                  )}
                </div>

                {/* Player */}
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={player.name} size="sm" />
                  <div>
                    <p className="font-medium text-foreground">{player.name}</p>
                    <p className="text-xs text-foreground-tertiary">{player.nationality}</p>
                  </div>
                </div>

                {/* Club */}
                <span className="text-sm text-foreground-secondary truncate">{player.club}</span>

                {/* Position */}
                <span className="font-mono text-sm text-foreground-secondary">{player.position}</span>

                {/* Market Value */}
                <div className="space-y-1">
                  <span className="font-mono font-semibold text-foreground">
                    €{player.marketValue}M
                  </span>
                  <ScoreBar value={player.marketValue} maxValue={200} delay={0.1 + index * 0.05} />
                </div>

                {/* Tier */}
                <TierBadge tier={player.tier} />

                {/* Score */}
                <span
                  className={cn(
                    "font-mono font-semibold text-lg",
                    player.rank === 1 ? "text-accent-primary" : "text-foreground"
                  )}
                >
                  {player.overallScore}
                </span>

                {/* Trend */}
                <Sparkline data={player.trendData} trend={player.trend} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AppShell>
  )
}
