"use client"

import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { PlayerAvatar } from "@/components/player-avatar"
import { TierBadge } from "@/components/tier-badge"
import { ScoreBar } from "@/components/score-bar"
import { AnimatedNumber } from "@/components/animated-number"
import { Sparkline } from "@/components/sparkline"
import { mockPlayers } from "@/lib/mock-data"
import { Plus, ArrowLeftRight, ChevronDown } from "lucide-react"
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

// Select two players for comparison
const player1 = mockPlayers[0] // Mbappé
const player2 = mockPlayers[1] // Haaland

interface StatCompareRowProps {
  label: string
  value1: number
  value2: number
  maxValue?: number
}

function StatCompareRow({ label, value1, value2, maxValue = 100 }: StatCompareRowProps) {
  const diff = value1 - value2
  const winner = diff > 0 ? 1 : diff < 0 ? 2 : 0

  return (
    <div className="grid grid-cols-[1fr_120px_1fr] gap-4 items-center py-4 border-b border-border-default">
      {/* Player 1 Value */}
      <div className="flex items-center justify-end gap-3">
        <div className="w-24 flex justify-end">
          <ScoreBar value={value1} maxValue={maxValue} />
        </div>
        <span
          className={cn(
            "font-mono font-semibold text-lg min-w-[48px] text-right",
            winner === 1 ? "text-accent-primary" : "text-foreground"
          )}
        >
          {value1}
        </span>
      </div>

      {/* Label */}
      <div className="text-center">
        <span className="label-tag text-foreground-tertiary">{label}</span>
      </div>

      {/* Player 2 Value */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "font-mono font-semibold text-lg min-w-[48px]",
            winner === 2 ? "text-accent-primary" : "text-foreground"
          )}
        >
          {value2}
        </span>
        <div className="w-24">
          <ScoreBar value={value2} maxValue={maxValue} />
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <AppShell title="Compare">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Player Selection */}
        <motion.div variants={itemVariants} className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Player 1 Card */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-background-surface rounded-lg p-6 shadow-card"
          >
            <div className="flex items-center gap-4">
              <PlayerAvatar name={player1.name} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-foreground">{player1.name}</h3>
                  <TierBadge tier={player1.tier} />
                </div>
                <p className="text-sm text-foreground-secondary">{player1.club}</p>
                <p className="text-xs text-foreground-tertiary">{player1.nationality} • {player1.position} • {player1.age} yrs</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-background-elevated transition-colors">
                <ChevronDown className="w-5 h-5 text-foreground-secondary" />
              </button>
            </div>
          </motion.div>

          {/* Swap Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="p-3 rounded-full bg-background-surface border border-border-default hover:border-border-hover transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5 text-foreground-secondary" />
          </motion.button>

          {/* Player 2 Card */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-background-surface rounded-lg p-6 shadow-card"
          >
            <div className="flex items-center gap-4">
              <PlayerAvatar name={player2.name} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-foreground">{player2.name}</h3>
                  <TierBadge tier={player2.tier} />
                </div>
                <p className="text-sm text-foreground-secondary">{player2.club}</p>
                <p className="text-xs text-foreground-tertiary">{player2.nationality} • {player2.position} • {player2.age} yrs</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-background-elevated transition-colors">
                <ChevronDown className="w-5 h-5 text-foreground-secondary" />
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          variants={itemVariants}
          className="bg-background-surface rounded-lg p-6 shadow-card"
        >
          <h2 className="headline text-lg text-foreground mb-6 text-center">Score Comparison</h2>

          <StatCompareRow label="OVERALL" value1={player1.overallScore} value2={player2.overallScore} />
          <StatCompareRow label="COMMERCIAL" value1={player1.commercialScore} value2={player2.commercialScore} />
          <StatCompareRow label="PERFORMANCE" value1={player1.performanceScore} value2={player2.performanceScore} />
          <StatCompareRow label="SOCIAL" value1={player1.socialScore} value2={player2.socialScore} />
          <StatCompareRow label="MARKET VALUE (M)" value1={player1.marketValue} value2={player2.marketValue} maxValue={200} />
        </motion.div>

        {/* Trend Comparison */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6">
          <div className="bg-background-surface rounded-lg p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="label-tag text-foreground-tertiary">{player1.name} Trend</h3>
              <Sparkline data={player1.trendData} trend={player1.trend} width={80} height={24} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-foreground-tertiary mb-1">Rank</p>
                <p className="font-mono font-semibold text-foreground">#{player1.rank}</p>
              </div>
              <div>
                <p className="text-xs text-foreground-tertiary mb-1">Value</p>
                <p className="font-mono font-semibold text-foreground">€{player1.marketValue}M</p>
              </div>
              <div>
                <p className="text-xs text-foreground-tertiary mb-1">Age</p>
                <p className="font-mono font-semibold text-foreground">{player1.age}</p>
              </div>
            </div>
          </div>

          <div className="bg-background-surface rounded-lg p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="label-tag text-foreground-tertiary">{player2.name} Trend</h3>
              <Sparkline data={player2.trendData} trend={player2.trend} width={80} height={24} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-foreground-tertiary mb-1">Rank</p>
                <p className="font-mono font-semibold text-foreground">#{player2.rank}</p>
              </div>
              <div>
                <p className="text-xs text-foreground-tertiary mb-1">Value</p>
                <p className="font-mono font-semibold text-foreground">€{player2.marketValue}M</p>
              </div>
              <div>
                <p className="text-xs text-foreground-tertiary mb-1">Age</p>
                <p className="font-mono font-semibold text-foreground">{player2.age}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Another Player CTA */}
        <motion.button
          variants={itemVariants}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-border-default hover:border-border-hover text-foreground-secondary hover:text-foreground transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add another player to compare</span>
        </motion.button>
      </motion.div>
    </AppShell>
  )
}
