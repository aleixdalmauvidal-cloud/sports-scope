"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react"
import { getPlayerPhoto, mockPlayers } from "@/lib/mock-data"

interface MoverPlayer {
  id: string
  name: string
  club: string
  cmv: number
  delta: number
}

interface WeeklyMoversProps {
  risers: MoverPlayer[]
  fallers: MoverPlayer[]
}

function MoverCard({ player, type }: { player: MoverPlayer; type: "riser" | "faller" }) {
  const isRiser = type === "riser"
  const bgColor = isRiser ? "rgba(0,255,135,0.06)" : "rgba(240,78,107,0.06)"
  const borderColor = isRiser ? "rgba(0,255,135,0.15)" : "rgba(240,78,107,0.15)"
  const deltaColor = isRiser ? "#00FF87" : "#F04E6B"
  const ringColor = isRiser ? "ring-[#00FF87]/40" : "ring-[#F04E6B]/40"

  const full = mockPlayers.find((p) => p.id === player.id)
  const photoSrc = getPlayerPhoto(full?.rank ?? player.id)

  return (
    <Link
      href={`/player/${player.id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:brightness-110 transition-all"
      style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full overflow-hidden ring-2 ${ringColor} shrink-0`}>
        <Image
          src={photoSrc || "/placeholder.svg"}
          alt={player.name}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
        <p className="text-xs text-foreground-tertiary truncate">{player.club}</p>
      </div>

      {/* CMV + Delta */}
      <div className="text-right">
        <p className="font-mono text-sm font-semibold text-foreground">{player.cmv}</p>
        <p className="font-mono text-xs font-medium" style={{ color: deltaColor }}>
          {isRiser ? "+" : ""}
          {player.delta.toFixed(1)}
        </p>
      </div>
    </Link>
  )
}

export function WeeklyMovers({ risers, fallers }: WeeklyMoversProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="bg-[#0F1117] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">Weekly Movers</h3>
          <span className="text-xs text-foreground-tertiary">Biggest changes in 7 days</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-foreground-tertiary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-foreground-tertiary" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-6">
                {/* Risers */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-[#00E5A0]" />
                    <span className="text-xs font-mono uppercase tracking-wider text-foreground-secondary">
                      Risers
                    </span>
                  </div>
                  <div className="space-y-2">
                    {risers.map((player) => (
                      <MoverCard key={player.id} player={player} type="riser" />
                    ))}
                  </div>
                </div>

                {/* Fallers */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4 text-[#F04E6B]" />
                    <span className="text-xs font-mono uppercase tracking-wider text-foreground-secondary">
                      Fallers
                    </span>
                  </div>
                  <div className="space-y-2">
                    {fallers.map((player) => (
                      <MoverCard key={player.id} player={player} type="faller" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
