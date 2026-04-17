"use client"

import { motion } from "framer-motion"
import { Briefcase, TrendingUp, Shield, Zap } from "lucide-react"
import type { PlayerProfile } from "@/lib/mock-data"

interface Props {
  profile: PlayerProfile
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-xs text-foreground-tertiary italic">
      {label}
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary mb-1">
        {label}
      </div>
      <div className="font-mono text-lg font-bold text-foreground">
        {value ?? <span className="text-foreground-tertiary">—</span>}
      </div>
    </div>
  )
}

function BrandFitBar({ label, value, icon: Icon }: { label: string; value: number | null; icon: any }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-foreground-tertiary" />
          <span className="text-xs text-foreground-secondary">{label}</span>
        </div>
        <span className="font-mono text-sm font-semibold">
          {value !== null ? value : <span className="text-foreground-tertiary">—</span>}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        {value !== null && (
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${value}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
          />
        )}
      </div>
    </div>
  )
}

export function CommercialSection({ profile }: Props) {
  const { commercial } = profile

  return (
    <section className="px-6 mt-8">
      <div className="flex items-center gap-2 mb-5">
        <Briefcase className="w-4 h-4 text-accent-primary" />
        <h2 className="text-xs font-mono uppercase tracking-widest text-accent-primary">
          Commercial Intelligence
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Sponsored Content */}
        <div className="col-span-4 rounded-xl border border-border-default bg-surface-1 p-5">
          <h3 className="text-sm font-semibold mb-4">Sponsored Content</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem label="Branded posts / mo" value={commercial.brandedPostsPerMonth} />
            <StatItem label="Sponsorship density" value={commercial.sponsorshipDensity} />
          </div>

          <div className="mt-5 pt-5 border-t border-border-default">
            <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary mb-2">
              Brand Verticals
            </div>
            {commercial.brandVerticals.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {commercial.brandVerticals.map((v) => (
                  <span
                    key={v}
                    className="px-2 py-0.5 rounded-md bg-surface-2 border border-border-default text-xs"
                  >
                    {v}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyState label="No brand data available yet" />
            )}
          </div>

          <div className="mt-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary mb-2">
              Detected Categories
            </div>
            {commercial.detectedCategories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {commercial.detectedCategories.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-md bg-surface-2 border border-border-default text-xs"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyState label="No brand data available yet" />
            )}
          </div>
        </div>

        {/* Brand Fit Breakdown */}
        <div className="col-span-4 rounded-xl border border-border-default bg-surface-1 p-5">
          <h3 className="text-sm font-semibold mb-4">Brand Fit Breakdown</h3>
          <div className="space-y-3.5">
            <BrandFitBar label="Lifestyle Appeal" value={commercial.brandFit.lifestyleAppeal} icon={Zap} />
            <BrandFitBar label="Sportswear Fit" value={commercial.brandFit.sportswearFit} icon={TrendingUp} />
            <BrandFitBar label="Betting Fit" value={commercial.brandFit.bettingFit} icon={Briefcase} />
            <BrandFitBar label="Brand Safety" value={commercial.brandFit.brandSafety} icon={Shield} />
          </div>
        </div>

        {/* Main Sponsors + Recommended */}
        <div className="col-span-4 rounded-xl border border-border-default bg-surface-1 p-5">
          <h3 className="text-sm font-semibold mb-4">Main Sponsors</h3>
          {commercial.mainSponsors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {commercial.mainSponsors.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-sm text-accent-primary font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <EmptyState label="No brand data available yet" />
          )}

          <div className="mt-5 pt-5 border-t border-border-default">
            <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary mb-2">
              Recommended Campaigns
            </div>
            <div className="flex flex-wrap gap-1.5">
              {commercial.recommendedCampaigns.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-md bg-surface-2 border border-border-default text-xs text-foreground-secondary"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
