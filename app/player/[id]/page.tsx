"use client"

import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Scale, Download, Bell, Plus, ChevronRight } from "lucide-react"
import { mockPlayers, getPlayerPhoto } from "@/lib/mock-data"
import { Sidebar } from "@/components/sidebar"
import { SubscoreCard } from "@/components/subscore-card"
import { CMVChart } from "@/components/cmv-chart"
import { OpportunityCard } from "@/components/opportunity-card"
import { SocialSignalsCard } from "@/components/social-signals-card"
import { MomentumSignalsCard } from "@/components/momentum-signals-card"
import { AnimatedNumber } from "@/components/animated-number"
import { cn } from "@/lib/utils"

const positionColors: Record<string, string> = {
  FW: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  MF: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  DF: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  GK: "bg-amber-500/15 text-amber-400 border-amber-500/20",
}

const subscores = [
  { label: "SPORTS", score: 86, weight: 25, color: "green" as const },
  { label: "SOCIAL", score: 88, weight: 30, color: "green" as const },
  { label: "COMMERCIAL", score: 15, weight: 15, color: "blue" as const },
  { label: "BRAND FIT", score: 20, weight: 10, color: "blue" as const },
  { label: "MOMENTUM", score: 25, weight: 10, color: "momentum" as const, isPositive: true },
  { label: "ADJUSTMENTS", score: 80, weight: 10, color: "green" as const },
]

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const player = mockPlayers.find((p) => p.id === resolvedParams.id)

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-secondary">Player not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[220px] pb-20">
        {/* Hero Banner with big photo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative border-b border-border overflow-hidden"
        >
          {/* Blurred photo as background */}
          <div className="absolute inset-0">
            <Image
              src={getPlayerPhoto(player.rank) || "/placeholder.svg"}
              alt=""
              fill
              className="object-cover opacity-25 blur-2xl scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="relative flex items-center gap-8 p-8">
            {/* Left: Big Photo */}
            <div className="relative shrink-0">
              <div
                className="w-40 h-40 rounded-2xl overflow-hidden border-[3px] border-accent-primary/60"
                style={{ boxShadow: "0 0 60px rgba(0,255,135,0.25)" }}
              >
                <Image
                  src={getPlayerPhoto(player.rank) || "/placeholder.svg"}
                  alt={player.name}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Rank badge floating */}
              <div className="absolute -bottom-2 -right-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-primary text-background font-mono text-sm font-bold shadow-lg">
                #{player.rank}
              </div>
            </div>

            {/* Center: Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-tertiary text-xs">
                <Link href="/rankings" className="hover:text-secondary transition-colors">
                  Rankings
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span>{player.name}</span>
              </div>

              <h1 className="text-4xl font-extrabold text-primary tracking-[-0.03em] mt-1">
                {player.name}
              </h1>

              <div className="flex items-center gap-3 mt-3 font-mono text-[13px] text-secondary flex-wrap">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded border font-mono text-xs",
                    positionColors[player.position]
                  )}
                >
                  {player.position}
                </span>
                <span className="text-tertiary">·</span>
                <span className="text-primary font-semibold">{player.club}</span>
                <span className="text-tertiary">·</span>
                <span>{player.league}</span>
                <span className="text-tertiary">·</span>
                <span>{player.nationalityFlag} {player.nationality}</span>
                <span className="text-tertiary">·</span>
                <span>{player.age} years</span>
              </div>

              <div className="flex gap-2 mt-4">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-secondary text-sm hover:bg-surface-2 transition-colors"
                >
                  Compare <ArrowRight className="w-3 h-3" />
                </Link>
                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-secondary text-sm hover:bg-surface-2 transition-colors">
                  Watch
                </button>
              </div>
            </div>

            {/* Right: CMV Score */}
            <div className="text-right">
              <span className="font-mono text-[10px] uppercase tracking-wider text-tertiary">
                CMV SCORE
              </span>
              <div className="mt-1">
                <AnimatedNumber
                  value={player.cmvScore}
                  className="text-[56px] font-bold text-accent-primary leading-none tracking-[-2px]"
                />
              </div>
              <div className="font-mono text-xs text-secondary mt-1">
                #{player.rank} Global · Top 1%
              </div>
              <div className="font-mono text-xs text-accent-primary mt-1">
                +{player.delta7d} this week
              </div>
              <div className="font-mono text-[11px] text-tertiary mt-2 flex items-center justify-end gap-1">
                <span className="text-accent-primary">●●●●</span>
                <span className="text-tertiary">○</span>
                <span>0.94 confidence</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 6 Subscore Cards */}
        <div className="px-6 mt-4">
          <div className="grid grid-cols-6 gap-3">
            {subscores.map((subscore, index) => (
              <motion.div
                key={subscore.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              >
                <SubscoreCard
                  label={subscore.label}
                  score={subscore.score}
                  weight={subscore.weight}
                  color={subscore.color}
                  isPositive={subscore.isPositive}
                  delay={0.1 * index}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Two Column Section: Chart + Opportunity */}
        <div className="px-6 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              className="col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <CMVChart />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <OpportunityCard />
            </motion.div>
          </div>
        </div>

        {/* Bottom Row: Social + Momentum */}
        <div className="px-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <SocialSignalsCard />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
            >
              <MomentumSignalsCard />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-[220px] right-0 bg-[rgba(8,9,14,0.95)] backdrop-blur-xl border-t border-border py-4 px-8 z-50">
        <div className="flex items-center justify-between">
          <div className="font-mono text-sm text-secondary">
            {player.name} · <span className="text-primary">CMV {player.cmvScore}</span>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-secondary text-sm hover:bg-surface-2 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Watchlist
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-secondary text-sm hover:bg-surface-2 transition-colors">
              <Scale className="w-3.5 h-3.5" />
              Compare
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-secondary text-sm hover:bg-surface-2 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-secondary text-sm hover:bg-surface-2 transition-colors">
              <Bell className="w-3.5 h-3.5" />
              Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
