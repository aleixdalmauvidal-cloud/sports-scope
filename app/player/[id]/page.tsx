import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowLeftRight, TrendingUp, TrendingDown } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { CMVHistoryChart } from "@/components/cmv-history-chart"
import { getPlayerProfile, mapPlayerProfileToV0Player, opportunityScoreAccent } from "@/lib/players"
import {
  formatScore,
  formatInteger,
  formatFollowersCompact,
  formatPercentValue,
  formatFollowerGrowthAbsolute,
  formatFormRating,
} from "@/lib/format"

interface PlayerPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PlayerPageProps) {
  const { id } = await params
  const profile = await getPlayerProfile(id)

  if (!profile) {
    return { title: "Player Not Found | Sports Scope" }
  }

  return {
    title: `${profile.name} | CMV ${formatScore(profile.cmv_total)} | Sports Scope`,
    description: `${profile.name} commercial market value profile. CMV Score: ${formatScore(profile.cmv_total)}/100. ${profile.club} | ${profile.position}`,
  }
}



const breakdownItems = [
  { key: "sportsScore", label: "Sports", weight: "20%", color: "#38A047" },
  { key: "socialScore", label: "Social", weight: "35%", color: "#7A9490" },
  { key: "commercialScore", label: "Commercial", weight: "15%", color: "#C8D8D4" },
  { key: "brandFitScore", label: "Brand Fit", weight: "10%", color: "#4A5E58" },
  { key: "momentumScore", label: "Momentum", weight: "10%", color: "#2D9E50" },
  { key: "adjustmentsScore", label: "Adjustments", weight: "10%", color: "#2D7A3A" },
] as const;

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params
  const profile = await getPlayerProfile(id)

  if (!profile) {
    notFound()
  }

  const player = mapPlayerProfileToV0Player(profile)

  const isPositiveChange = player.weeklyChange >= 0
  const rankWatermark = profile.cmv_rank ?? player.rank
  const initials = player.name.split(" ").map((n) => n[0]).join("")
  const sports = profile.sports_metrics
  const social = profile.social_metrics

  const instagramFollowers = formatFollowersCompact(social?.instagram_followers)
  const tiktokFollowers = formatFollowersCompact(social?.tiktok_followers)
  const passAccuracyDisplay =
    sports?.pass_accuracy != null && Number.isFinite(Number(sports.pass_accuracy))
      ? `${formatInteger(Number(sports.pass_accuracy))}%`
      : "—"

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-20 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(260px,280px)_1fr]">
            <section className="relative h-[360px] min-w-[260px] w-full overflow-hidden rounded-[12px] border border-border" style={{ background: player.photoGradient }}>
              <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" viewBox="0 0 100 100" preserveAspectRatio="none">
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={i * 20} x2="100" y2={i * 20} stroke="white" strokeWidth="0.6" />
                ))}
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="100" stroke="white" strokeWidth="0.6" />
                ))}
              </svg>
              <svg className="pointer-events-none absolute inset-0 m-auto h-44 w-44 opacity-[0.06]" viewBox="0 0 100 100">
                <circle cx="50" cy="26" r="8" fill="white" />
                <rect x="43" y="35" width="14" height="26" rx="6" fill="white" />
                <line x1="44" y1="46" x2="29" y2="54" stroke="white" strokeWidth="5" strokeLinecap="round" />
                <line x1="56" y1="46" x2="71" y2="52" stroke="white" strokeWidth="5" strokeLinecap="round" />
                <line x1="48" y1="62" x2="40" y2="81" stroke="white" strokeWidth="5" strokeLinecap="round" />
                <line x1="52" y1="62" x2="67" y2="78" stroke="white" strokeWidth="5" strokeLinecap="round" />
              </svg>
              <span
                className="pointer-events-none absolute bottom-2 right-3 font-display text-[180px] font-extrabold leading-none text-white"
                style={{ opacity: 0.04 }}
              >
                {rankWatermark}
              </span>
              <Link href="/" className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-border bg-black/35 px-3 py-1.5 text-xs text-[#C8D8D4]">
                <ArrowLeft className="h-3.5 w-3.5" /> Rankings
              </Link>
              <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
                <span className="rounded-full border border-border bg-black/35 px-2.5 py-1 text-[11px] text-[#C8D8D4]">
                  {player.flag} {player.nationality}
                </span>
                {player.calledUp ? (
                  <span className="rounded-full border border-[#2D9E50]/30 bg-[#2D9E50]/15 px-2.5 py-1 text-[11px] text-[#2D9E50]">
                    Called up
                  </span>
                ) : null}
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#38A047] bg-[rgba(45,122,58,0.15)] text-2xl font-display font-bold text-[#E8F5EA]">
                {initials}
              </div>
              <span className="absolute bottom-3 right-3 rounded-full border border-border bg-black/35 px-3 py-1 text-xs text-[#C8D8D4]">
                {player.position}
              </span>
            </section>

            <section className="flex min-h-[360px] flex-col justify-between gap-6">
              <div className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#38A047]">
                      {player.club} · {player.league ?? "Football"}
                    </p>
                    <h1 className="font-display text-[38px] font-bold leading-none tracking-[-0.03em] text-white">
                      {player.name}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-[#7A9490]">Age {player.age || "—"}</span>
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-[#7A9490]">Market Value {player.marketValue}</span>
                      <span className="rounded-full border border-[#38A047]/40 bg-[#38A047]/10 px-3 py-1 text-xs text-[#38A047]">Top 100 CMV</span>
                    </div>
                  </div>
                  <Link
                    href={`/compare?with=${id}`}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[rgba(45,122,58,0.04)] hover:border-[rgba(56,160,71,0.22)]"
                  >
                    <ArrowLeftRight className="h-4 w-4 text-[#38A047]" />
                    Compare with another player
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
                  <div className="rounded-[10px] border border-border bg-card p-5">
                    <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.16em] text-[#38A047]">Commercial Market Value</p>
                    <p className="font-display text-[72px] font-extrabold leading-none text-[#38A047]">
                      {player.cmvScore}
                    </p>
                    <div className={`mt-2 flex items-center gap-1 text-sm ${isPositiveChange ? "text-[#2D9E50]" : "text-[#D94F4F]"}`}>
                      {player.weeklyChange !== 0 && (isPositiveChange ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />)}
                      <span>
                        {isPositiveChange ? "+" : ""}
                        {player.weeklyChange.toFixed(1)} vs last week
                      </span>
                    </div>
                  </div>
                  <div className="rounded-[10px] border border-[rgba(56,160,71,0.22)] bg-card p-5">
                    <p className="section-title mb-2">Opportunity Score</p>
                    <p className="font-display text-[32px] font-bold" style={{ color: opportunityScoreAccent(player.opportunityScore) }}>
                      {player.opportunityScore}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-[10px] border border-border bg-card p-4">
                  <p className="font-display text-[22px] font-bold text-white">{formatInteger(sports?.goals ?? null)}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#4A5E58]">Goals</p>
                </div>
                <div className="rounded-[10px] border border-border bg-card p-4">
                  <p className="font-display text-[22px] font-bold text-white">{formatInteger(sports?.assists ?? null)}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#4A5E58]">Assists</p>
                </div>
                <div className="rounded-[10px] border border-border bg-card p-4">
                  <p className="font-display text-[22px] font-bold text-white">{formatInteger(sports?.matches_played ?? null)}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#4A5E58]">Apps</p>
                </div>
                <div className="rounded-[10px] border border-border bg-card p-4">
                  <p className="font-display text-[22px] font-bold text-white">{formatInteger(sports?.minutes_played ?? null)}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#4A5E58]">Minutes</p>
                </div>
              </div>
            </section>
          </div>

          <section className="mb-8">
            <p className="section-title mb-3">CMV Breakdown</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {breakdownItems.map((item) => (
                <div
                  key={item.key}
                  className="rounded-[10px] border border-border bg-card p-4"
                  style={{ borderTop: `3px solid ${item.color}` }}
                >
                  <p className="font-display text-[28px] font-bold leading-none" style={{ color: item.color }}>
                    {formatScore(player[item.key])}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[#4A5E58]">{item.label}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#2E3D38]">Weight {item.weight}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[10px] border border-border bg-card p-5">
              <p className="section-title mb-4">Social</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-[#7A9490]">Instagram</p>
                  <p className="font-display text-xl text-white">{instagramFollowers}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-[#7A9490]">TikTok</p>
                  <p className="font-display text-xl text-white">{tiktokFollowers}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-[#7A9490]">Engagement</p>
                  <p className="font-display text-xl text-white">{formatPercentValue(social?.engagement_rate)}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-[#7A9490]">Growth 30d</p>
                  <p className="font-display text-xl text-white">{formatFollowerGrowthAbsolute(social?.followers_growth_30d)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[10px] border border-border bg-card p-5">
              <p className="section-title mb-4">Sports</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-[#7A9490]">Minutes</p>
                  <p className="font-display text-xl text-white">{formatInteger(sports?.minutes_played ?? null)}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-[#7A9490]">Form rating</p>
                  <p className="font-display text-xl text-white">{formatFormRating(sports?.rating ?? null)}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-[#7A9490]">Pass Accuracy</p>
                  <p className="font-display text-xl text-white">{passAccuracyDisplay}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-[#7A9490]">Matches</p>
                  <p className="font-display text-xl text-white">{formatInteger(sports?.matches_played ?? null)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <p className="section-title mb-3">CMV History (90 Days)</p>
            <div className="rounded-[10px] border border-border bg-card p-6">
              <CMVHistoryChart data={player.cmvHistory} />
            </div>
          </section>

          <section className="mb-8">
            <p className="section-title mb-3">Brand Verticals</p>
            <div className="flex flex-wrap gap-2">
              {(player.brandVerticals.length > 0 ? player.brandVerticals : ["Performance", "Lifestyle", "Tech"]).map((vertical) => (
                <span key={vertical} className="rounded-full border border-[#38A047]/30 bg-[#38A047]/15 px-3 py-1.5 text-xs text-[#E8F5EA]">
                  {vertical}
                </span>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
