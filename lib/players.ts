import { getSupabase } from "@/lib/supabase";
import type {
  CmvScoreWithAthleteClub,
  PlayerProfile,
  PlayerRow,
  SocialMetricsRow,
  SportsMetricsRow,
} from "@/types/database";

/** All CMV subscores + total (must match `cmv_scores` columns). */
const cmvSelectWithJoins = `
  athlete_id,
  sports_score,
  social_score,
  commercial_score,
  brand_fit_score,
  momentum_score,
  adjustment_score,
  cmv_total,
  date,
  athletes!inner (
    id,
    name,
    position,
    nationality,
    photo_url,
    clubs!inner (
      name,
      league
    )
  )
` as const;

function scoreFromRow(v: unknown): number {
  if (v == null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapCmvJoinToPlayer(row: CmvScoreWithAthleteClub): PlayerRow {
  const a = row.athletes;
  const clubName = a.clubs?.name ?? "";
  return {
    id: a.id,
    name: a.name,
    club: clubName,
    league: a.clubs?.league ?? null,
    position: a.position,
    sports_score: scoreFromRow(row.sports_score),
    social_score: scoreFromRow(row.social_score),
    commercial_score: scoreFromRow(row.commercial_score),
    brand_fit_score: scoreFromRow(row.brand_fit_score),
    momentum_score: scoreFromRow(row.momentum_score),
    adjustment_score: scoreFromRow(row.adjustment_score),
    cmv_total: scoreFromRow(row.cmv_total),
    nationality: a.nationality,
    photo_url: a.photo_url ?? null,
  };
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeSportsMetrics(row: Record<string, unknown> | null): SportsMetricsRow | null {
  if (!row || typeof row.athlete_id !== "string") return null;
  let marketMillions: number | null = null;
  const marketEur = num(row.market_value);
  if (marketEur != null) {
    marketMillions = marketEur / 1_000_000;
  } else {
    marketMillions = num(row.market_value_millions);
    if (marketMillions == null && row.market_value_eur != null) {
      const eur = num(row.market_value_eur);
      if (eur != null) marketMillions = eur / 1_000_000;
    }
  }
  return {
    athlete_id: row.athlete_id,
    date: String(row.date ?? ""),
    season: num(row.season) ?? undefined,
    market_value_millions: marketMillions,
    minutes_played: num(row.minutes_played) ?? 0,
    goals: num(row.goals) ?? 0,
    assists: num(row.assists) ?? 0,
    rating: num(row.form_rating ?? row.rating),
  };
}

function normalizeSocialMetrics(row: Record<string, unknown> | null): SocialMetricsRow | null {
  if (!row || typeof row.athlete_id !== "string") return null;
  return {
    athlete_id: row.athlete_id,
    date: row.date != null ? String(row.date) : null,
    instagram_followers: num(row.ig_followers ?? row.instagram_followers ?? row.instagram),
    tiktok_followers: num(row.tt_followers ?? row.tiktok_followers ?? row.tiktok),
    engagement_rate: num(row.engagement_rate),
    avg_views_per_post: num(row.avg_views_per_post ?? row.avg_views),
    followers_growth_30d: num(row.follower_growth_30d ?? row.followers_growth_30d),
  };
}

/**
 * Perfil completo: athlete, último cmv_scores, último sports_metrics y social_metrics.
 */
export async function getPlayerProfile(id: string): Promise<PlayerProfile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const [athRes, cmvRes, sportRes, socialRes] = await Promise.all([
    supabase
      .from("athletes")
      .select("id, name, position, nationality, age, photo_url, clubs ( name, league )")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("cmv_scores")
      .select(
        "sports_score, social_score, commercial_score, brand_fit_score, momentum_score, adjustment_score, cmv_total"
      )
      .eq("athlete_id", id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("sports_metrics")
      .select("*")
      .eq("athlete_id", id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("social_metrics")
      .select("*")
      .eq("athlete_id", id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (athRes.error) {
    console.error("getPlayerProfile (athletes):", athRes.error.message);
  }
  if (cmvRes.error) {
    console.error("getPlayerProfile (cmv_scores):", cmvRes.error.message);
  }
  if (sportRes.error) {
    console.error("getPlayerProfile (sports_metrics):", sportRes.error.message);
  }
  if (socialRes.error) {
    console.error("getPlayerProfile (social_metrics):", socialRes.error.message);
  }

  if (!athRes.data) return null;

  const a = athRes.data as {
    id: string;
    name: string;
    position: string;
    nationality: string | null;
    age: number | null;
    photo_url: string | null;
    clubs: { name: string; league: string | null } | null;
  };

  const cmv = cmvRes.data as
    | {
        sports_score: number;
        social_score: number;
        commercial_score: number;
        brand_fit_score: number;
        momentum_score: number;
        adjustment_score: number;
        cmv_total: number;
      }
    | null;

  const cmv_rank = await getAthleteCmvRank(a.id, 500);

  return {
    id: a.id,
    name: a.name,
    club: a.clubs?.name ?? "—",
    league: a.clubs?.league ?? null,
    cmv_rank,
    position: a.position,
    nationality: a.nationality,
    age: a.age ?? null,
    photo_url: a.photo_url ?? null,
    sports_score: cmv ? Number(cmv.sports_score) : 0,
    social_score: cmv ? Number(cmv.social_score) : 0,
    commercial_score: cmv ? Number(cmv.commercial_score) : 0,
    brand_fit_score: cmv ? Number(cmv.brand_fit_score) : 0,
    momentum_score: cmv ? Number(cmv.momentum_score) : 0,
    adjustment_score: cmv ? Number(cmv.adjustment_score) : 0,
    cmv_total: cmv ? Number(cmv.cmv_total) : 0,
    sports_metrics: normalizeSportsMetrics(
      sportRes.data as Record<string, unknown> | null
    ),
    social_metrics: normalizeSocialMetrics(
      socialRes.data as Record<string, unknown> | null
    ),
  };
}

/**
 * Ranking por CMV usando la **fila más reciente** de cada jugador (`date` DESC), luego orden por `cmv_total`.
 * Así los subscores COM/BRD/MOM/ADJ coinciden con el último snapshot y no con filas antiguas en el top.
 */
const CMV_RANKING_FETCH_CAP = 3000;

export async function getTopPlayersByCmv(limit = 30): Promise<PlayerRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("cmv_scores")
    .select(cmvSelectWithJoins)
    .order("date", { ascending: false })
    .limit(CMV_RANKING_FETCH_CAP);

  if (error) {
    console.error("getTopPlayersByCmv:", error.message);
    return [];
  }

  const rows = (data ?? []) as CmvScoreWithAthleteClub[];
  const seen = new Set<string>();
  const latestPerAthlete: CmvScoreWithAthleteClub[] = [];
  for (const row of rows) {
    const aid = row.athlete_id ?? row.athletes.id;
    if (seen.has(aid)) continue;
    seen.add(aid);
    latestPerAthlete.push(row);
  }

  latestPerAthlete.sort((a, b) => scoreFromRow(b.cmv_total) - scoreFromRow(a.cmv_total));
  return latestPerAthlete.slice(0, limit).map(mapCmvJoinToPlayer);
}

/** Posición en ranking según el orden de `getTopPlayersByCmv` (máx. `limit` jugadores). */
export async function getAthleteCmvRank(
  athleteId: string,
  limit = 500
): Promise<number | null> {
  const list = await getTopPlayersByCmv(limit);
  const i = list.findIndex((p) => p.id === athleteId);
  return i === -1 ? null : i + 1;
}

export async function getPlayerById(id: string): Promise<PlayerRow | null> {
  const profile = await getPlayerProfile(id);
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    club: profile.club,
    league: profile.league,
    position: profile.position,
    sports_score: profile.sports_score,
    social_score: profile.social_score,
    commercial_score: profile.commercial_score,
    brand_fit_score: profile.brand_fit_score,
    momentum_score: profile.momentum_score,
    adjustment_score: profile.adjustment_score,
    cmv_total: profile.cmv_total,
    nationality: profile.nationality,
    age: profile.age,
    photo_url: profile.photo_url,
  };
}

export type { Player } from "./v0-player";
export {
  computeOpportunityScore,
  mapPlayerProfileToV0Player,
  mapPlayerRowsToV0Players,
  mapPlayerRowToV0Player,
  nationalityToFlagEmoji,
  opportunityScoreAccent,
} from "./v0-player";
