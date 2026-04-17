"use client"

import { Trophy } from "lucide-react"
import type { PlayerProfile } from "@/lib/mock-data"

interface Props {
  profile: PlayerProfile
}

function StatTile({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string
  value: string | number
  unit?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "border-accent-primary/30 bg-accent-primary/5"
          : "border-border-default bg-surface-1"
      }`}
    >
      <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono text-3xl font-bold leading-none tracking-tight ${
            highlight ? "text-accent-primary" : "text-foreground"
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs text-foreground-tertiary font-mono">{unit}</span>
        )}
      </div>
    </div>
  )
}

export function SportsSection({ profile }: Props) {
  const { sports } = profile

  return (
    <section className="px-6 mt-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent-primary" />
          <h2 className="text-xs font-mono uppercase tracking-widest text-accent-primary">
            Sports Performance Detail
          </h2>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-surface-2 border border-border-default font-mono text-xs text-foreground-secondary">
          {sports.season}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Goals" value={sports.goals} highlight />
        <StatTile label="Assists" value={sports.assists} highlight />
        <StatTile label="Apps" value={sports.apps} />
        <StatTile label="Minutes" value={sports.minutes.toLocaleString("en-US")} />
        <StatTile label="Form Rating" value={sports.formRating.toFixed(2)} unit="/ 10" />
        <StatTile
          label="Pass Accuracy"
          value={sports.passAccuracy.toFixed(1)}
          unit="%"
        />
        <StatTile label="Goals per 90" value={sports.goalsPer90.toFixed(2)} />
        <StatTile label="Assists per 90" value={sports.assistsPer90.toFixed(2)} />
      </div>
    </section>
  )
}
