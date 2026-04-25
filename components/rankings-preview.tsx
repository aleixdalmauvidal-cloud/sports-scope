"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { ScoreBar } from "./score-bar"
import { DeltaIndicator } from "./delta-indicator"
import { getPlayerPhoto } from "@/lib/mock-data"

const previewPlayers = [
  {
    rank: 1,
    name: "Lamine Yamal",
    club: "Barcelona",
    position: "MF",
    cmv: 63,
    sports: 86,
    social: 88,
    delta: 3.4,
    trend: "up" as const,
  },
  {
    rank: 2,
    name: "Vinicius Jr",
    club: "Real Madrid",
    position: "FW",
    cmv: 61,
    sports: 80,
    social: 88,
    delta: -2.1,
    trend: "down" as const,
  },
  {
    rank: 3,
    name: "Mohamed Salah",
    club: "Liverpool",
    position: "MF",
    cmv: 60,
    sports: 91,
    social: 74,
    delta: 1.2,
    trend: "up" as const,
  },
  {
    rank: 4,
    name: "Raphinha",
    club: "Barcelona",
    position: "FW",
    cmv: 56,
    sports: 88,
    social: 66,
    delta: -0.8,
    trend: "down" as const,
  },
  {
    rank: 5,
    name: "Erling Haaland",
    club: "Man City",
    position: "FW",
    cmv: 56,
    sports: 84,
    social: 68,
    delta: -19.8,
    trend: "down" as const,
  },
]

export function RankingsPreview() {
  return (
    <div className="bg-background-surface border border-border-default rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[60px_1fr_100px_80px_80px_80px_100px] gap-4 px-6 py-3 border-b border-border-default text-xs font-mono text-foreground-tertiary uppercase">
        <div>Rank</div>
        <div>Player</div>
        <div>Club</div>
        <div className="text-center">CMV</div>
        <div className="text-center">Sports</div>
        <div className="text-center">Social</div>
        <div className="text-right">Change</div>
      </div>

      {/* Table Rows */}
      {previewPlayers.map((player, index) => (
        <motion.div
          key={player.rank}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="grid grid-cols-[60px_1fr_100px_80px_80px_80px_100px] gap-4 px-6 py-4 border-b border-border-default last:border-b-0 hover:bg-background-elevated/50 transition-colors"
        >
          {/* Rank */}
          <div className="flex items-center">
            <span
              className={`font-mono font-semibold text-sm ${
                player.rank === 1 ? "text-accent-primary" : "text-foreground"
              }`}
            >
              {player.rank}
            </span>
          </div>

          {/* Player */}
          <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-background-elevated ring-2 ring-border-default shrink-0">
                    <Image
                      src={getPlayerPhoto(player.rank) || "/placeholder.svg"}
                      alt={player.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
            <div>
              <div className="font-medium text-foreground text-sm">{player.name}</div>
              <div className="text-xs text-foreground-tertiary">{player.position}</div>
            </div>
          </div>

          {/* Club */}
          <div className="flex items-center text-sm text-foreground-secondary">{player.club}</div>

          {/* CMV */}
          <div className="flex items-center justify-center">
            <span className="font-mono font-semibold text-accent-primary">{player.cmv}</span>
          </div>

          {/* Sports */}
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="font-mono text-xs text-foreground-secondary">{player.sports}</span>
            <ScoreBar value={player.sports} />
          </div>

          {/* Social */}
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="font-mono text-xs text-foreground-secondary">{player.social}</span>
            <ScoreBar value={player.social} />
          </div>

          {/* Delta */}
          <div className="flex items-center justify-end">
            <DeltaIndicator value={player.delta} />
          </div>
        </motion.div>
      ))}

      {/* Footer CTA */}
      <div className="px-6 py-4 flex justify-end border-t border-border-default bg-background-elevated/30">
        <Link
          href="/rankings"
          className="inline-flex items-center gap-2 text-sm text-accent-primary hover:text-accent-primary/80 transition-colors font-medium"
        >
          See all 964 players
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
