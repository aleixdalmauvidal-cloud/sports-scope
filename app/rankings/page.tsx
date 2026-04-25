import { RankingDashboard } from "@/components/ranking/RankingDashboard";
import type { PlayerRow } from "@/types/database";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const CMV_RANKING_FETCH_CAP = 3000;

function toNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export default async function RankingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("cmv_scores")
    .select(
      "athlete_id,sports_score,social_score,commercial_score,brand_fit_score,momentum_score,adjustment_score,cmv_total,date,athletes!inner(id,name,position,nationality,photo_url,clubs!inner(name,league))"
    )
    .eq("athletes.is_active", true)
    .order("date", { ascending: false })
    .limit(CMV_RANKING_FETCH_CAP);

  const seen = new Set<string>();
  const latestRows: PlayerRow[] = [];

  for (const row of (data ?? []) as any[]) {
    const athlete = row.athletes;
    const athleteId = row.athlete_id ?? athlete?.id;
    if (!athleteId || seen.has(athleteId)) continue;
    seen.add(athleteId);
    latestRows.push({
      id: athlete.id,
      name: athlete.name,
      club: athlete.clubs?.name ?? "",
      league: athlete.clubs?.league ?? null,
      position: athlete.position ?? "",
      sports_score: toNumber(row.sports_score),
      social_score: toNumber(row.social_score),
      commercial_score: toNumber(row.commercial_score),
      brand_fit_score: toNumber(row.brand_fit_score),
      momentum_score: toNumber(row.momentum_score),
      adjustment_score: toNumber(row.adjustment_score),
      cmv_total: toNumber(row.cmv_total),
      nationality: athlete.nationality ?? null,
      photo_url: athlete.photo_url ?? null,
    });
  }

  latestRows.sort((a, b) => b.cmv_total - a.cmv_total);
  return <RankingDashboard players={latestRows.slice(0, 100)} />;
}
