import { CMVHistoryChart } from "@/components/cmv-history-chart";
import type { Player } from "@/lib/players";
import type { PlayerProfile } from "@/types/database";
import {
  formatScore,
  formatInteger,
  formatFollowersCompact,
  formatPercentValue,
  formatFollowerGrowthAbsolute,
  formatFormRating,
} from "@/lib/format";

const breakdownItems = [
  { key: "sportsScore", label: "Sports", weight: "20%", color: "#38A047" },
  { key: "socialScore", label: "Social", weight: "35%", color: "#7A9490" },
  { key: "commercialScore", label: "Commercial", weight: "15%", color: "#C8D8D4" },
  { key: "brandFitScore", label: "Brand Fit", weight: "10%", color: "#4A5E58" },
  { key: "momentumScore", label: "Momentum", weight: "10%", color: "#2D9E50" },
  { key: "adjustmentsScore", label: "Adjustments", weight: "10%", color: "#2D7A3A" },
] as const;

interface Props {
  player: Player;
  profile: PlayerProfile;
}

export function PlayerProfileAnalysis({ player, profile }: Props) {
  const sports = profile.sports_metrics;
  const social = profile.social_metrics;

  const instagramFollowers = formatFollowersCompact(social?.ig_followers);
  const tiktokFollowers = formatFollowersCompact(social?.tt_followers);
  const passAccuracyDisplay =
    sports?.pass_accuracy != null && Number.isFinite(Number(sports.pass_accuracy))
      ? `${formatInteger(Number(sports.pass_accuracy))}%`
      : "—";

  return (
    <>
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
    </>
  );
}
