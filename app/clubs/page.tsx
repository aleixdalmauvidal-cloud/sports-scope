"use client"

import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { Building2, Lock } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

export default function ClubsPage() {
  return (
    <AppShell title="Clubs">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center min-h-[60vh]"
      >
        <motion.div
          variants={itemVariants}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-background-elevated flex items-center justify-center">
            <Building2 className="w-8 h-8 text-foreground-tertiary" />
          </div>
          <h2 className="headline text-2xl text-foreground mb-2">Clubs Coming Soon</h2>
          <p className="text-foreground-secondary mb-6">
            Track club valuations, squad analytics, and commercial performance across top European leagues.
          </p>
          <div className="flex items-center justify-center gap-2 text-foreground-tertiary">
            <Lock className="w-4 h-4" />
            <span className="label-tag">In Development</span>
          </div>
        </motion.div>
      </motion.div>
    </AppShell>
  )
}
