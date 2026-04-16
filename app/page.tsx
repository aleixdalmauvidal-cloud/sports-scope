"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, TrendingUp, Users, BarChart3, Zap, Shield, Globe, ChevronRight } from "lucide-react"
import { HomepageNav } from "@/components/homepage-nav"
import { HeroBackground } from "@/components/hero-background"
import { LiveTicker } from "@/components/live-ticker"

const featuredPlayers = [
  {
    name: "Lamine Yamal",
    club: "FC Barcelona",
    cmv: 63,
    rank: 1,
    delta: "+2.4",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=500&fit=crop&crop=faces",
  },
  {
    name: "Vinicius Jr",
    club: "Real Madrid",
    cmv: 61,
    rank: 2,
    delta: "+1.8",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=500&fit=crop&crop=faces",
  },
  {
    name: "Jude Bellingham",
    club: "Real Madrid",
    cmv: 59,
    rank: 3,
    delta: "-0.5",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=500&fit=crop&crop=faces",
  },
]

const stats = [
  { value: "964+", label: "Players Tracked" },
  { value: "5", label: "Top Leagues" },
  { value: "24/7", label: "Live Updates" },
  { value: "98%", label: "Data Accuracy" },
]

const features = [
  {
    icon: TrendingUp,
    title: "Real-Time CMV Scores",
    description: "Track commercial market value changes as they happen with our proprietary algorithm.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "6-dimensional scoring across Sports, Social, Commercial, Brand Fit, Momentum & Context.",
  },
  {
    icon: Users,
    title: "Player Comparison",
    description: "Compare up to 4 players side-by-side with radar charts and historical trends.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Complete coverage of LaLiga, Premier League, Serie A, Bundesliga and Ligue 1.",
  },
  {
    icon: Zap,
    title: "AI-Powered Insights",
    description: "Machine learning models that predict value trajectory and brand fit opportunities.",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "API access, custom reports, and dedicated support for brands and agencies.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HomepageNav />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <HeroBackground />
        
        {/* Gradient overlay for bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

        <div className="flex-1 flex items-center relative z-10 pt-20">
          <div className="w-full max-w-[1400px] mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] text-accent-primary border border-accent-primary/30 bg-accent-primary/[0.08] px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
                    LIVE COMMERCIAL INTELLIGENCE
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[1.05]"
                >
                  Know the value
                  <br />
                  <span className="gradient-text">before the market.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-6 text-lg md:text-xl text-foreground-secondary max-w-[500px] leading-relaxed"
                >
                  SportsScope quantifies the commercial market value of elite footballers. 
                  Real-time analytics for brands, agencies and clubs.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 flex flex-wrap items-center gap-4"
                >
                  <Link
                    href="/rankings"
                    className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-primary-foreground font-semibold text-base px-8 py-4 rounded-xl transition-all hover:shadow-glow-green"
                  >
                    Explore Rankings
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium text-base px-8 py-4 rounded-xl border border-border-default transition-colors">
                    Watch Demo
                  </button>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-12 grid grid-cols-4 gap-6"
                >
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center md:text-left">
                      <div className="font-mono text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-foreground-tertiary mt-1">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right - Featured Players */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="hidden lg:block"
              >
                <div className="relative">
                  {/* Main Featured Card */}
                  <div className="relative bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 rounded-2xl p-1 shadow-glow-green">
                    <div className="bg-background-surface rounded-xl overflow-hidden">
                      <div className="relative h-[400px]">
                        <Image
                          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop"
                          alt="Featured footballer"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background-surface via-transparent to-transparent" />
                        
                        {/* Player Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded bg-accent-primary/20 text-accent-primary font-mono text-xs font-semibold">
                              #1 CMV
                            </span>
                            <span className="px-2 py-0.5 rounded bg-positive/20 text-positive font-mono text-xs font-semibold">
                              +2.4
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">Lamine Yamal</h3>
                          <p className="text-foreground-secondary">FC Barcelona</p>
                          
                          <div className="mt-4 flex items-center gap-4">
                            <div>
                              <div className="font-mono text-3xl font-bold text-accent-primary">63</div>
                              <div className="text-xs text-foreground-tertiary">CMV Score</div>
                            </div>
                            <div className="h-12 w-px bg-border-default" />
                            <div>
                              <div className="font-mono text-lg font-semibold text-foreground">94.2M</div>
                              <div className="text-xs text-foreground-tertiary">Social Reach</div>
                            </div>
                            <div className="h-12 w-px bg-border-default" />
                            <div>
                              <div className="font-mono text-lg font-semibold text-foreground">Elite</div>
                              <div className="text-xs text-foreground-tertiary">Tier</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Mini Cards */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="absolute -left-12 top-20 bg-background-surface border border-border-default rounded-xl p-3 shadow-elevated"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-secondary/30 to-accent-primary/20 flex items-center justify-center">
                        <span className="font-mono text-sm font-bold text-accent-primary">#2</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Vinicius Jr</div>
                        <div className="text-xs text-foreground-tertiary">CMV: 61</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="absolute -right-8 bottom-32 bg-background-surface border border-border-default rounded-xl p-3 shadow-elevated"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary/30 to-accent-secondary/20 flex items-center justify-center">
                        <span className="font-mono text-sm font-bold text-accent-secondary">#3</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Bellingham</div>
                        <div className="text-xs text-foreground-tertiary">CMV: 59</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Live Ticker */}
        <div className="relative z-20">
          <LiveTicker />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(0, 255, 135, 0.03) 0%, transparent 50%)"
        }} />
        
        <div className="max-w-[1200px] mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-mono text-[11px] text-accent-primary uppercase tracking-wider">
              PLATFORM FEATURES
            </span>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-[-0.03em]">
              Everything you need to
              <br />
              <span className="gradient-text">make smarter decisions.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group bg-background-surface border border-border-default rounded-xl p-6 card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-4 group-hover:bg-accent-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground-secondary leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP PLAYERS SHOWCASE */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="font-mono text-[11px] text-accent-primary uppercase tracking-wider">
                TOP RANKED
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-[-0.03em]">
                This week&apos;s market leaders.
              </h2>
            </div>
            <Link
              href="/rankings"
              className="hidden md:inline-flex items-center gap-2 text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
            >
              View all rankings
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredPlayers.map((player, index) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/player/${index + 1}`} className="block group">
                  <div className="relative bg-background-surface border border-border-default rounded-2xl overflow-hidden card-hover">
                    {/* Image */}
                    <div className="relative h-[280px]">
                      <Image
                        src={player.image}
                        alt={player.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background-surface via-background-surface/50 to-transparent" />
                      
                      {/* Rank Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-mono text-lg font-bold ${
                          index === 0 
                            ? "bg-accent-primary text-primary-foreground shadow-glow-green" 
                            : "bg-background-elevated/80 backdrop-blur text-foreground"
                        }`}>
                          #{player.rank}
                        </span>
                      </div>
                      
                      {/* Delta Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-2 py-1 rounded-lg font-mono text-xs font-semibold ${
                          player.delta.startsWith("+") 
                            ? "bg-positive/20 text-positive" 
                            : "bg-negative/20 text-negative"
                        }`}>
                          {player.delta}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-accent-primary transition-colors">
                        {player.name}
                      </h3>
                      <p className="text-sm text-foreground-secondary">{player.club}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-foreground-tertiary mb-1">CMV Score</div>
                          <div className="font-mono text-2xl font-bold text-accent-primary">{player.cmv}</div>
                        </div>
                        <div className="w-20 h-2 rounded-full bg-background-elevated overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                            style={{ width: `${player.cmv}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/rankings"
              className="inline-flex items-center gap-2 text-accent-primary font-medium"
            >
              View all rankings
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at center, rgba(0, 255, 135, 0.06) 0%, transparent 60%)"
          }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl bg-accent-primary/5" />
        </div>

        <div className="max-w-[800px] mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-[-0.03em] leading-[1.1]">
              Ready to see
              <br />
              <span className="gradient-text">the full picture?</span>
            </h2>
            <p className="mt-6 text-lg text-foreground-secondary max-w-[500px] mx-auto">
              Join the brands, agencies and clubs already using SportsScope to make data-driven sponsorship decisions.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/rankings"
                className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-primary-foreground font-semibold text-base px-10 py-4 rounded-xl transition-all hover:shadow-glow-green"
              >
                Start Exploring Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground font-medium transition-colors">
                Request Enterprise Demo
              </button>
            </div>
            <p className="mt-6 font-mono text-sm text-foreground-tertiary">
              No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border-default bg-background-surface py-12 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center font-bold text-xl tracking-tight">
                <span className="text-foreground">SPORTS</span>
                <span className="text-accent-primary">SCOPE</span>
              </Link>
              <span className="hidden md:inline text-foreground-tertiary text-sm">
                Commercial Intelligence for Football
              </span>
            </div>

            <div className="flex items-center gap-8 text-sm text-foreground-secondary">
              <Link href="/rankings" className="hover:text-foreground transition-colors">
                Rankings
              </Link>
              <Link href="/players" className="hover:text-foreground transition-colors">
                Players
              </Link>
              <Link href="/compare" className="hover:text-foreground transition-colors">
                Compare
              </Link>
              <span className="hover:text-foreground transition-colors cursor-pointer">
                API
              </span>
            </div>

            <div className="text-sm text-foreground-tertiary">
              2026 SportsScope
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
