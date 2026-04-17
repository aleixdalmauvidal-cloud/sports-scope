"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeltaIndicatorProps {
  value: number
  showIcon?: boolean
  className?: string
}

export function DeltaIndicator({ value, showIcon = true, className }: DeltaIndicatorProps) {
  const isPositive = value > 0
  const isNegative = value < 0
  const isNeutral = value === 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-semibold text-sm",
        isPositive && "text-positive",
        isNegative && "text-negative",
        isNeutral && "text-foreground-tertiary",
        className
      )}
    >
      {showIcon && (
        <>
          {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
          {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
          {isNeutral && <Minus className="w-3.5 h-3.5" />}
        </>
      )}
      <span>
        {isPositive && "+"}
        {value}
      </span>
    </span>
  )
}
