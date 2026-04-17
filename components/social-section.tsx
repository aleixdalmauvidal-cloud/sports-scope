"use client"

import { Instagram, Youtube, Users, TrendingUp } from "lucide-react"
import type { PlayerProfile } from "@/lib/mock-data"

interface Props {
  profile: PlayerProfile
}

// Custom TikTok and X icons (lucide doesn't have them)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

interface PlatformStat {
  label: string
  value: string | null
  sublabel?: string
}

function PlatformCard({
  name,
  icon,
  accentColor,
  primaryStat,
  stats,
}: {
  name: string
  icon: React.ReactNode
  accentColor: string
  primaryStat: PlatformStat
  stats: PlatformStat[]
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-1 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {icon}
          </div>
          <span className="font-semibold text-sm">{name}</span>
        </div>
      </div>

      <div className="mb-4 pb-4 border-b border-border-default">
        <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary mb-1">
          {primaryStat.label}
        </div>
        <div className="font-mono text-3xl font-bold text-foreground leading-none">
          {primaryStat.value ?? <span className="text-foreground-tertiary">—</span>}
        </div>
        {primaryStat.sublabel && (
          <div className="text-xs text-accent-primary mt-1 font-medium">
            {primaryStat.sublabel}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary mb-1">
              {s.label}
            </div>
            <div className="font-mono text-sm font-semibold">
              {s.value ?? <span className="text-foreground-tertiary">—</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SocialSection({ profile }: Props) {
  const { social, content, audienceQuality } = profile

  const audienceColor =
    audienceQuality === "Elite"
      ? "text-accent-primary bg-accent-primary/10 border-accent-primary/30"
      : audienceQuality === "Excellent"
      ? "text-accent-secondary bg-accent-secondary/10 border-accent-secondary/30"
      : "text-foreground-secondary bg-surface-2 border-border-default"

  return (
    <section className="px-6 mt-8">
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-4 h-4 text-accent-primary" />
        <h2 className="text-xs font-mono uppercase tracking-widest text-accent-primary">
          Social Media Deep Dive
        </h2>
      </div>

      {/* 4 platform cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformCard
          name="Instagram"
          icon={<Instagram className="w-4 h-4" />}
          accentColor="#E4405F"
          primaryStat={{
            label: "Followers",
            value: social.instagram.followers,
            sublabel: social.instagram.engagementRate
              ? `${social.instagram.engagementRate} engagement · ${social.instagram.engagementLabel}`
              : undefined,
          }}
          stats={[
            { label: "Avg likes", value: social.instagram.avgLikes },
            { label: "Avg comments", value: social.instagram.avgComments },
          ]}
        />
        <PlatformCard
          name="TikTok"
          icon={<TikTokIcon className="w-4 h-4" />}
          accentColor="#FF0050"
          primaryStat={{ label: "Followers", value: social.tiktok.followers }}
          stats={[{ label: "Avg views", value: social.tiktok.avgViews }, { label: "", value: null }]}
        />
        <PlatformCard
          name="X (Twitter)"
          icon={<XIcon className="w-4 h-4" />}
          accentColor="#ffffff"
          primaryStat={{ label: "Followers", value: social.x.followers }}
          stats={[{ label: "", value: null }, { label: "", value: null }]}
        />
        <PlatformCard
          name="YouTube"
          icon={<Youtube className="w-4 h-4" />}
          accentColor="#FF0000"
          primaryStat={{ label: "Subscribers", value: social.youtube.subscribers }}
          stats={[{ label: "Avg views", value: social.youtube.avgViews }, { label: "", value: null }]}
        />
      </div>

      {/* Content + Audience Quality row */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="col-span-2 rounded-xl border border-border-default bg-surface-1 p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-foreground-tertiary" />
            Content
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary mb-1">
                Posting frequency
              </div>
              <div className="font-mono text-2xl font-bold">
                {content.postingFrequency ?? <span className="text-foreground-tertiary">—</span>}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary mb-1">
                Avg video views
              </div>
              <div className="font-mono text-2xl font-bold">
                {content.avgVideoViews ?? <span className="text-foreground-tertiary">—</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border-default bg-surface-1 p-5">
          <h3 className="text-sm font-semibold mb-2">Audience Quality</h3>
          <div className="text-[10px] font-mono uppercase tracking-wider text-foreground-tertiary mb-3">
            Engagement vs follower base
          </div>
          {audienceQuality ? (
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-lg border font-mono text-sm font-bold uppercase tracking-wider ${audienceColor}`}
            >
              {audienceQuality}
            </div>
          ) : (
            <span className="text-sm text-foreground-tertiary">—</span>
          )}
        </div>
      </div>
    </section>
  )
}
