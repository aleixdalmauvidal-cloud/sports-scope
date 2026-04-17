"use client"

import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { Sparkles, Lock } from "lucide-react"

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

export default function AISearchPage() {
  return (
    <AppShell title="AI Search">
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
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-accent-primary" />
          </div>
          <h2 className="headline text-2xl text-foreground mb-2">AI-Powered Search</h2>
          <p className="text-foreground-secondary mb-6">
            Natural language queries to find players, analyze trends, and generate insights powered by advanced AI models.
          </p>
          <div className="flex items-center justify-center gap-2 text-foreground-tertiary">
            <Lock className="w-4 h-4" />
            <span className="label-tag">Coming Soon</span>
          </div>

          {/* Demo Search Box */}
          <motion.div
            variants={itemVariants}
            className="mt-8 p-4 bg-background-surface rounded-lg shadow-card"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-background rounded-lg border border-border-default">
              <Sparkles className="w-5 h-5 text-accent-primary" />
              <span className="text-foreground-tertiary text-sm">
                &quot;Find left wingers under 23 with high commercial potential...&quot;
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AppShell>
  )
}
