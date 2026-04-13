"use client"

import Link from "next/link"
import { Player } from "@/lib/players"
import { ArcGauge, subscoreColors } from "@/components/arc-gauge"

interface HeroCardsProps {
  players: Player[]
}

const rankGradients = [
  "linear-gradient(145deg, #0D2B18 0%, #1A4A2A 60%, #0D1110 100%)",
  "linear-gradient(145deg, #0D2218 0%, #1A3830 60%, #0D1110 100%)",
  "linear-gradient(145deg, #1A1A0D 0%, #2E2A12 60%, #0D1110 100%)",
];

export function HeroCards({ players }: HeroCardsProps) {
  const topThree = players.slice(0, 3)
  const gaugeMap = [
    { label: "SPT", color: subscoreColors.sports, key: "sportsScore" as const },
    { label: "SOC", color: subscoreColors.social, key: "socialScore" as const },
    { label: "COM", color: subscoreColors.commercial, key: "commercialScore" as const },
    { label: "BRD", color: subscoreColors.brandFit, key: "brandFitScore" as const },
    { label: "MOM", color: subscoreColors.momentum, key: "momentumScore" as const },
    { label: "ADJ", color: subscoreColors.adjustments, key: "adjustmentsScore" as const },
  ];

  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-[10px] border border-border bg-card md:grid-cols-3">
      {topThree.map((player, index) => (
        <Link
          key={player.id}
          href={`/player/${player.id}`}
          className={`group relative overflow-hidden p-6 transition-all duration-200 hover:bg-[rgba(45,122,58,0.04)] ${
            index < 2 ? "md:border-r md:border-border" : ""
          }`}
          style={{ background: rankGradients[index] ?? rankGradients[2] }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" viewBox="0 0 100 100" preserveAspectRatio="none">
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 20} x2="100" y2={i * 20} stroke="white" strokeWidth="0.6" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="100" stroke="white" strokeWidth="0.6" />
            ))}
          </svg>
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" viewBox="0 0 100 100">
            <circle cx="50" cy="35" r="7" fill="white" />
            <rect x="45" y="43" width="10" height="17" rx="5" fill="white" />
            <line x1="45" y1="50" x2="35" y2="58" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <line x1="55" y1="50" x2="65" y2="56" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <line x1="47" y1="60" x2="40" y2="76" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="53" y1="60" x2="64" y2="71" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
          <span className="pointer-events-none absolute bottom-1 right-3 font-display text-[100px] font-extrabold leading-none text-white/5">
            {index + 1}
          </span>

          <div className="relative z-10 mb-4 flex items-start justify-between">
            <span className="rounded-full border border-border bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#C8D8D4]">
              {`RANK ${String(index + 1).padStart(2, "0")}`}
            </span>
            <span className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ borderColor: player.accentColor, color: player.accentColor }}>
              CMV {player.cmvScore}
            </span>
          </div>

          <div
            className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 text-lg font-semibold"
            style={
              player.photo_url
                ? { borderColor: "rgba(56,160,71,0.22)" }
                : {
                    borderColor: "rgba(56,160,71,0.22)",
                    backgroundColor: "rgba(56,160,71,0.15)",
                    color: "#E8F5EA",
                  }
            }
          >
            {player.photo_url ? (
              <>
                <img
                  src={player.photo_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D1110] via-transparent to-transparent opacity-90"
                />
              </>
            ) : (
              player.name.split(" ").map((n) => n[0]).join("")
            )}
          </div>

          <div className="relative z-10 mb-4">
            <p className="font-display text-[15px] font-semibold text-white">
              {player.name}
            </p>
            <p className="text-[10px] text-[#4A5E58]">
              {player.club} · {player.position} · {player.flag}
            </p>
          </div>

          <div className="relative z-10 mb-4 grid grid-cols-6 gap-1.5">
            {gaugeMap.map((gauge) => (
              <ArcGauge
                key={gauge.label}
                value={player[gauge.key]}
                color={gauge.color}
                label={gauge.label}
                size={34}
                strokeWidth={3}
              />
            ))}
          </div>

          <div className="relative z-10">
            <span className={`text-xs font-medium ${player.weeklyChange >= 0 ? "text-[#2D9E50]" : "text-[#D94F4F]"}`}>
              {player.weeklyChange >= 0 ? "↑" : "↓"} {player.weeklyChange >= 0 ? "+" : ""}
              {player.weeklyChange.toFixed(1)} this week
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
