"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { PositionBadge } from "@/components/position-badge"
import { TierBadge } from "@/components/tier-badge"
import { ScoreBar } from "@/components/score-bar"
import { mockPlayers, leagues, getPlayerPhoto, type Player, type League, type Position } from "@/lib/mock-data"
import { Search, ChevronDown, LayoutGrid, LayoutList, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const ITEMS_PER_PAGE = 50

// Generate 964 players by repeating and varying the mock data
function generateFullPlayerList(): Player[] {
  const players: Player[] = []
  const baseNames = ["Silva", "Martinez", "Garcia", "Rodriguez", "Lopez", "Fernandez", "Gonzalez", "Perez", "Santos", "Oliveira", "Mueller", "Schmidt", "Fischer", "Weber", "Wagner", "Becker", "Brown", "Smith", "Jones", "Williams", "Taylor", "Davies", "Evans", "Wilson", "Thomas"]
  const firstNames = ["Carlos", "Luis", "David", "Marco", "Lucas", "Pedro", "Andre", "Bruno", "Rafael", "Diego", "Manuel", "Jose", "Antonio", "Miguel", "Pablo", "Alex", "Max", "Leon", "Felix", "Jan", "Tim", "Kai", "Lukas", "Jonas", "Ben"]
  const clubs = ["Barcelona", "Real Madrid", "Man City", "Liverpool", "Arsenal", "Chelsea", "Bayern", "Dortmund", "PSG", "Juventus", "Inter Milan", "AC Milan", "Atletico", "Athletic", "Sevilla", "Valencia", "Villarreal", "Real Sociedad", "Tottenham", "Man United", "Newcastle", "Aston Villa", "Napoli", "Roma", "Lazio", "Fiorentina", "Lyon", "Marseille", "Monaco", "Lille", "Leipzig", "Leverkusen", "Frankfurt", "Wolfsburg", "Stuttgart"]
  const leagueMap: Record<string, string> = {
    "Barcelona": "LaLiga", "Real Madrid": "LaLiga", "Atletico": "LaLiga", "Athletic": "LaLiga", "Sevilla": "LaLiga", "Valencia": "LaLiga", "Villarreal": "LaLiga", "Real Sociedad": "LaLiga",
    "Man City": "Premier League", "Liverpool": "Premier League", "Arsenal": "Premier League", "Chelsea": "Premier League", "Tottenham": "Premier League", "Man United": "Premier League", "Newcastle": "Premier League", "Aston Villa": "Premier League",
    "Bayern": "Bundesliga", "Dortmund": "Bundesliga", "Leipzig": "Bundesliga", "Leverkusen": "Bundesliga", "Frankfurt": "Bundesliga", "Wolfsburg": "Bundesliga", "Stuttgart": "Bundesliga",
    "PSG": "Ligue 1", "Lyon": "Ligue 1", "Marseille": "Ligue 1", "Monaco": "Ligue 1", "Lille": "Ligue 1",
    "Juventus": "Serie A", "Inter Milan": "Serie A", "AC Milan": "Serie A", "Napoli": "Serie A", "Roma": "Serie A", "Lazio": "Serie A", "Fiorentina": "Serie A"
  }
  const positions: Position[] = ["FW", "MF", "DF", "GK"]
  const nationalities = [
    { name: "Spain", flag: "🇪🇸" }, { name: "Brazil", flag: "🇧🇷" }, { name: "France", flag: "🇫🇷" }, { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, { name: "Germany", flag: "🇩🇪" }, { name: "Portugal", flag: "🇵🇹" }, { name: "Argentina", flag: "🇦🇷" }, { name: "Italy", flag: "🇮🇹" }, { name: "Netherlands", flag: "🇳🇱" }, { name: "Belgium", flag: "🇧🇪" }
  ]

  // Add actual players first
  mockPlayers.forEach((p) => players.push(p))

  // Generate more players to reach 964 (deterministic from index — no Math.random)
  for (let i = 16; i <= 964; i++) {
    const firstName = firstNames[i % firstNames.length]
    const lastName = baseNames[(i * 3) % baseNames.length]
    const club = clubs[(i * 5) % clubs.length]
    const nationality = nationalities[(i * 11) % nationalities.length]
    const position = positions[(i * 13) % positions.length]
    const cmvJitter = (i * 17) % 8
    const cmv = Math.max(10, Math.floor(42 - (i - 16) * 0.035 + cmvJitter - 4))
    const tier = cmv >= 55 ? "elite" : cmv >= 45 ? "premium" : cmv >= 35 ? "mid" : "emerging"
    const trends: Player["trend"][] = ["up", "down", "flat"]

    players.push({
      id: `gen-${i}`,
      rank: i,
      name: `${firstName} ${lastName}`,
      nationality: nationality.name,
      nationalityFlag: nationality.flag,
      club,
      league: leagueMap[club] || "LaLiga",
      position,
      age: 18 + (i % 18),
      cmvScore: cmv,
      sportsScore: 50 + (i % 30),
      socialScore: 20 + ((i * 7) % 40),
      oppScore: 35 + ((i * 11) % 20),
      delta7d: parseFloat((((i * 13) % 60) / 10 - 3).toFixed(1)),
      tier: tier as Player["tier"],
      trendData: Array.from({ length: 6 }, (_, j) => cmv + ((i + j * 3) % 7) - 3),
      trend: trends[i % 3],
    })
  }

  return players
}

const allPlayers = generateFullPlayerList()

function PlayerAvatar({ player }: { player: Player }) {
  const ringColors: Record<string, string> = {
    elite: "#00FF87",
    premium: "#3B82F6",
    mid: "#F59E0B",
    emerging: "#8B5CF6",
  }
  const ringColor = ringColors[player.tier] || "#4A5068"
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
      <div
        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0F1117]"
        style={{ backgroundColor: statusColor }}
      />
    </div>
  )
}

