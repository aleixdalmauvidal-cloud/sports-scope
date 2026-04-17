"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { PositionBadge } from "./position-badge"
import { getPlayerPhoto } from "@/lib/mock-data"
import type { Player } from "@/lib/mock-data"

interface RankingsTableProps {
  players: Player[]
}

function PlayerAvatar({ player }: { player: Player }) {
  // Color based on tier
  const ringColors: Record<string, string> = {
    elite: "#00FF87",
    premium: "#3B82F6",
    mid: "#F59E0B",
    emerging: "#8B5CF6",
  }
  const ringColor = ringColors[player.tier] || "#4A5068"

  // Status dot color (green for positive, red for negative)
  const statusColor = player.delta7d > 0 ? "#00FF87" : player.delta7d < 0 ? "#F04E6B" : "#4A5068"

  return (
    <div className="relative shrink-0">
      <div
        className="w-10 h-10 rounded-full bg-[#161B27] overflow-hidden"
        style={{ boxShadow: `0 0 0 2px ${ringColor}` }}
      >
        <Image
          src={getPlayerPhoto(player.rank) || "/placeholder.svg"}
          alt={player.name}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Status dot */}
      <div
        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0F1117]"
        style={{ backgroundColor: statusColor }}
      />
    </div>
  )
}

function DeltaBadge({ value }: { value: number }) {
  if (value === 0) {
    return <span className="font-mono text-xs text-foreground-tertiary">—</span>
  }

  const isPositive = value > 0
  const bgColor = isPositive ? "rgba(0,229,160,0.1)" : "rgba(240,78,107,0.1)"
  const textColor = isPositive ? "#00E5A0" : "#F04E6B"

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {isPositive ? "+" : ""}
      {value.toFixed(1)}
    </span>
  )
}

function ScoreBar({ value, maxValue = 100 }: { value: number; maxValue?: number }) {
  const percentage = (value / maxValue) * 100

  return (
    <div className="w-full h-[2.5px] bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="h-full bg-[#00E5A0] rounded-full"
      />
    </div>
  )
}

export function RankingsTable({ players }: RankingsTableProps) {
  return (
    <div className="bg-[#0F1117] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
      {/* Table Header */}
      <div
        className="grid gap-4 px-4 py-2.5 bg-[#161B27] border-b border-[rgba(255,255,255,0.05)]"
        style={{
          gridTemplateColumns: "48px 1fr 56px 88px 80px 80px 72px 80px",
        }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">
          #
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">
          Player
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">
          Pos
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">
          CMV ↓
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">
          Sports
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">
          Social
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">
          Opp
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary text-right">
          7D
        </span>
      </div>

      {/* Table Body */}
      <div>
        {players.map((player, index) => (
          <Link key={player.id} href={`/player/${player.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
              className={cn(
                "grid gap-4 px-4 py-3 items-center cursor-pointer transition-colors h-[60px]",
                index !== players.length - 1 && "border-b border-[rgba(255,255,255,0.05)]",
                player.rank === 1 &&
                  "border-l-2 border-l-[#00E5A0] bg-[rgba(0,229,160,0.03)]"
              )}
              style={{
                gridTemplateColumns: "48px 1fr 56px 88px 80px 80px 72px 80px",
              }}
            >
              {/* Rank */}
              <span
                className={cn(
                  "font-mono text-[13px] font-semibold",
                  player.rank === 1
                    ? "text-[#00E5A0]"
                    : player.rank <= 5
                    ? "text-foreground-secondary"
                    : "text-foreground-tertiary"
                )}
              >
                {player.rank}
              </span>

              {/* Player */}
              <div className="flex items-center gap-3 min-w-0">
                <PlayerAvatar player={player} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {player.name}
                  </p>
                  <p className="text-xs text-foreground-secondary truncate">
                    {player.nationalityFlag} {player.club}
                  </p>
                </div>
              </div>

              {/* Position */}
              <PositionBadge position={player.position} />

              {/* CMV Score */}
              <div className="space-y-1">
                <span className="font-mono text-lg font-semibold text-foreground">
                  {player.cmvScore}
                </span>
                <ScoreBar value={player.cmvScore} />
              </div>

              {/* Sports */}
              <span className="font-mono text-[15px] font-medium text-foreground-secondary">
                {player.sportsScore}
              </span>

              {/* Social */}
              <span className="font-mono text-[15px] font-medium text-foreground-secondary">
                {player.socialScore}
              </span>

              {/* Opp */}
              <span className="font-mono text-[15px] text-foreground-secondary">
                {player.oppScore}
              </span>

              {/* 7D Change */}
              <div className="flex justify-end">
                <DeltaBadge value={player.delta7d} />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
