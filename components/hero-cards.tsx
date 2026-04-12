"use client"

import Link from "next/link"
import { Player } from "@/lib/players"

interface HeroCardsProps {
  players: Player[]
}

function RankBadge({ rank }: { rank: number }) {
  const getDotColor = (rank: number) => {
    switch (rank) {
      case 1: return "#FFD700"
      case 2: return "#C0C0C0"
      case 3: return "#CD7F32"
      default: return "#888888"
    }
  }
  
  const getRankText = (rank: number) => {
    switch (rank) {
      case 1: return "1st"
      case 2: return "2nd"
      case 3: return "3rd"
      default: return `${rank}th`
    }
  }

  return (
    <span 
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "6px",
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <span 
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          backgroundColor: getDotColor(rank),
        }}
      />
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
        {getRankText(rank)}
      </span>
    </span>
  )
}

export function HeroCards({ players }: HeroCardsProps) {
  const topThree = players.slice(0, 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-card rounded-[10px] border border-border overflow-hidden">
      {topThree.map((player, index) => (
        <Link
          key={player.id}
          href={`/player/${player.id}`}
          className={`group p-6 hover:bg-[#7C6FFF]/5 transition-all duration-200 ${
            index < 2 ? "md:border-r md:border-border" : ""
          }`}
        >
          {/* Rank Badge */}
          <div style={{ marginBottom: "16px" }}>
            <RankBadge rank={player.rank} />
          </div>

          {/* Player Name & Club */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "15px", fontWeight: 500, color: "#ffffff", marginBottom: "4px" }}>
              {player.name}
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
              {player.club} · {player.position} · {player.flag}
            </p>
          </div>

          {/* CMV Score */}
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "38px", fontWeight: 600, color: "#7C6FFF", lineHeight: 1, marginBottom: "4px" }}>
              {player.cmvScore}
            </p>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              CMV Score
            </p>
          </div>

          {/* Trend */}
          <div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: player.weeklyChange >= 0 ? "#00E5A0" : "#FF4D6A",
              }}
            >
              {player.weeklyChange >= 0 ? "↑" : "↓"} {player.weeklyChange >= 0 ? "+" : ""}{player.weeklyChange.toFixed(1)} this week
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