function DeltaBadge({ value }: { value: number }) {
  if (value === 0) return <span className="font-mono text-xs text-foreground-tertiary">—</span>
  const isPositive = value > 0
  const bgColor = isPositive ? "rgba(0,229,160,0.1)" : "rgba(240,78,107,0.1)"
  const textColor = isPositive ? "#00E5A0" : "#F04E6B"
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {isPositive ? "+" : ""}{value.toFixed(1)}
    </span>
  )
}

function LeagueBadge({ league }: { league: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    "LaLiga": { bg: "rgba(239,68,68,0.15)", text: "#EF4444" },
    "Premier League": { bg: "rgba(147,51,234,0.15)", text: "#9333EA" },
    "Bundesliga": { bg: "rgba(234,179,8,0.15)", text: "#EAB308" },
    "Serie A": { bg: "rgba(34,197,94,0.15)", text: "#22C55E" },
    "Ligue 1": { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
  }
  const style = colors[league] || { bg: "rgba(255,255,255,0.1)", text: "#9CA3AF" }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] uppercase font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {league === "Premier League" ? "PL" : league === "Bundesliga" ? "BL" : league === "Serie A" ? "SA" : league === "Ligue 1" ? "L1" : "LL"}
    </span>
  )
}

function TableScoreBar({ value, maxValue = 100 }: { value: number; maxValue?: number }) {
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

function FilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-transparent border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-foreground-secondary hover:border-[rgba(255,255,255,0.15)] hover:text-foreground transition-colors"
      >
        <span>{label}: {value}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 mt-1 bg-[#161B27] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-elevated z-20 min-w-[140px] py-1"
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors",
                    value === opt ? "text-accent-primary" : "text-foreground-secondary"
                  )}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PlayersPage() {
  const [view, setView] = useState<"table" | "cards">("table")
  const [search, setSearch] = useState("")
  const [leagueFilter, setLeagueFilter] = useState<string>("All")
  const [positionFilter, setPositionFilter] = useState<string>("All")
  const [sortBy, setSortBy] = useState<string>("CMV")
  const [page, setPage] = useState(1)

  const filteredPlayers = useMemo(() => {
    let result = allPlayers

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.club.toLowerCase().includes(q) ||
        p.nationality.toLowerCase().includes(q)
      )
    }

    if (leagueFilter !== "All") {
      result = result.filter((p) => p.league === leagueFilter)
    }

    if (positionFilter !== "All") {
      result = result.filter((p) => p.position === positionFilter)
    }

    // Sort
    if (sortBy === "CMV") {
      result = [...result].sort((a, b) => b.cmvScore - a.cmvScore)
    } else if (sortBy === "Name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "7D Change") {
      result = [...result].sort((a, b) => b.delta7d - a.delta7d)
    }

    return result
  }, [search, leagueFilter, positionFilter, sortBy])

  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE)
  const paginatedPlayers = filteredPlayers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const uniqueLeagues = ["All", ...Array.from(new Set(allPlayers.map((p) => p.league)))]
  const uniquePositions = ["All", "FW", "MF", "DF", "GK"]

  return (
    <AppShell breadcrumb="Players" showLiveBadge={false}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Page Header */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent-primary mb-1">
            Player Database
          </p>
          <h1 className="text-[32px] font-bold text-foreground leading-tight">All Players</h1>
          <p className="text-foreground-secondary mt-1">964 footballers ranked by Commercial Market Value</p>
          <p className="font-mono text-xs text-foreground-tertiary mt-2">
            964 players · 5 leagues · 35 clubs
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by player name, club or nationality..."
              className="w-full h-12 pl-11 pr-16 bg-[#0F1117] border border-[rgba(255,255,255,0.07)] rounded-xl text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-[rgba(255,255,255,0.15)] transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-foreground-tertiary bg-[#161B27] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.1)]">
              ⌘K
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FilterDropdown label="League" value={leagueFilter} options={uniqueLeagues} onChange={(v) => { setLeagueFilter(v); setPage(1) }} />
              <FilterDropdown label="Position" value={positionFilter} options={uniquePositions} onChange={(v) => { setPositionFilter(v); setPage(1) }} />
              <FilterDropdown label="Sort" value={sortBy} options={["CMV", "Name", "7D Change"]} onChange={setSortBy} />
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#0F1117] rounded-lg border border-[rgba(255,255,255,0.07)]">
              <button
                onClick={() => setView("table")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  view === "table" ? "bg-accent-primary/10 text-accent-primary" : "text-foreground-tertiary hover:text-foreground-secondary"
                )}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("cards")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  view === "cards" ? "bg-accent-primary/10 text-accent-primary" : "text-foreground-tertiary hover:text-foreground-secondary"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <AnimatePresence mode="wait">
          {view === "table" ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-[#0F1117] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
                {/* Table Header */}
                <div
                  className="grid gap-4 px-4 py-2.5 bg-[#161B27] border-b border-[rgba(255,255,255,0.05)]"
                  style={{ gridTemplateColumns: "48px 1fr 56px 64px 88px 80px 80px 72px 80px" }}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">#</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">Player</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">Pos</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">League</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">CMV ↓</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">Sports</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">Social</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary">Opp</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-tertiary text-right">7D</span>
                </div>

                {/* Table Body */}
                <div>
                  {paginatedPlayers.map((player, index) => (
                    <Link key={player.id} href={`/player/${player.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
                        className={cn(
                          "grid gap-4 px-4 py-3 items-center cursor-pointer transition-colors h-[60px]",
                          index !== paginatedPlayers.length - 1 && "border-b border-[rgba(255,255,255,0.05)]",
                          player.rank === 1 && "border-l-2 border-l-[#00E5A0] bg-[rgba(0,229,160,0.03)]"
                        )}
                        style={{ gridTemplateColumns: "48px 1fr 56px 64px 88px 80px 80px 72px 80px" }}
                      >
                        <span className={cn(
                          "font-mono text-[13px] font-semibold",
                          player.rank === 1 ? "text-[#00E5A0]" : player.rank <= 5 ? "text-foreground-secondary" : "text-foreground-tertiary"
                        )}>
                          {player.rank}
                        </span>

                        <div className="flex items-center gap-3 min-w-0">
                          <PlayerAvatar player={player} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{player.name}</p>
                            <p className="text-xs text-foreground-secondary truncate">{player.nationalityFlag} {player.club}</p>
                          </div>
                        </div>

                        <PositionBadge position={player.position} />
                        <LeagueBadge league={player.league} />

                        <div className="space-y-1">
                          <span className="font-mono text-lg font-semibold text-foreground">{player.cmvScore}</span>
                          <TableScoreBar value={player.cmvScore} />
                        </div>

                        <span className="font-mono text-[15px] font-medium text-foreground-secondary">{player.sportsScore}</span>
                        <span className="font-mono text-[15px] font-medium text-foreground-secondary">{player.socialScore}</span>
                        <span className="font-mono text-[15px] text-foreground-secondary">{player.oppScore}</span>

                        <div className="flex justify-end">
                          <DeltaBadge value={player.delta7d} />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {paginatedPlayers.map((player, index) => (
                <Link key={player.id} href={`/player/${player.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    whileHover={{ y: -1, borderColor: "rgba(0,229,160,0.2)" }}
                    className="bg-[#0F1117] border border-[rgba(255,255,255,0.07)] rounded-xl p-5 cursor-pointer transition-all"
                  >
                    {/* Top row: rank + tier */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-[10px] text-foreground-tertiary">#{player.rank}</span>
                      <TierBadge tier={player.tier} />
                    </div>

                    {/* Center: avatar + name */}
                    <div className="flex flex-col items-center text-center mb-4">
                      <div
                        className="w-16 h-16 rounded-full bg-[#161B27] overflow-hidden mb-3"
                        style={{ boxShadow: `0 0 0 2px ${player.tier === "elite" ? "#00FF87" : player.tier === "premium" ? "#3B82F6" : player.tier === "mid" ? "#F59E0B" : "#8B5CF6"}` }}
                      >
                        <Image
                          src={getPlayerPhoto(player.rank) || "/placeholder.svg"}
                          alt={player.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-base font-semibold text-foreground">{player.name}</p>
                      <p className="text-xs text-foreground-secondary mb-2">{player.club}</p>
                      <PositionBadge position={player.position} />
                    </div>

                    {/* CMV Score */}
                    <div className="text-center mb-3">
                      <span
                        className={cn(
                          "font-mono text-[28px] font-bold",
                          player.cmvScore >= 60 ? "text-[#00E5A0]" : player.cmvScore >= 45 ? "text-[#3B82F6]" : "text-foreground-secondary"
                        )}
                      >
                        {player.cmvScore}
                      </span>
                    </div>

                    {/* Mini stats row */}
                    <div className="flex items-center justify-center gap-4 mb-3">
                      <div className="text-center">
                        <span className="font-mono text-[11px] text-foreground-tertiary">SPT</span>
                        <p className="font-mono text-xs text-foreground-secondary">{player.sportsScore}</p>
                      </div>
                      <div className="text-center">
                        <span className="font-mono text-[11px] text-foreground-tertiary">SOC</span>
                        <p className="font-mono text-xs text-foreground-secondary">{player.socialScore}</p>
                      </div>
                      <div className="text-center">
                        <span className="font-mono text-[11px] text-foreground-tertiary">MOM</span>
                        <p className="font-mono text-xs text-foreground-secondary">{player.oppScore}</p>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div className="h-[3px] bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${player.cmvScore}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="h-full bg-[#00E5A0] rounded-full"
                      />
                    </div>

                    {/* 7D delta */}
                    <div className="flex justify-end">
                      <DeltaBadge value={player.delta7d} />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.07)]">
          <p className="font-mono text-xs text-foreground-tertiary">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredPlayers.length)} of {filteredPlayers.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 bg-transparent border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-foreground-secondary hover:border-[rgba(255,255,255,0.15)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-lg font-mono text-sm transition-colors",
                      page === pageNum
                        ? "bg-accent-primary/10 text-accent-primary"
                        : "text-foreground-secondary hover:bg-[rgba(255,255,255,0.05)]"
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 bg-transparent border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-foreground-secondary hover:border-[rgba(255,255,255,0.15)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AppShell>
  )
}
