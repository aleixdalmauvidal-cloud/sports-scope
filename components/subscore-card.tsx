"use client"

import { motion } from "framer-motion"
import { AnimatedNumber } from "./animated-number"

interface SubscoreCardProps {
  label: string
  score: number
  weight: number
  color?: "green" | "blue" | "momentum"
  isPositive?: boolean
  delay?: number
}

export function SubscoreCard({
  label,
  score,
  weight,
  color = "green",
  isPositive = true,
  delay = 0,
}: SubscoreCardProps) {
  const getBarColor = () => {
    if (color === "momentum") {
      return isPositive ? "bg-accent-primary" : "bg-status-negative"
    }
    return color === "green" ? "bg-accent-primary" : "bg-accent-secondary"
  }

  return (
    <div className="bg-surface-1 border border-border rounded-xl p-4">
      <span className="font-mono text-[9px] uppercase tracking-wider text-tertiary">
        {label}
      </span>
      <div className="mt-1">
        <AnimatedNumber
          value={score}
          className="text-2xl font-semibold text-primary"
        />
      </div>
      <div className="mt-2 h-[2.5px] rounded-full bg-[rgba(255,255,255,0.08)]">
        <motion.div
          className={`h-full rounded-full ${getBarColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, delay: delay + 0.2, ease: "easeOut" }}
        />
      </div>
      <span className="font-mono text-[9px] text-tertiary mt-2 block">
        {weight}% weight
      </span>
    </div>
  )
}
