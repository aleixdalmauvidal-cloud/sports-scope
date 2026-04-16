"use client"

import { motion } from "framer-motion"

interface SparklineProps {
  data: number[]
  trend: "up" | "down" | "flat"
  width?: number
  height?: number
}

export function Sparkline({ data, trend, width = 48, height = 20 }: SparklineProps) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  const colors = {
    up: "#00E5A0",
    down: "#F04E6B",
    flat: "#7A8299",
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      <motion.polyline
        points={points}
        fill="none"
        stroke={colors[trend]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  )
}
