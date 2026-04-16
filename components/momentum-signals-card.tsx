"use client"

import { TierBadge } from "./tier-badge"

const signals = [
  {
    label: "Momentum Window",
    value: "HIGH · 30d",
    type: "pill" as const,
  },
  {
    label: "Audience Expansion",
    value: "Very High",
    type: "text-green" as const,
  },
  {
    label: "Trend Velocity",
    value: "+12.3 pts",
    type: "text-green" as const,
  },
  {
    label: "Diffusion Tier",
    value: "elite",
    type: "tier" as const,
  },
  {
    label: "Data Confidence",
    value: "0.94",
    type: "confidence" as const,
  },
]

export function MomentumSignalsCard() {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-6">
      <h3 className="font-semibold text-primary mb-4">Momentum Signals</h3>

      <div className="space-y-0">
        {signals.map((signal, index) => (
          <div
            key={signal.label}
            className={`flex items-center justify-between py-3 ${
              index < signals.length - 1 ? "border-b border-[rgba(255,255,255,0.05)]" : ""
            }`}
          >
            <span className="font-mono text-sm text-secondary">{signal.label}</span>
            {signal.type === "pill" && (
              <span className="px-2 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary font-mono text-xs">
                {signal.value}
              </span>
            )}
            {signal.type === "text-green" && (
              <span className="font-mono text-sm text-accent-primary">{signal.value}</span>
            )}
            {signal.type === "tier" && <TierBadge tier="elite" />}
            {signal.type === "confidence" && (
              <div className="flex items-center gap-2">
                <span className="text-accent-primary">●●●●</span>
                <span className="text-tertiary">○</span>
                <span className="font-mono text-sm text-primary">{signal.value}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
