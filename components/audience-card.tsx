"use client"

import { motion } from "framer-motion"

interface AudienceCardProps {
  title: string
  description: string
  features: string[]
}

export function AudienceCard({ title, description, features }: AudienceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, borderColor: "rgba(0, 229, 160, 0.2)" }}
      transition={{ duration: 0.2 }}
      className="bg-background-surface border border-border-default rounded-xl p-8 flex flex-col"
    >
      <h3 className="font-bold text-lg text-foreground mb-3">{title}</h3>
      <p className="text-foreground-secondary text-sm mb-6">{description}</p>
      <ul className="space-y-2 mt-auto">
        {features.map((feature, index) => (
          <li key={index} className="text-foreground-tertiary text-sm flex items-center gap-2">
            <span className="text-accent-primary">·</span>
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export const audiences = [
  {
    title: "BRANDS & SPONSORS",
    description: "Find athletes that match your vertical before the market moves.",
    features: ["CMV-ranked shortlists", "Brand fit scoring", "Momentum windows"],
  },
  {
    title: "AGENCIES",
    description: "Walk into every pitch with a defensible data narrative.",
    features: ["Comparable profiles", "Client monitoring", "Export-ready rankings"],
  },
  {
    title: "ANALYSTS & CLUBS",
    description: "The commercial layer your scouting reports are missing.",
    features: ["Historical CMV evolution", "Social intelligence", "Competitor benchmarking"],
  },
]
