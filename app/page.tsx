"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Users,
  Trophy,
  Globe2,
  BarChart3,
  Flame,
  Sparkles,
  Clock,
  ChevronRight,
  Filter,
  Database,
  Activity,
} from "lucide-react"
import { HomepageNav } from "@/components/homepage-nav"
import { LiveTicker } from "@/components/live-ticker"
import { mockPlayers, weeklyMovers } from "@/lib/mock-data"

const popularSearches = [
  "Lamine Yamal",
  "Vinicius Jr",
  "Mohamed Salah",
  "Kylian Mbappé",
  "Jude Bellingham",
  "Erling Haaland",
]

const leagues = [
  { name: "LaLiga", country: "Spain", players: 287, flag: "🇪🇸" },
  { name: "Premier League", country: "England", players: 312, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "Serie A", country: "Italy", players: 194, flag: "🇮🇹" },
  { name: "Bundesliga", country: "Germany", players: 156, flag: "🇩🇪" },
  { name: "Ligue 1", country: "France", players: 178, flag: "🇫🇷" },
  { name: "Liga Portugal", country: "Portugal", players: 98, flag: "🇵🇹" },
]

const categories = [
  { name: "Elite Tier", count: 12, icon: Trophy, href: "/rankings?tier=elite" },
  { name: "Premium Tier", count: 47, icon: Sparkles, href: "/rankings?tier=premium" },
  { name: "Forwards", count: 284, icon: Flame, href: "/rankings?pos=FW" },
  { name: "Midfielders", count: 312, icon: Activity, href: "/rankings?pos=MF" },
  { name: "Defenders", count: 268, icon: Users, href: "/rankings?pos=DF" },
  { name: "Goalkeepers", count: 100, icon: Trophy, href: "/rankings?pos=GK" },
  { name: "Under 21", count: 156, icon: Sparkles, href: "/rankings?age=u21" },
  { name: "Rising Stars", count: 38, icon: TrendingUp, href: "/rankings?trend=up" },
]

const activityFeed = [
  {
    player: "Lamine Yamal",
    club: "Barcelona",
    text: "climbed to #1 in CMV Rankings",
    delta: "+3.4",
    time: "2h ago",
    positive: true,
  },
  {
    player: "Jude Bellingham",
    club: "Real Madrid",
    text: "dropped 8 positions after injury update",
    delta: "-27.2",
    time: "4h ago",
    positive: false,
  },
  {
    player: "Robert Lewandowski",
    club: "Barcelona",
    text: "entered Premium Tier for first time",
    delta: "+3.0",
    time: "6h ago",
    positive: true,
  },
  {
    player: "Mohamed Salah",
    club: "Liverpool",
    text: "social engagement reached all-time high",
    delta: "+1.2",
    time: "8h ago",
    positive: true,
  },
  {
    player: "Erling Haaland",
    club: "Man City",
    text: "CMV score fell on reduced minutes",
    delta: "-19.8",
    time: "1d ago",
    positive: false,
  },
]

