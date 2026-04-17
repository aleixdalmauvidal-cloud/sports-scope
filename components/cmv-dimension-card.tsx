"use client"

import { Activity, TrendingUp, BarChart2, Target, Zap, Sliders, type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface CMVDimensionCardProps {
  number: string
  title: string
  description: string
  icon: LucideIcon
}

export function CMVDimensionCard({ number, title, description, icon: Icon }: CMVDimensionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, borderColor: "rgba(0, 229, 160, 0.2)" }}
      transition={{ duration: 0.2 }}
      className="bg-background-surface border border-border-default rounded-xl p-6 group cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="font-mono text-[11px] text-foreground-tertiary">{number}</span>
        <Icon className="w-5 h-5 text-foreground-tertiary group-hover:text-accent-primary transition-colors" />
      </div>
      <h3 className="font-semibold text-base text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground-secondary">{description}</p>
    </motion.div>
  )
}

export const cmvDimensions = [
  {
    number: "01",
    title: "SPORTS",
    description: "On-pitch performance, minutes and form",
    icon: Activity,
  },
  {
    number: "02",
    title: "SOCIAL",
    description: "Reach, engagement and audience growth",
    icon: TrendingUp,
  },
  {
    number: "03",
    title: "COMMERCIAL",
    description: "Deal signals and sponsorship history",
    icon: BarChart2,
  },
  {
    number: "04",
    title: "BRAND FIT",
    description: "Alignment with brand categories",
    icon: Target,
  },
  {
    number: "05",
    title: "MOMENTUM",
    description: "Short-term velocity and buzz",
    icon: Zap,
  },
  {
    number: "06",
    title: "ADJUSTMENTS",
    description: "Contextual fine-tuning factors",
    icon: Sliders,
  },
]
