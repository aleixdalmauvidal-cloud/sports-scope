"use client"

import { motion } from "framer-motion"

interface KpiCardProps {
  label: string
  value: string | number
  sub: string
  stripeColor: string
  delay?: number
}

export function KpiCard({ label, value, sub, stripeColor, delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-[#0F1117] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden"
    >
      {/* Top stripe */}
      <div className="h-[3px]" style={{ backgroundColor: stripeColor }} />
      
      <div className="p-5">
        <p className="text-[10px] font-mono uppercase tracking-[0.08em] text-foreground-tertiary mb-2">
          {label}
        </p>
        <p className="font-mono text-[32px] font-semibold text-foreground leading-none mb-1">
          {value}
        </p>
        <p className="text-xs text-foreground-secondary">{sub}</p>
      </div>
    </motion.div>
  )
}