export default function HomePage() {
  const topPlayers = mockPlayers.slice(0, 10)

  return (
    <div className="min-h-screen bg-background">
      <HomepageNav />

      {/* HERO — Data portal entry point */}
      <section className="relative pt-32 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,135,0.08)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <div className="relative max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-1 border border-border-default text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
              <span className="font-mono text-foreground-secondary">Live data · Updated 4m ago</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-5 max-w-4xl"
          >
            The football <span className="text-accent-primary">commercial value</span> database.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-foreground-secondary max-w-2xl mb-10 leading-relaxed"
          >
            Explore CMV scores, rankings, and commercial signals for{" "}
            <span className="text-foreground font-semibold">2,847 players</span> across{" "}
            <span className="text-foreground font-semibold">12 leagues</span>. The reference source for sports commercial intelligence.
          </motion.p>

          {/* Big search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-3xl"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-primary/40 via-accent-primary/20 to-accent-primary/40 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex items-center gap-3 bg-surface-1 border border-border-strong rounded-2xl px-5 h-16">
                <Search className="w-5 h-5 text-accent-primary shrink-0" />
                <input
                  type="text"
                  placeholder="Search any player, club, or league..."
                  className="flex-1 bg-transparent text-lg placeholder:text-foreground-tertiary focus:outline-none"
                />
                <kbd className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-surface-2 border border-border-default font-mono text-xs text-foreground-tertiary">
                  ⌘K
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-xs text-foreground-tertiary">Popular:</span>
              {popularSearches.map((search) => (
                <Link
                  key={search}
                  href={`/players?q=${encodeURIComponent(search)}`}
                  className="text-xs text-foreground-secondary hover:text-accent-primary transition-colors border border-border-default rounded-full px-3 py-1 hover:border-accent-primary/40"
                >
                  {search}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Database stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-border-default border border-border-default rounded-xl overflow-hidden"
          >
            <StatBlock icon={Users} value="2,847" label="Players tracked" />
            <StatBlock icon={Trophy} value="12" label="Leagues covered" />
            <StatBlock icon={Database} value="1.2M+" label="Data points / week" />
            <StatBlock icon={Activity} value="Live" label="Real-time updates" accent />
          </motion.div>
        </div>
      </section>

      <LiveTicker />

      {/* TOP RANKINGS — data first */}
      <section className="py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-accent-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-accent-primary">
                  Top 10 · This week
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Current Rankings</h2>
              <p className="text-foreground-secondary mt-2">
                The highest Commercial Market Value scores, updated hourly.
              </p>
            </div>

            <Link
              href="/rankings"
              className="inline-flex items-center gap-2 text-sm text-accent-primary hover:text-accent-primary/80 font-medium"
            >
              See full rankings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[56px_1fr_100px_90px_90px_80px_120px] gap-4 px-5 py-3 border-b border-border-default bg-surface-2 text-xs font-mono uppercase tracking-wider text-foreground-tertiary">
              <div>Rank</div>
              <div>Player</div>
              <div>League</div>
              <div>Position</div>
              <div className="text-right">CMV</div>
              <div className="text-right">7D</div>
              <div className="text-right">Trend</div>
            </div>
            {topPlayers.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Link
                  href={`/player/${player.id}`}
                  className="grid grid-cols-[56px_1fr_100px_90px_90px_80px_120px] gap-4 px-5 py-3.5 items-center border-b border-border-default last:border-b-0 hover:bg-surface-2 transition-colors group"
                >
                  <div>
                    <span
                      className={`font-mono text-sm font-semibold ${
                        player.rank === 1
                          ? "text-accent-primary"
                          : player.rank <= 3
                          ? "text-foreground"
                          : "text-foreground-secondary"
                      }`}
                    >
                      {String(player.rank).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-surface-3 overflow-hidden shrink-0 border border-border-default">
                      {player.imageId && (
                        <Image
                          src={`https://images.fotmob.com/image_resources/playerimages/${player.imageId}.png`}
                          alt={player.name}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-foreground truncate group-hover:text-accent-primary transition-colors">
                        {player.name}
                      </div>
                      <div className="text-xs text-foreground-tertiary truncate">
                        {player.nationalityFlag} {player.club}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-foreground-secondary truncate hidden md:block">{player.league}</div>
                  <div className="hidden md:block">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                        player.position === "FW"
                          ? "bg-orange-500/10 text-orange-400"
                          : player.position === "MF"
                          ? "bg-blue-500/10 text-blue-400"
                          : player.position === "DF"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {player.position}
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold text-right">{player.cmvScore}</div>
                  <div
                    className={`font-mono text-sm font-semibold text-right hidden md:block ${
                      player.delta7d > 0
                        ? "text-positive"
                        : player.delta7d < 0
                        ? "text-negative"
                        : "text-foreground-tertiary"
                    }`}
                  >
                    {player.delta7d > 0 ? "+" : ""}
                    {player.delta7d.toFixed(1)}
                  </div>
                  <div className="hidden md:flex justify-end">
                    <MiniSparkline data={player.trendData} trend={player.trend} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BROWSE BY CATEGORY — like Crunchbase */}
      <section className="py-20 px-6 border-t border-border-default">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-accent-primary" />
              <span className="text-xs font-mono uppercase tracking-widest text-accent-primary">
                Explore the database
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Browse by category</h2>
            <p className="text-foreground-secondary mt-2 max-w-2xl">
              Dive into specific segments of the database. Filter players by tier, position, age, or trend direction.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat, i) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link
                    href={cat.href}
                    className="group flex items-center justify-between p-5 bg-surface-1 border border-border-default rounded-xl hover:border-accent-primary/40 hover:bg-surface-2 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border-default flex items-center justify-center group-hover:bg-accent-primary/10 group-hover:border-accent-primary/30 transition-colors">
                        <Icon className="w-4 h-4 text-foreground-secondary group-hover:text-accent-primary transition-colors" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{cat.name}</div>
                        <div className="font-mono text-xs text-foreground-tertiary">{cat.count} players</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foreground-tertiary group-hover:text-accent-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* LEAGUES + ACTIVITY FEED */}
      <section className="py-20 px-6 border-t border-border-default">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Globe2 className="w-4 h-4 text-accent-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-accent-primary">Coverage</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Leagues we track</h2>
              <p className="text-foreground-secondary mt-2">
                Comprehensive data across top European competitions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {leagues.map((league, i) => (
                <motion.div
                  key={league.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link
                    href={`/rankings?league=${encodeURIComponent(league.name)}`}
                    className="group flex items-center justify-between p-4 bg-surface-1 border border-border-default rounded-xl hover:border-accent-primary/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{league.flag}</div>
                      <div>
                        <div className="font-semibold text-sm group-hover:text-accent-primary transition-colors">
                          {league.name}
                        </div>
                        <div className="text-xs text-foreground-tertiary">{league.country}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold">{league.players}</div>
                      <div className="text-[10px] font-mono text-foreground-tertiary uppercase tracking-wider">
                        Players
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-accent-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-accent-primary">
                  Live activity
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Recent updates</h2>
              <p className="text-foreground-secondary mt-2">Latest changes across the database.</p>
            </div>

            <div className="bg-surface-1 border border-border-default rounded-xl divide-y divide-border-default">
              {activityFeed.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="p-4 hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        item.positive ? "bg-positive/10" : "bg-negative/10"
                      }`}
                    >
                      {item.positive ? (
                        <TrendingUp className="w-3.5 h-3.5 text-positive" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-negative" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm leading-snug">
                        <span className="font-semibold">{item.player}</span>{" "}
                        <span className="text-foreground-secondary">{item.text}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] text-foreground-tertiary">{item.club}</span>
                        <span className="text-foreground-tertiary">·</span>
                        <span className="text-[11px] text-foreground-tertiary">{item.time}</span>
                        <span
                          className={`text-[11px] font-mono font-semibold ml-auto ${
                            item.positive ? "text-positive" : "text-negative"
                          }`}
                        >
                          {item.delta}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WEEKLY MOVERS */}
      <section className="py-20 px-6 border-t border-border-default">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-accent-primary" />
              <span className="text-xs font-mono uppercase tracking-widest text-accent-primary">This week</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Weekly movers</h2>
            <p className="text-foreground-secondary mt-2">
              Biggest risers and fallers across the database in the last 7 days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border-default bg-surface-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-positive" />
                  <span className="font-semibold text-sm">Top Risers</span>
                </div>
                <span className="text-xs font-mono text-foreground-tertiary">7D</span>
              </div>
              {weeklyMovers.risers.map((p) => {
                const full = mockPlayers.find((pl) => pl.id === p.id)
                return (
                  <Link
                    key={p.id}
                    href={`/player/${p.id}`}
                    className="flex items-center justify-between px-5 py-4 border-b border-border-default last:border-b-0 hover:bg-surface-2 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-3 overflow-hidden border border-border-default">
                        {full?.imageId && (
                          <Image
                            src={`https://images.fotmob.com/image_resources/playerimages/${full.imageId}.png`}
                            alt={p.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm group-hover:text-accent-primary transition-colors">
                          {p.name}
                        </div>
                        <div className="text-xs text-foreground-tertiary">{p.club}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold">{p.cmv}</div>
                      <div className="font-mono text-xs font-semibold text-positive">+{p.delta.toFixed(1)}</div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="bg-surface-1 border border-border-default rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border-default bg-surface-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-negative" />
                  <span className="font-semibold text-sm">Top Fallers</span>
                </div>
                <span className="text-xs font-mono text-foreground-tertiary">7D</span>
              </div>
              {weeklyMovers.fallers.map((p) => {
                const full = mockPlayers.find((pl) => pl.id === p.id)
                return (
                  <Link
                    key={p.id}
                    href={`/player/${p.id}`}
                    className="flex items-center justify-between px-5 py-4 border-b border-border-default last:border-b-0 hover:bg-surface-2 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-3 overflow-hidden border border-border-default">
                        {full?.imageId && (
                          <Image
                            src={`https://images.fotmob.com/image_resources/playerimages/${full.imageId}.png`}
                            alt={p.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm group-hover:text-accent-primary transition-colors">
                          {p.name}
                        </div>
                        <div className="text-xs text-foreground-tertiary">{p.club}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold">{p.cmv}</div>
                      <div className="font-mono text-xs font-semibold text-negative">{p.delta.toFixed(1)}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="py-20 px-6 border-t border-border-default">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-accent-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-accent-primary">
                  Methodology
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">What is CMV?</h2>
              <p className="text-foreground-secondary leading-relaxed mb-4">
                <span className="text-foreground font-semibold">Commercial Market Value</span> is a composite score from 0 to 100 that quantifies a player&apos;s commercial potential by combining six weighted signals.
              </p>
              <p className="text-foreground-secondary leading-relaxed mb-8">
                Updated hourly from verified sources. Transparent weights. No editorial opinions.
              </p>
              <Link
                href="/rankings"
                className="inline-flex items-center gap-2 text-sm text-accent-primary hover:text-accent-primary/80 font-medium"
              >
                Read the methodology
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Sports performance", weight: "35%", color: "bg-accent-primary" },
                { label: "Social reach", weight: "20%", color: "bg-blue-400" },
                { label: "Commercial", weight: "20%", color: "bg-purple-400" },
                { label: "Brand fit", weight: "10%", color: "bg-orange-400" },
                { label: "Momentum", weight: "10%", color: "bg-pink-400" },
                { label: "Adjustments", weight: "5%", color: "bg-yellow-400" },
              ].map((item) => (
                <div key={item.label} className="p-4 bg-surface-1 border border-border-default rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="font-mono text-xs font-semibold text-foreground-secondary">
                      {item.weight}
                    </span>
                  </div>
                  <div className="text-sm font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="relative py-24 px-6 border-t border-border-default overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,135,0.06)_0%,transparent_70%)]" />

        <div className="relative max-w-[1400px] mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-5 max-w-3xl mx-auto text-balance">
            Start exploring the data.
          </h2>
          <p className="text-lg text-foreground-secondary mb-10 max-w-xl mx-auto">
            Free to search. Free to browse. The complete CMV database for football is a click away.
          </p>
          <div className="flex items-center gap-3 justify-center flex-wrap">
            <Link
              href="/rankings"
              className="bg-accent-primary hover:bg-accent-primary/90 text-primary-foreground font-semibold px-7 py-3.5 rounded-xl transition-colors inline-flex items-center gap-2"
            >
              Browse Database
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/compare"
              className="bg-surface-1 hover:bg-surface-2 border border-border-default text-foreground font-semibold px-7 py-3.5 rounded-xl transition-colors"
            >
              Compare Players
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border-default py-12 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-0.5 font-bold text-lg tracking-tight mb-3">
                <span className="text-foreground">SPORTS</span>
                <span className="text-accent-primary">SCOPE</span>
              </Link>
              <p className="text-sm text-foreground-tertiary max-w-xs">
                The reference database for football commercial intelligence.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
              <div>
                <div className="font-semibold mb-3 text-xs uppercase tracking-wider text-foreground-tertiary">
                  Database
                </div>
                <ul className="space-y-2">
                  <li><Link href="/rankings" className="text-foreground-secondary hover:text-accent-primary">Rankings</Link></li>
                  <li><Link href="/players" className="text-foreground-secondary hover:text-accent-primary">Players</Link></li>
                  <li><Link href="/compare" className="text-foreground-secondary hover:text-accent-primary">Compare</Link></li>
                  <li><Link href="/clubs" className="text-foreground-secondary hover:text-accent-primary">Clubs</Link></li>
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-3 text-xs uppercase tracking-wider text-foreground-tertiary">
                  Methodology
                </div>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-foreground-secondary hover:text-accent-primary">CMV Score</Link></li>
                  <li><Link href="#" className="text-foreground-secondary hover:text-accent-primary">Data sources</Link></li>
                  <li><Link href="#" className="text-foreground-secondary hover:text-accent-primary">Updates</Link></li>
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-3 text-xs uppercase tracking-wider text-foreground-tertiary">
                  Company
                </div>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-foreground-secondary hover:text-accent-primary">About</Link></li>
                  <li><Link href="#" className="text-foreground-secondary hover:text-accent-primary">API</Link></li>
                  <li><Link href="#" className="text-foreground-secondary hover:text-accent-primary">Press</Link></li>
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-3 text-xs uppercase tracking-wider text-foreground-tertiary">
                  Legal
                </div>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-foreground-secondary hover:text-accent-primary">Privacy</Link></li>
                  <li><Link href="#" className="text-foreground-secondary hover:text-accent-primary">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border-default flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-foreground-tertiary">
              © 2026 SportsScope. All data sourced from verified public records.
            </p>
            <p className="text-xs font-mono text-foreground-tertiary">
              Last sync: 4 min ago · Next update: in 56 min
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatBlock({
  icon: Icon,
  value,
  label,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  accent?: boolean
}) {
  return (
    <div className="bg-surface-1 p-6 flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          accent ? "bg-accent-primary/10" : "bg-surface-2 border border-border-default"
        }`}
      >
        <Icon className={`w-4 h-4 ${accent ? "text-accent-primary" : "text-foreground-secondary"}`} />
      </div>
      <div>
        <div className={`font-mono text-2xl font-bold ${accent ? "text-accent-primary" : "text-foreground"}`}>
          {value}
        </div>
        <div className="text-xs text-foreground-tertiary uppercase tracking-wider font-mono mt-1">{label}</div>
      </div>
    </div>
  )
}

function MiniSparkline({ data, trend }: { data: number[]; trend: "up" | "down" | "flat" }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 80
  const height = 24
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  const color = trend === "up" ? "#00FF87" : trend === "down" ? "#FF4757" : "#7A8290"
  const lastIdx = data.length - 1

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={height - ((data[lastIdx] - min) / range) * height} r={2} fill={color} />
    </svg>
  )
}
