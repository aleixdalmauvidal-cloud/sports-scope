"use client"

import Link from "next/link"
import { Player, opportunityScoreAccent } from "@/lib/players"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface RankingTableProps {
  players: Player[]
}

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 60
  const height = 20
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="inline-block ml-2">
      <polyline
        points={points}
        fill="none"
        stroke="#7C6FFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ScoreBar({ value, max = 100, bold = false }: { value: number; max?: number; bold?: boolean }) {
  const percentage = (value / max) * 100
  
  return (
    <div className="flex items-center gap-2">
      <span className={`w-8 ${bold ? "text-base font-bold text-foreground" : "text-sm text-foreground"}`}>{value}</span>
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7C6FFF] rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function OppBadge({ score }: { score: number }) {
  const accent = opportunityScoreAccent(score)
  const muted = score < 60
  return (
    <span
      className="inline-flex min-w-[2.25rem] items-center justify-center rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums"
      style={
        muted
          ? {
              color: "rgba(255,255,255,0.55)",
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }
          : {
              color: accent,
              backgroundColor: `${accent}22`,
              border: `1px solid ${accent}44`,
            }
      }
    >
      {score}
    </span>
  )
}

function WeeklyChange({ change }: { change: number }) {
  if (change === 0) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="w-3 h-3" />
        <span className="text-sm">0.0</span>
      </div>
    )
  }

  const isPositive = change > 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  const colorClass = isPositive ? "text-[#00E5A0]" : "text-[#FF4D6A]"

  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <Icon className="w-3 h-3" />
      <span className="text-sm">
        {isPositive ? "+" : ""}
        {change.toFixed(1)}
      </span>
    </div>
  )
}

export function RankingTable({ players }: RankingTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Rank
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Player
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
              Pos
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              CMV Score
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
              Sports
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
              Social
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
              Commercial
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
              Momentum
            </th>
            <th
              className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell cursor-help"
              title="Opportunity Score — commercial attractiveness right now"
            >
              OPP
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              7d
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr
              key={player.id}
              className={`border-b border-border transition-all hover:bg-[#7C6FFF]/5 group cursor-pointer relative ${
                index % 2 === 0 ? "bg-transparent" : "bg-muted/30"
              } hover:border-l-[3px] hover:border-l-[#7C6FFF]`}
            >
              <td className="py-5 px-4">
                <Link href={`/player/${player.id}`} className="block">
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                </Link>
              </td>
              <td className="py-5 px-4">
                <Link href={`/player/${player.id}`} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C6FFF]/30 to-[#00E5A0]/30 flex items-center justify-center text-xs font-medium text-foreground shrink-0">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-[#7C6FFF] transition-colors">
                      {player.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{player.club}</span>
                      <span>{player.flag}</span>
                    </div>
                  </div>
                </Link>
              </td>
              <td className="py-5 px-4 hidden md:table-cell">
                <Link href={`/player/${player.id}`} className="block">
                  <span className="text-sm text-muted-foreground">{player.position}</span>
                </Link>
              </td>
              <td className="py-5 px-4">
                <Link href={`/player/${player.id}`} className="flex items-center">
                  <ScoreBar value={player.cmvScore} bold />
                  <span className="hidden md:inline-block">
                    <MiniSparkline data={player.cmvHistory} />
                  </span>
                </Link>
              </td>
              <td className="py-5 px-4 hidden lg:table-cell">
                <Link href={`/player/${player.id}`} className="block">
                  <span className="text-sm text-foreground">{player.sportsScore}</span>
                </Link>
              </td>
              <td className="py-5 px-4 hidden lg:table-cell">
                <Link href={`/player/${player.id}`} className="block">
                  <span className="text-sm text-foreground">{player.socialScore}</span>
                </Link>
              </td>
              <td className="py-5 px-4 hidden lg:table-cell">
                <Link href={`/player/${player.id}`} className="block">
                  <span className="text-sm text-foreground">{player.commercialScore}</span>
                </Link>
              </td>
              <td className="py-5 px-4 hidden xl:table-cell">
                <Link href={`/player/${player.id}`} className="block">
                  <span className="text-sm text-foreground">{player.momentumScore}</span>
                </Link>
              </td>
              <td className="py-5 px-4 hidden xl:table-cell">
                <Link href={`/player/${player.id}`} className="block">
                  <OppBadge score={player.opportunityScore} />
                </Link>
              </td>
              <td className="py-5 px-4">
                <Link href={`/player/${player.id}`} className="block">
                  <WeeklyChange change={player.weeklyChange} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {players.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          No players match your filters. Try adjusting search or filters.
        </div>
      )}
    </div>
  )
}
