"use client"

import Link from "next/link"
import { Player } from "@/lib/players"
import { ArcGauge, subscoreColors } from "@/components/arc-gauge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface PlayerCardsGridProps {
  players: Player[]
}

function MiniArcGauges({ player }: { player: Player }) {
  const gauges = [
    { value: player.sportsScore, color: subscoreColors.sports, label: "SPT" },
    { value: player.socialScore, color: subscoreColors.social, label: "SOC" },
    { value: player.commercialScore, color: subscoreColors.commercial, label: "COM" },
    { value: player.brandFitScore, color: subscoreColors.brandFit, label: "BRD" },
    { value: player.momentumScore, color: subscoreColors.momentum, label: "MOM" },
    { value: player.adjustmentsScore, color: subscoreColors.adjustments, label: "ADJ" },
  ]

  return (
    <div className="flex items-center justify-between px-2">
      {gauges.map((gauge) => (
        <ArcGauge
          key={gauge.label}
          value={gauge.value}
          size={36}
          strokeWidth={3}
          color={gauge.color}
          label={gauge.label}
        />
      ))}
    </div>
  )
}

function TrendRow({ change }: { change: number }) {
  if (change === 0) {
    return (
      <div className="flex items-center justify-center gap-1 text-muted-foreground">
        <Minus className="w-3 h-3" />
        <span className="text-xs">0.0 vs last week</span>
      </div>
    )
  }

  const isPositive = change > 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  const colorClass = isPositive ? "text-[#2D9E50]" : "text-[#D94F4F]"

  return (
    <div className={`flex items-center justify-center gap-1 ${colorClass}`}>
      <Icon className="w-3 h-3" />
      <span className="text-xs">
        {isPositive ? "+" : ""}
        {change.toFixed(1)} vs last week
      </span>
    </div>
  )
}

function PlayerCard({ player, displayRank }: { player: Player; displayRank: number }) {
  return (
    <Link
      href={`/player/${player.id}`}
      className="group block rounded-[14px] overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      style={{
        backgroundColor: "#1C2420",
        border: "1px solid rgba(56,160,71,0.10)",
      }}
    >
      {/* Accent line at top */}
      <div 
        className="h-[3px] w-full"
        style={{ backgroundColor: player.accentColor }}
      />
      
      {/* Photo Area */}
      <div 
        className="relative h-40 flex items-center justify-center overflow-hidden"
        style={{ background: player.photo_url ? "#0D1110" : player.bgGradient }}
      >
        {player.photo_url ? (
          <>
            <img
              src={player.photo_url}
              alt=""
              className="absolute inset-0 z-[1] h-full w-full object-cover object-top"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[#0D1110] via-transparent to-transparent"
            />
          </>
        ) : null}

        {/* Dots pattern in top-right */}
        <div className="absolute top-3 right-3 z-[3] grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div 
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: player.accentColor, opacity: 0.1 }}
            />
          ))}
        </div>
        
        {/* Football player silhouette */}
        {!player.photo_url ? (
        <svg 
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <g 
            transform="translate(50, 50) scale(0.6)"
            style={{ fill: player.accentColor, opacity: 0.15 }}
          >
            {/* Stylized footballer silhouette mid-kick */}
            <circle cx="0" cy="-30" r="8" /> {/* Head */}
            <ellipse cx="0" cy="-12" rx="10" ry="12" /> {/* Torso */}
            <path d="M -8 0 Q -15 15 -20 30" strokeWidth="5" stroke={player.accentColor} fill="none" style={{ opacity: 0.15 }} /> {/* Left leg */}
            <path d="M 8 0 Q 20 10 35 5" strokeWidth="5" stroke={player.accentColor} fill="none" style={{ opacity: 0.15 }} /> {/* Right leg (kicking) */}
            <path d="M -8 -20 Q -20 -15 -25 -5" strokeWidth="4" stroke={player.accentColor} fill="none" style={{ opacity: 0.15 }} /> {/* Left arm */}
            <path d="M 8 -20 Q 15 -25 20 -20" strokeWidth="4" stroke={player.accentColor} fill="none" style={{ opacity: 0.15 }} /> {/* Right arm */}
          </g>
        </svg>
        ) : null}
        
        {/* Shirt number watermark */}
        <span 
          className="absolute inset-0 z-[3] flex items-center justify-center text-[120px] font-bold select-none"
          style={{ color: player.accentColor, opacity: 0.08 }}
        >
          {displayRank}
        </span>
        
        {/* Rank Badge */}
        <div className="absolute top-3 left-3 z-[4] px-2.5 py-1 rounded-full text-xs font-bold text-foreground" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          #{displayRank}
        </div>
        
        {/* CMV Badge */}
        <div 
          className="absolute top-12 right-3 z-[4] px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ 
            backgroundColor: "rgba(0,0,0,0.4)",
            border: `2px solid ${player.accentColor}`,
            color: player.accentColor
          }}
        >
          CMV {player.cmvScore}
        </div>

        {/* Opportunity Score — prominent */}
        <div
          className="absolute bottom-3 right-3 z-[4] flex flex-col items-end rounded-lg px-2.5 py-1.5"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
            OPP
          </span>
          <span
            className="text-lg font-bold tabular-nums leading-none"
            style={{ color: player.accentColor }}
          >
            {player.opportunityScore}
          </span>
        </div>
        
        {/* Player Initials Circle */}
        {!player.photo_url ? (
        <div 
          className="relative z-[4] w-14 h-14 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: `${player.accentColor}20`,
            border: `2px solid ${player.accentColor}99`,
          }}
        >
          <span 
            className="text-lg font-bold"
            style={{ color: player.accentColor }}
          >
            {player.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        ) : null}
        
        {/* Gradient fade at bottom (no photo only — photo path uses full-area fade above) */}
        {!player.photo_url ? (
        <div 
          className="absolute bottom-0 left-0 right-0 z-[3] h-16"
          style={{
            background: `linear-gradient(to top, #0D1110, transparent)`
          }}
        />
        ) : null}
      </div>
      
      {/* Card Body */}
      <div className="p-4">
        {/* Player Name */}
        <h3 className="mb-1 font-display text-[15px] font-bold text-foreground transition-colors group-hover:text-[#38A047]">
          {player.name}
        </h3>
        
        {/* Club · Position · Flag */}
        <p className="text-xs text-muted-foreground mb-4">
          {player.club} · {player.position} · {player.flag}
        </p>
        
        {/* Mini Arc Gauges */}
        <div className="mb-4">
          <MiniArcGauges player={player} />
        </div>
        
        {/* Trend Row */}
        <TrendRow change={player.weeklyChange} />
      </div>
    </Link>
  )
}

export function PlayerCardsGrid({ players }: PlayerCardsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {players.map((player, index) => (
        <PlayerCard key={player.id} player={player} displayRank={index + 1} />
      ))}
      
      {players.length === 0 && (
        <div className="col-span-full py-16 text-center text-muted-foreground">
          No players match your filters. Try adjusting search or filters.
        </div>
      )}
    </div>
  )
}
