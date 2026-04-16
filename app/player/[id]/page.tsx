import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowLeftRight, TrendingUp, TrendingDown } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { PlayerAnalysisLocked } from "@/components/player-analysis-locked"
import { PlayerProfileAnalysis } from "@/components/player-profile-analysis"
import { PlayerStatStrip } from "@/components/player-stat-strip"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getPlayerProfile, mapPlayerProfileToV0Player, opportunityScoreAccent } from "@/lib/players"
import { formatScore, formatFollowersCompact, formatPercentValue, formatInteger } from "@/lib/format"

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

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params
  const profile = await getPlayerProfile(id)

  if (!profile) {
    notFound()
  }

  let isAuthed = false
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase.auth.getUser()
    isAuthed = !!data.user
  } catch {
    isAuthed = false
  }

  const player = mapPlayerProfileToV0Player(profile)

  const isPositiveChange = player.weeklyChange >= 0
  const rankWatermark = profile.cmv_rank ?? player.rank
  const initials = player.name.split(" ").map((n) => n[0]).join("")

  const campaign = profile.campaign_signals
  const brandFit = profile.brand_fit_detail
  const social = profile.social_metrics
  const socialDetail = profile.social_metrics_detail
  const sports = profile.sports_metrics

  const display = (v: unknown): string => (v === null || v === undefined ? "—" : String(v))

  const barColor = (v: number | null | undefined): string => {
    if (v == null) return "bg-[#4B5563]"
    if (v > 70) return "bg-[#00ff87]"
    if (v >= 50) return "bg-[#FACC15]"
    return "bg-[#F97373]"
  }

  const safePercent = (v: number | null | undefined): string =>
    v == null ? "—" : `${v.toFixed(1)}%`

  const toNumber = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }

  const igFollowersNum = social?.ig_followers ?? null
  const engagementNum = social?.engagement_rate ?? null
  const lifestyleScore = brandFit?.lifestyle_score ?? null
  const fitSportswear = brandFit?.fit_sportswear ?? null
  const fitBetting = brandFit?.fit_betting ?? null
  const brandSafety = brandFit?.brand_safety_score ?? null

  const recommendedCampaigns: string[] = []
  if (lifestyleScore != null && lifestyleScore > 70) recommendedCampaigns.push("Brand Ambassador")
  if (igFollowersNum != null && igFollowersNum > 10_000_000) recommendedCampaigns.push("Social Activation")
  if (engagementNum != null && engagementNum > 5) recommendedCampaigns.push("Influencer Campaign")
  if (fitSportswear != null && fitSportswear > 80) recommendedCampaigns.push("Product Launch")
  if (brandSafety != null && brandSafety > 85) recommendedCampaigns.push("Premium Partnership")

  const uniqueRecommended = Array.from(new Set(recommendedCampaigns)).slice(0, 3)

  const audienceQuality = (() => {
    if (engagementNum == null) return "—"
    if (engagementNum > 8) return "Elite"
    if (engagementNum > 5) return "High"
    if (engagementNum > 2) return "Average"
    return "Low"
  })()

  const leagueBenchmarkLabel =
    engagementNum != null && engagementNum > 5 ? "Above average" : engagementNum != null ? "Average" : "—"

  const goals = sports?.goals ?? null
  const assists = sports?.assists ?? null
  const minutes = sports?.minutes_played ?? null
  const matches = sports?.matches_played ?? null
  const rating = sports?.rating ?? null
  const passAccuracy = sports?.pass_accuracy ?? null

  const per90 = (stat: number | null | undefined, min: number | null | undefined): string => {
    if (stat == null || min == null || !Number.isFinite(Number(stat)) || !Number.isFinite(Number(min)) || min <= 0) {
      return "—"
    }
    const val = (Number(stat) / Number(min)) * 90
    return val.toFixed(2)
  }

  const brandVerticals: string[] =
    (campaign?.brand_verticals ?? []).length === 0
      ? ["sportswear", "lifestyle", "tech"]
      : (campaign?.brand_verticals ?? []);

  const detectedBrands: string[] =
    (campaign?.brands_detected ?? []).length === 0
      ? ["Sportswear", "Lifestyle"]
      : (campaign?.brands_detected ?? []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-20 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(260px,280px)_1fr]">
            <section
              className="relative h-[360px] min-w-[260px] w-full overflow-hidden rounded-[12px] border border-border"
              style={{ background: player.photo_url ? "#0D1110" : player.photoGradient }}
            >
              {player.photo_url ? (
                <>
                  <img
                    src={player.photo_url}
                    alt=""
                    className="absolute inset-0 z-0 h-full w-full object-cover object-top"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#0D1110] via-[#0D1110]/45 to-transparent"
                  />
                </>
              ) : null}
              <svg className="pointer-events-none absolute inset-0 z-[2] h-full w-full opacity-[0.04]" viewBox="0 0 100 100" preserveAspectRatio="none">
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={i * 20} x2="100" y2={i * 20} stroke="white" strokeWidth="0.6" />
                ))}
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="100" stroke="white" strokeWidth="0.6" />
                ))}
              </svg>
              {!player.photo_url ? (
              <svg className="pointer-events-none absolute inset-0 z-[2] m-auto h-44 w-44 opacity-[0.06]" viewBox="0 0 100 100">
                <circle cx="50" cy="26" r="8" fill="white" />
                <rect x="43" y="35" width="14" height="26" rx="6" fill="white" />
                <line x1="44" y1="46" x2="29" y2="54" stroke="white" strokeWidth="5" strokeLinecap="round" />
                <line x1="56" y1="46" x2="71" y2="52" stroke="white" strokeWidth="5" strokeLinecap="round" />
                <line x1="48" y1="62" x2="40" y2="81" stroke="white" strokeWidth="5" strokeLinecap="round" />
                <line x1="52" y1="62" x2="67" y2="78" stroke="white" strokeWidth="5" strokeLinecap="round" />
              </svg>
              ) : null}
              <span
                className="pointer-events-none absolute bottom-2 right-3 z-[2] font-display text-[180px] font-extrabold leading-none text-white"
                style={{ opacity: 0.04 }}
              >
                {rankWatermark}
              </span>
              <Link href="/rankings" className="absolute left-3 top-3 z-[3] inline-flex items-center gap-1 rounded-full border border-border bg-black/35 px-3 py-1.5 text-xs text-[#C8D8D4]">
                <ArrowLeft className="h-3.5 w-3.5" /> Rankings
              </Link>
              <div className="absolute right-3 top-3 z-[3] flex flex-col items-end gap-2">
                <span className="rounded-full border border-border bg-black/35 px-2.5 py-1 text-[11px] text-[#C8D8D4]">
                  {player.flag} {player.nationality}
                </span>
                {player.calledUp ? (
                  <span className="rounded-full border border-[#2D9E50]/30 bg-[#2D9E50]/15 px-2.5 py-1 text-[11px] text-[#2D9E50]">
                    Called up
                  </span>
                ) : null}
              </div>
              {!player.photo_url ? (
              <div className="absolute left-1/2 top-1/2 z-[3] flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#38A047] bg-[rgba(45,122,58,0.15)] text-2xl font-display font-bold text-[#E8F5EA]">
                {initials}
              </div>
              ) : null}
              <span className="absolute bottom-3 right-3 z-[3] rounded-full border border-border bg-black/35 px-3 py-1 text-xs text-[#C8D8D4]">
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

              {isAuthed ? <PlayerStatStrip profile={profile} /> : null}
            </section>
          </div>

          {isAuthed ? (
            <PlayerProfileAnalysis player={player} profile={profile} />
          ) : (
            <PlayerAnalysisLocked />
          )}

          {/* COMMERCIAL INTELLIGENCE */}
          <section className="mt-10 rounded-xl border border-white/5 bg-[#0D0D14] p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  Commercial Intelligence
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                      Sponsored Content
                    </p>
                    <p className="mt-2 text-sm text-[#9CA3AF]">Branded posts / month</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {campaign?.branded_posts_count != null ? campaign.branded_posts_count : "—"}
                    </p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                      Sponsorship density
                    </p>
                    {campaign?.sponsorship_density != null ? (
                      <div className="mt-1">
                        <div className="mb-1 flex items-center justify-between text-xs text-[#9CA3AF]">
                          <span>{(campaign.sponsorship_density * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#111827]">
                          <div
                            className="h-2 rounded-full bg-[#00ff87]"
                            style={{ width: `${Math.min(100, campaign.sponsorship_density * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-[#9CA3AF]">—</p>
                    )}
                  </div>

                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                      Brand Verticals
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {brandVerticals.map((v) => {
                        const key = v.toLowerCase()
                        let color = "#6B7280"
                        if (key === "sportswear") color = "#3B82F6"
                        else if (key === "lifestyle") color = "#10B981"
                        else if (key === "tech") color = "#8B5CF6"
                        else if (key === "betting") color = "#F97316"
                        else if (key === "luxury") color = "#FACC15"
                        return (
                          <span
                            key={v}
                            className="rounded-full bg-[#111827] px-3 py-1 text-xs font-medium"
                            style={{ border: `1px solid ${color}55`, color }}
                          >
                            {v}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                      Detected Brand Categories
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {detectedBrands.map((b) => (
                        <span
                          key={b}
                          className="rounded-full border border-white/10 bg-[#111827] px-3 py-1 text-xs text-[#E5E7EB]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                      Recommended Campaigns
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(uniqueRecommended.length ? uniqueRecommended : ["Brand Ambassador"]).map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-[#00ff87]/40 bg-[#00ff87]/10 px-3 py-1 text-xs font-medium text-[#E5E7EB]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

          {/* BRAND FIT BREAKDOWN */}
          <section className="mt-8 rounded-xl border border-white/5 bg-[#0D0D14] p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  Brand Fit Breakdown
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Lifestyle Appeal", value: lifestyleScore },
                    { label: "Sportswear Fit", value: fitSportswear },
                    { label: "Betting Fit", value: fitBetting },
                    { label: "Brand Safety", value: brandSafety },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="uppercase tracking-[0.16em] text-[#6B7280]">
                          {item.label}
                        </span>
                        <span className="font-semibold text-white">
                          {item.value != null ? item.value : "—"}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#111827]">
                        <div
                          className={`h-2 rounded-full ${barColor(item.value)}`}
                          style={{
                            width: `${
                              item.value != null ? Math.min(100, Math.max(0, item.value)) : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

          {/* SOCIAL MEDIA DEEP DIVE */}
          <section className="mt-8 rounded-xl border border-white/5 bg-[#0D0D14] p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  Social Media Deep Dive
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Instagram */}
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                      Instagram
                    </p>
                    <p className="mt-2 text-sm text-[#9CA3AF]">Followers</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {igFollowersNum != null ? formatFollowersCompact(igFollowersNum) : "—"}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#9CA3AF]">Engagement rate</p>
                        <p className="text-sm font-semibold text-white">
                          {engagementNum != null ? formatPercentValue(engagementNum) : "—"}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#111827] px-2.5 py-1 text-xs text-[#10B981]">
                        {leagueBenchmarkLabel}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[#9CA3AF]">
                      <div>
                        <p className="text-xs text-[#6B7280]">Avg likes</p>
                        <p className="mt-1 text-white">
                          {socialDetail?.avg_likes != null
                            ? formatFollowersCompact(socialDetail.avg_likes)
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Avg comments</p>
                        <p className="mt-1 text-white">
                          {socialDetail?.avg_comments != null
                            ? formatFollowersCompact(socialDetail.avg_comments)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TikTok */}
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                      TikTok
                    </p>
                    <p className="mt-2 text-sm text-[#9CA3AF]">Followers</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {social?.tt_followers != null && social.tt_followers >= 10000
                        ? formatFollowersCompact(social.tt_followers)
                        : "—"}
                    </p>
                    <div className="mt-3">
                      <p className="text-xs text-[#6B7280]">Avg views</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {socialDetail?.tt_avg_views != null
                          ? formatInteger(socialDetail.tt_avg_views)
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                      Content
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-[#6B7280]">Posting frequency</p>
                        <p className="mt-1 font-semibold text-white">
                          {socialDetail?.posting_frequency != null
                            ? `${socialDetail.posting_frequency.toFixed(2)} posts/day`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Avg video views</p>
                        <p className="mt-1 font-semibold text-white">
                          {socialDetail?.avg_views != null
                            ? formatInteger(socialDetail.avg_views)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Audience Quality */}
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                      Audience Quality
                    </p>
                    <p className="mt-2 text-sm text-[#9CA3AF]">
                      Engagement vs follower base
                    </p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {audienceQuality}
                    </p>
                  </div>
                </div>
              </section>

          {/* SPORTS PERFORMANCE DETAIL */}
          <section className="mt-8 mb-8 rounded-xl border border-white/5 bg-[#0D0D14] p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                  Sports Performance Detail
                </p>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-[0.16em]">Goals</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {goals != null ? goals : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-[0.16em]">Assists</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {assists != null ? assists : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-[0.16em]">Apps</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {matches != null ? matches : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-[0.16em]">Minutes</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {minutes != null ? minutes : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-[0.16em]">
                      Form Rating
                    </p>
                    <p className="mt-1 text-sm text-[#9CA3AF]">0–10</p>
                    <div className="mt-2 h-2 rounded-full bg-[#111827]">
                      <div
                        className="h-2 rounded-full bg-[#00ff87]"
                        style={{
                          width: `${
                            rating != null
                              ? Math.min(100, Math.max(0, (Number(rating) / 10) * 100))
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {rating != null ? rating.toFixed(2) : "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-[0.16em]">
                      Pass Accuracy
                    </p>
                    <p className="mt-1 text-sm text-[#9CA3AF]">0–100%</p>
                    <div className="mt-2 h-2 rounded-full bg-[#111827]">
                      <div
                        className="h-2 rounded-full bg-[#00ff87]"
                        style={{
                          width: `${
                            passAccuracy != null
                              ? Math.min(100, Math.max(0, Number(passAccuracy)))
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {passAccuracy != null ? `${passAccuracy.toFixed(1)}%` : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-[0.16em]">
                      Goals per 90
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {per90(goals, minutes)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#12121A] p-4">
                    <p className="text-xs text-[#6B7280] uppercase tracking-[0.16em]">
                      Assists per 90
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {per90(assists, minutes)}
                    </p>
                  </div>
                  <div className="flex items-center justify-end rounded-lg bg-[#12121A] p-4">
                    <span className="rounded-full border border-white/10 bg-[#111827] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
                      2025/26
                    </span>
                  </div>
                </div>
              </section>
        </div>
      </main>
    </div>
  )
}
