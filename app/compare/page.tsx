"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { mockPlayers, getPlayerPhoto, type Player } from "@/lib/mock-data"
import { Plus, X, Check, ExternalLink, Link2, Star, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
} as any

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as any

// Player colors for chart
const playerColors = ["#00E5A0", "#3B82F6", "#F59E0B", "#EF4444"]

// Generate deterministic 12-month trend data
function generateTrendData(players: Player[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return months.map((month, i) => {
    const data: Record<string, string | number> = { month }
    players.forEach((player, idx) => {
      const trendPoints = player.trendData?.length ? player.trendData : [player.cmvScore]
      const sourceIndex = Math.floor((i / 11) * (trendPoints.length - 1))
      const nextIndex = Math.min(trendPoints.length - 1, sourceIndex + 1)
      const localProgress =
        trendPoints.length > 1 ? (i / 11) * (trendPoints.length - 1) - sourceIndex : 0
      const start = trendPoints[sourceIndex] ?? player.cmvScore
      const end = trendPoints[nextIndex] ?? player.cmvScore
      data[player.name] = Math.round(start + (end - start) * localProgress + idx * 0.1)
    })
    return data
  })
}

// Comparison metrics
const comparisonMetrics = [
  { key: "cmvScore", label: "CMV SCORE" },
  { key: "sportsScore", label: "SPORTS VALUE" },
  { key: "socialScore", label: "SOCIAL SCORE" },
  { key: "commercial", label: "COMMERCIAL" },
  { key: "brandFit", label: "BRAND FIT" },
  { key: "momentum", label: "MOMENTUM" },
  { key: "oppScore", label: "OPPORTUNITY" },
  { key: "delta7d", label: "7D CHANGE" },
]

type MetricValueSet = {
  cmvScore: number
  sportsScore: number
  socialScore: number
  commercial: number
  brandFit: number
  momentum: number
  oppScore: number
  delta7d: number
}

interface PlayerSlotProps {
  player: Player | null
  onSelect: (player: Player) => void
  onRemove: () => void
  colorIndex: number
  allPlayers: Player[]
  selectedIds: string[]
}

function PlayerSlot({ player, onSelect, onRemove, colorIndex, allPlayers, selectedIds }: PlayerSlotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredPlayers = allPlayers.filter(
    (p) =>
      !selectedIds.includes(p.id) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.club.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (player) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-background-surface rounded-xl p-4"
        style={{ borderColor: `${playerColors[colorIndex]}33`, borderWidth: 1 }}
      >
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 text-foreground-tertiary hover:text-status-negative transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full overflow-hidden bg-background-elevated shrink-0"
            style={{ boxShadow: `0 0 0 2px ${playerColors[colorIndex]}` }}
          >
            <Image
              src={getPlayerPhoto(player.rank) || "/placeholder.svg"}
              alt={player.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{player.name}</p>
            <p className="text-xs text-foreground-secondary">{player.club}</p>
          </div>
          <span className="font-mono text-xl font-semibold" style={{ color: playerColors[colorIndex] }}>
            {player.cmvScore}
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        whileHover={{ borderColor: "rgba(0,229,160,0.3)", backgroundColor: "rgba(0,229,160,0.03)" }}
        onClick={() => setIsOpen(true)}
        className="w-full bg-white/[0.02] border border-dashed border-white/[0.07] rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors min-h-[76px]"
      >
        <Plus className="w-8 h-8 text-foreground-tertiary" />
        <span className="text-foreground-tertiary text-[13px]">Add player</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background-elevated border border-border-default rounded-lg shadow-elevated z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-border-default">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background-surface rounded-md pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-foreground-tertiary outline-none focus:ring-1 focus:ring-accent-primary/50"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[240px] overflow-y-auto">
              {filteredPlayers.slice(0, 10).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelect(p)
                    setIsOpen(false)
                    setSearchQuery("")
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-background-surface transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-background-surface shrink-0">
                    <Image
                      src={getPlayerPhoto(p.rank) || "/placeholder.svg"}
                      alt={p.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-foreground-tertiary">{p.club}</p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-accent-primary">{p.cmvScore}</span>
                </button>
              ))}
              {filteredPlayers.length === 0 && (
                <p className="px-3 py-4 text-sm text-foreground-tertiary text-center">No players found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ComparePage() {
  // Pre-fill with Yamal and Vinicius
  const [selectedPlayers, setSelectedPlayers] = useState<(Player | null)[]>([
    mockPlayers[0], // Lamine Yamal
    mockPlayers[1], // Vinicius Jr
    null,
    null,
  ])

  const activePlayers = selectedPlayers.filter((p): p is Player => p !== null)
  const selectedIds = activePlayers.map((p) => p.id)
  const playerMetricMap = useMemo(() => {
    return new Map(
      activePlayers.map((player) => [
        player.id,
        {
          cmvScore: player.cmvScore,
          sportsScore: player.sportsScore,
          socialScore: player.socialScore,
          commercial: player.oppScore,
          brandFit: Math.round((player.sportsScore + player.socialScore) / 2),
          momentum: Math.max(0, Math.min(100, Math.round(50 + player.delta7d * 8))),
          oppScore: player.oppScore,
          delta7d: player.delta7d,
        } as MetricValueSet,
      ])
    )
  }, [activePlayers])

  const comparisonRows = useMemo(() => {
    return comparisonMetrics.map((metric) => {
      const values = activePlayers.map((p) => ({
        id: p.id,
        value: playerMetricMap.get(p.id)?.[metric.key as keyof MetricValueSet] ?? 0,
      }))
      const maxValue = values.length > 0 ? Math.max(...values.map((v) => v.value)) : null
      const winners = maxValue == null ? [] : values.filter((v) => v.value === maxValue)
      return {
        metric,
        values: Object.fromEntries(values.map((v) => [v.id, v.value])) as Record<string, number>,
        winnerId: winners.length === 1 ? winners[0].id : null,
        isTie: winners.length > 1,
      }
    })
  }, [activePlayers, playerMetricMap])

  const radarData = useMemo(() => {
    const radarDimensions = ["Sports", "Social", "Commercial", "Brand Fit", "Momentum", "Adjustments"]
    return radarDimensions.map((dim) => {
      const entry: Record<string, string | number> = { dimension: dim }
      activePlayers.forEach((player) => {
        const m = playerMetricMap.get(player.id)
        entry[player.name] =
          dim === "Sports"
            ? m?.sportsScore ?? 0
            : dim === "Social"
              ? m?.socialScore ?? 0
              : dim === "Commercial"
                ? m?.commercial ?? 0
                : dim === "Brand Fit"
                  ? m?.brandFit ?? 0
                  : dim === "Momentum"
                    ? m?.momentum ?? 0
                    : m?.cmvScore ?? 0
      })
      return entry
    })
  }, [activePlayers, playerMetricMap])

  const trendData = useMemo(() => generateTrendData(activePlayers), [activePlayers])

  return (
    <AppShell breadcrumb="Compare" showLiveBadge={false}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Page Header */}
        <motion.div variants={itemVariants}>
          <h1 className="headline text-2xl text-foreground">Compare Players</h1>
          <p className="text-foreground-secondary mt-1">
            Compare CMV profiles side by side — up to 4 players
          </p>
        </motion.div>

        {/* Player Selector Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-4 gap-3">
          {selectedPlayers.map((player, idx) => (
            <PlayerSlot
              key={idx}
              player={player}
              colorIndex={idx}
              allPlayers={mockPlayers}
              selectedIds={selectedIds}
              onSelect={(p) => {
                const newSelection = [...selectedPlayers]
                newSelection[idx] = p
                setSelectedPlayers(newSelection)
              }}
              onRemove={() => {
                const newSelection = [...selectedPlayers]
                newSelection[idx] = null
                setSelectedPlayers(newSelection)
              }}
            />
          ))}
        </motion.div>

        {activePlayers.length >= 2 && (
          <>
            {/* Comparison Table */}
            <motion.div variants={itemVariants} className="bg-background-surface rounded-xl shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-default">
                    <th className="sticky left-0 bg-background-surface px-4 py-3 text-left">
                      <span className="label-tag text-foreground-tertiary">METRIC</span>
                    </th>
                    {activePlayers.map((player, idx) => (
                      <th key={player.id} className="px-4 py-3 text-center min-w-[140px]">
                        <div className="flex flex-col items-center gap-1.5">
                          <div
                            className="w-12 h-12 rounded-full overflow-hidden bg-background-elevated"
                            style={{ boxShadow: `0 0 0 2px ${playerColors[idx]}` }}
                          >
                            <Image
                              src={getPlayerPhoto(player.rank) || "/placeholder.svg"}
                              alt={player.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground">{player.name}</span>
                          <span className="font-mono text-lg font-bold" style={{ color: playerColors[idx] }}>
                            {player.cmvScore}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center">
                      <span className="label-tag text-foreground-tertiary">WINNER</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map(({ metric, values, winnerId, isTie }) => {
                    return (
                      <tr key={metric.key} className="border-b border-border-default last:border-0">
                        <td className="sticky left-0 bg-background-surface px-4 py-3">
                          <span className="font-mono text-xs uppercase text-foreground-tertiary">{metric.label}</span>
                        </td>
                        {activePlayers.map((player, idx) => {
                          const value = values[player.id] ?? 0
                          const isWinner = winnerId === player.id
                          return (
                            <td
                              key={player.id}
                              className={cn("px-4 py-3 text-center", isWinner && "bg-white/[0.02]")}
                            >
                              <span
                                className={cn(
                                  "font-mono text-base font-semibold",
                                  isWinner ? "text-foreground" : "text-foreground"
                                )}
                                style={isWinner ? { color: playerColors[idx] } : undefined}
                              >
                                {metric.key === "delta7d" ? (value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1)) : value}
                              </span>
                            </td>
                          )
                        })}
                        <td className="px-4 py-3 text-center">
                          {isTie ? (
                            <span className="text-foreground-tertiary">—</span>
                          ) : winnerId ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <span
                                className="text-sm font-medium"
                                style={{ color: playerColors[activePlayers.findIndex((p) => p.id === winnerId)] }}
                              >
                                {activePlayers.find((p) => p.id === winnerId)?.name.split(" ").slice(-1)[0]}
                              </span>
                              <Check
                                className="w-4 h-4"
                                style={{ color: playerColors[activePlayers.findIndex((p) => p.id === winnerId)] }}
                              />
                            </div>
                          ) : (
                            <span className="text-foreground-tertiary">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </motion.div>

            {/* Radar Chart */}
            <motion.div
              variants={itemVariants}
              className="bg-background-surface rounded-xl p-6 shadow-card flex flex-col items-center"
            >
              <h2 className="headline text-lg text-foreground mb-4">CMV Profile Comparison</h2>
              <div style={{ width: 360, height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                    />
                    {activePlayers.map((player, idx) => (
                      <Radar
                        key={player.id}
                        name={player.name}
                        dataKey={player.name}
                        stroke={playerColors[idx]}
                        fill={playerColors[idx]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-6 mt-4">
                {activePlayers.map((player, idx) => (
                  <div key={player.id} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: playerColors[idx] }} />
                    <span className="text-sm text-foreground-secondary">{player.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CMV Trend Overlap Chart */}
            <motion.div variants={itemVariants} className="bg-background-surface rounded-xl p-6 shadow-card">
              <h2 className="headline text-lg text-foreground mb-4">CMV Trend (12 Months)</h2>
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      domain={["dataMin - 5", "dataMax + 5"]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#161B27",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: 16 }}
                      formatter={(value) => <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{value}</span>}
                    />
                    {activePlayers.map((player, idx) => (
                      <Line
                        key={player.id}
                        type="monotone"
                        dataKey={player.name}
                        stroke={playerColors[idx]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: playerColors[idx] }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Action Row */}
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-default text-foreground-secondary hover:text-foreground hover:border-border-hover transition-colors">
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">Export Comparison</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-default text-foreground-secondary hover:text-foreground hover:border-border-hover transition-colors">
                <Link2 className="w-4 h-4" />
                <span className="text-sm">Share Link</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-default text-foreground-secondary hover:text-foreground hover:border-border-hover transition-colors">
                <Star className="w-4 h-4" />
                <span className="text-sm">Add to Shortlist</span>
              </button>
            </motion.div>
          </>
        )}

        {activePlayers.length < 2 && (
          <motion.div
            variants={itemVariants}
            className="bg-background-surface rounded-xl p-12 flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-background-elevated flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-foreground-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select at least 2 players</h3>
            <p className="text-foreground-secondary max-w-md">
              Use the slots above to add players and compare their CMV profiles side by side.
            </p>
          </motion.div>
        )}
      </motion.div>
    </AppShell>
  )
}
