"use client"

import { cn } from "@/lib/utils"

type Tier = "elite" | "premium" | "mid" | "emerging"

interface TierBadgeProps {
  tier: Tier
  className?: string
}

const tierStyles: Record<Tier, string> = {
  elite: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  premium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  mid: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  emerging: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
}

const tierLabels: Record<Tier, string> = {
  elite: "ELITE",
  premium: "PREMIUM",
  mid: "MID",
  emerging: "EMERGING",
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full border label-tag",
        tierStyles[tier],
        className
      )}
    >
      {tierLabels[tier]}
    </span>
  )
}
