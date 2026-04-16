"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { HomepageNav } from "@/components/homepage-nav"
import { HeroBackground } from "@/components/hero-background"
import { LiveTicker } from "@/components/live-ticker"
import { CMVDimensionCard, cmvDimensions } from "@/components/cmv-dimension-card"
import { AudienceCard, audiences } from "@/components/audience-card"
import { RankingsPreview } from "@/components/rankings-preview"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HomepageNav />

      {/* SECTION 1 - HERO */}
      <section className="relative h-screen flex flex-col">
        <HeroBackground />

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="max-w-[900px] mx-auto px-6 text-center">
            {/* Top Label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block font-mono text-[11px] text-accent-primary border border-accent-primary/30 bg-accent-primary/[0.08] px-3 py-1.5 rounded-full">
                COMMERCIAL INTELLIGENCE · FOOTBALL 2026
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-8 text-5xl md:text-[80px] font-bold tracking-[-0.04em] leading-[1.1] text-foreground"
            >
              The standard for
              <br />
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                football commercial value.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-foreground-secondary max-w-[560px] mx-auto"
            >
              SportsScope ranks, tracks and quantifies the commercial market value of every
              footballer. Built for brands, agencies and clubs.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex items-center justify-center gap-4"
            >
              <Link
                href="/rankings"
                className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-primary-foreground font-medium text-base px-8 py-3 rounded-lg transition-colors"
              >
                Explore Rankings
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center gap-2 bg-transparent hover:bg-secondary text-foreground font-medium text-base px-8 py-3 rounded-lg border border-border-default hover:border-border-hover transition-colors">
                How it works
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex items-center justify-center gap-8 font-mono text-[13px] text-foreground-tertiary"
            >
              <span>964 players</span>
              <span className="text-foreground-tertiary/50">·</span>
              <span>5 leagues</span>
              <span className="text-foreground-tertiary/50">·</span>
              <span>Updated daily</span>
              <span className="text-foreground-tertiary/50">·</span>
              <span>Free to explore</span>
            </motion.div>
          </div>
        </div>

        {/* Live Ticker at bottom */}
        <LiveTicker />
      </section>

      {/* SECTION 2 - CMV EXPLAINED */}
      <section className="py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-mono text-[11px] text-accent-primary uppercase tracking-wider">
              THE ALGORITHM
            </span>
            <h2 className="mt-4 text-4xl md:text-[56px] font-bold tracking-[-0.03em] text-foreground">
              Six signals. One score.
            </h2>
            <p className="mt-4 text-foreground-secondary text-lg max-w-[700px]">
              CMV combines sports performance, social reach, commercial history, brand fit,
              momentum and contextual adjustments into a single comparable score.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cmvDimensions.map((dimension, index) => (
              <motion.div
                key={dimension.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CMVDimensionCard {...dimension} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 - LIVE RANKINGS PREVIEW */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <span className="font-mono text-[11px] text-accent-primary uppercase tracking-wider">
                LIVE RANKINGS
              </span>
              <h2 className="mt-4 text-4xl md:text-[56px] font-bold tracking-[-0.03em] text-foreground">
                Who&apos;s leading the market.
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-foreground-secondary">
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              Updated daily
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <RankingsPreview />
          </motion.div>
        </div>
      </section>

      {/* SECTION 4 - WHO IT'S FOR */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="font-mono text-[11px] text-accent-primary uppercase tracking-wider">
              USE CASES
            </span>
            <h2 className="mt-4 text-4xl md:text-[56px] font-bold tracking-[-0.03em] text-foreground">
              Built for the business of football.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {audiences.map((audience, index) => (
              <motion.div
                key={audience.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <AudienceCard {...audience} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 - FOOTER CTA */}
      <section className="py-32 px-6 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0, 229, 160, 0.04) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-[900px] mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-[64px] font-bold tracking-[-0.03em] text-foreground leading-[1.1]">
              See football value before the market does.
            </h2>
            <p className="mt-6 text-lg text-foreground-secondary">
              Join brands, agencies and clubs already using SportsScope Intelligence.
            </p>
            <Link
              href="/rankings"
              className="mt-10 inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-primary-foreground font-medium text-base px-10 py-4 rounded-lg transition-colors"
            >
              Explore Rankings
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="mt-6 font-mono text-sm text-foreground-tertiary">
              Free · No credit card · Updated daily
            </p>
          </motion.div>
        </div>
      </section>

      {/* FOOTER BAR */}
      <footer className="border-t border-border-default bg-background py-8 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-0.5 font-bold text-base tracking-tight">
              <span className="text-foreground">SPORTS</span>
              <span className="text-accent-primary">SCOPE</span>
            </Link>
            <span className="text-foreground-tertiary text-sm">© 2026 SportsScope</span>
          </div>

          {/* Center Links */}
          <div className="flex items-center gap-6 text-sm text-foreground-secondary">
            <Link href="/rankings" className="hover:text-foreground transition-colors">
              Rankings
            </Link>
            <Link href="/players" className="hover:text-foreground transition-colors">
              Players
            </Link>
            <Link href="/compare" className="hover:text-foreground transition-colors">
              Compare
            </Link>
            <span className="hover:text-foreground transition-colors cursor-pointer">About</span>
          </div>

          {/* Right tagline */}
          <div className="font-mono text-xs text-foreground-tertiary">
            CMV Intelligence · Football
          </div>
        </div>
      </footer>
    </div>
  )
}
