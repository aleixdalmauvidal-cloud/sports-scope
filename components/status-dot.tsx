"use client"

import { cn } from "@/lib/utils"

type Status = "active" | "inactive" | "pending"

interface StatusDotProps {
  status: Status
  className?: string
}

const statusColors: Record<Status, string> = {
  active: "bg-positive",
  inactive: "bg-negative",
  pending: "bg-foreground-tertiary",
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block w-1.5 h-1.5 rounded-full ring-2 ring-white/20",
        statusColors[status],
        className
      )}
    />
  )
}
