"use client"

import { motion } from "framer-motion"
import { TierBadge } from "./tier-badge"

const brandFitData = [
  { label: "SPORTSWEAR", score: 88 },
  { label: "LIFESTYLE", score: 76 },
  { label: "TECH", score: 65 },
  { label: "BETTING", score: 41 },
]

export function OpportunityCard() {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-6">
      <span className="font-mono text-[10px] uppercase tracking-wider text-tertiary">
        OPPORTUNITY SCORE
      </span>
      <div className="mt-1">
        <span className="font-mono text-[44px] font-bold text-accent-secondary leading-none tracking-[-2px]">
          47
        </span>
      </div>
      <div className="mt-2">
        <TierBadge tier="elite" />
      </div>

      <div className="border-t border-border mt-4 pt-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-tertiary">
          BRAND FIT
        </span>
        <div className="mt-3 space-y-3">
          {brandFitData.map((item, index) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-secondary">{item.label}</span>
                <span className="font-mono text-xs text-primary">{item.score}</span>
              </div>
              <div className="h-1 rounded-full bg-[rgba(255,255,255,0.08)]">
                <motion.div
                  className={`h-full rounded-full ${index < 2 ? "bg-accent-primary" : "bg-accent-secondary"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
