"use client"

import { motion } from "framer-motion"

interface ScoreBarProps {
  value: number
  maxValue?: number
  delay?: number
}

export function ScoreBar({ value, maxValue = 100, delay = 0.2 }: ScoreBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100)

  return (
    <div className="w-full h-[2px] rounded-full bg-[rgba(255,255,255,0.08)]">
      <motion.div
        className="h-full rounded-full bg-accent-primary"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
      />
    </div>
  )
}
