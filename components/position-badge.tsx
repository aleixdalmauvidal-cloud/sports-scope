import { cn } from "@/lib/utils"
import type { Position } from "@/lib/mock-data"

interface PositionBadgeProps {
  position: Position
}

const positionStyles: Record<Position, { bg: string; text: string }> = {
  FW: { bg: "rgba(251,146,60,0.15)", text: "#FB923C" },
  MF: { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
  DF: { bg: "rgba(34,197,94,0.15)", text: "#22C55E" },
  GK: { bg: "rgba(234,179,8,0.15)", text: "#EAB308" },
}

export function PositionBadge({ position }: PositionBadgeProps) {
  const style = positionStyles[position]

  return (
    <span
      className="inline-flex items-center justify-center px-2 py-0.5 rounded font-mono text-[10px] uppercase font-medium border"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.bg,
      }}
    >
      {position}
    </span>
  )
}
