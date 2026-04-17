"use client"

import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Scale,
  Download,
  Bell,
  Plus,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react"
import { mockPlayers, getPlayerPhoto, getPlayerProfile } from "@/lib/mock-data"
import { Sidebar } from "@/components/sidebar"
import { SubscoreCard } from "@/components/subscore-card"
import { CMVChart } from "@/components/cmv-chart"
import { CommercialSection } from "@/components/commercial-section"
import { SocialSection } from "@/components/social-section"
import { SportsSection } from "@/components/sports-section"
import { AnimatedNumber } from "@/components/animated-number"
import { cn } from "@/lib/utils"

const positionColors: Record<string, string> = {
  FW: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  MF: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  DF: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  GK: "bg-amber-500/15 text-amber-400 border-amber-500/20",
}

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

  const profile = getPlayerProfile(player)

  // CMV breakdown derived from player's scores
  const subscores = [
    { label: "SPORTS", score: player.sportsScore, weight: 25, color: "green" as const },
    { label: "SOCIAL", score: player.socialScore, weight: 30, color: "green" as const },
    {
      label: "COMMERCIAL",
      score: Math.round(player.oppScore * 0.6),
      weight: 15,
      color: "blue" as const,
    },
    {
      label: "BRAND FIT",
      score: Math.round(player.oppScore * 0.4),
      weight: 10,
      color: "blue" as const,
    },
    {
      label: "MOMENTUM",
      score: Math.max(0, Math.min(100, 50 + Math.round(player.delta7d * 8))),
      weight: 10,
      color: "momentum" as const,
      isPositive: player.delta7d >= 0,
    },
    {
      label: "ADJUSTMENTS",
      score: Math.round((player.sportsScore + player.socialScore) / 2.5),
      weight: 10,
      color: "green" as const,
    },
  ]

  const isPositiveDelta = player.delta7d >= 0

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[220px] pb-24">
        {/* ============ HERO BANNER ============ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative border-b border-border-default overflow-hidden"
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
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="relative flex items-start gap-8 p-8">
            {/* Left: Big Photo */}
            <div className="relative shrink-0">
              <div
                className="w-44 h-44 rounded-2xl overflow-hidden border-[3px] border-accent-primary/60"
                style={{ boxShadow: "0 0 60px rgba(0,255,135,0.25)" }}
              >
                <Image
                  src={getPlayerPhoto(player.rank) || "/placeholder.svg"}
                  alt={player.name}
                  width={176}
                  height={176}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Rank badge floating */}
              <div className="absolute -bottom-2 -right-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-primary text-background font-mono text-sm font-bold shadow-lg">
                #{player.rank}
              </div>
            </div>

            {/* Center: Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-tertiary text-xs">
                <Link href="/rankings" className="hover:text-secondary transition-colors">
                  Rankings
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground-secondary">{player.name}</span>
              </div>

              <h1 className="text-5xl font-extrabold text-primary tracking-[-0.03em] mt-2">
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
                <span>
                  {player.nationalityFlag} {player.nationality}
                </span>
              </div>

              {/* Meta stats row */}
              <div className="flex items-center gap-6 mt-5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary">
                    Age
                  </div>
                  <div className="font-mono text-lg font-bold">{player.age}</div>
                </div>
                <div className="h-8 w-px bg-border-default" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary">
                    Market Value
                  </div>
                  <div className="font-mono text-lg font-bold">
                    {profile.marketValue ?? (
                      <span className="text-foreground-tertiary">—</span>
                    )}
                  </div>
                </div>
                <div className="h-8 w-px bg-border-default" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary">
                    Global Rank
                  </div>
                  <div className="font-mono text-lg font-bold text-accent-primary">
                    Top {player.rank <= 10 ? "10" : player.rank <= 100 ? "100" : "1000"} CMV
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <Link
                  href={`/compare?with=${player.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent-primary text-background text-sm font-semibold hover:bg-accent-primary/90 transition-colors"
                >
                  <Scale className="w-3.5 h-3.5" />
                  Compare with another player
                </Link>
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border-default text-secondary text-sm hover:bg-surface-2 transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  Watch
                </button>
              </div>
            </div>

            {/* Right: CMV + Opportunity scores stacked */}
            <div className="flex flex-col gap-3 shrink-0">
              <div className="rounded-xl border border-accent-primary/30 bg-accent-primary/5 px-5 py-4 min-w-[200px]">
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent-primary/80">
                  Commercial Market Value
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <AnimatedNumber
                    value={player.cmvScore}
                    className="font-mono text-5xl font-bold text-accent-primary leading-none tracking-[-2px]"
                  />
                  <span className="text-xs text-foreground-tertiary">/ 100</span>
                </div>
                <div
                  className={`mt-2 font-mono text-xs font-semibold flex items-center gap-1 ${
                    isPositiveDelta ? "text-positive" : "text-negative"
                  }`}
                >
                  {isPositiveDelta ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isPositiveDelta ? "+" : ""}
                  {player.delta7d.toFixed(1)} vs last week
                </div>
              </div>

              <div className="rounded-xl border border-border-default bg-surface-1 px-5 py-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-foreground-tertiary">
                  Opportunity Score
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <AnimatedNumber
                    value={player.oppScore}
                    className="font-mono text-4xl font-bold text-foreground leading-none tracking-[-1px]"
                  />
                  <span className="text-xs text-foreground-tertiary">/ 100</span>
                </div>
                <div className="mt-2 font-mono text-[10px] text-foreground-tertiary uppercase tracking-wider">
                  Commercial potential
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============ CMV BREAKDOWN — 6 SUBSCORES ============ */}
        <section className="px-6 mt-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 rounded-full bg-accent-primary" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-accent-primary">
              CMV Breakdown
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
        </section>

        {/* ============ CMV EVOLUTION CHART ============ */}
        <section className="px-6 mt-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 rounded-full bg-accent-primary" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-accent-primary">
              CMV Evolution
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <CMVChart />
          </motion.div>
        </section>

        {/* ============ COMMERCIAL INTELLIGENCE ============ */}
        <CommercialSection profile={profile} />

        {/* ============ SOCIAL MEDIA DEEP DIVE ============ */}
        <SocialSection profile={profile} />

        {/* ============ SPORTS PERFORMANCE DETAIL ============ */}
        <SportsSection profile={profile} />
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-[220px] right-0 bg-[rgba(11,17,32,0.95)] backdrop-blur-xl border-t border-border-default py-3.5 px-8 z-50">
        <div className="flex items-center justify-between">
          <div className="font-mono text-sm text-secondary">
            {player.name}{" "}
            <span className="text-foreground-tertiary mx-1">·</span>{" "}
            <span className="text-accent-primary font-semibold">CMV {player.cmvScore}</span>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-default text-secondary text-sm hover:bg-surface-2 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Watchlist
            </button>
            <Link
              href={`/compare?with=${player.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-default text-secondary text-sm hover:bg-surface-2 transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              Compare
            </Link>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-default text-secondary text-sm hover:bg-surface-2 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-default text-secondary text-sm hover:bg-surface-2 transition-colors">
              <Bell className="w-3.5 h-3.5" />
              Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
