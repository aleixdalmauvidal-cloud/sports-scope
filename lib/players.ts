import { cache } from "react";
import {
  leagueMatchesFilter,
  positionMatchesFilter,
  type LeagueFilterValue,
  type PositionFilterValue,
} from "@/lib/rankings-filters";
import { getSupabase } from "@/lib/supabase";
import { computeOpportunityScore } from "@/lib/v0-player";
import type {
  CmvScoreWithAthleteClub,
  PlayerDirectoryRow,
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
    api_football_id: num(row.api_football_id) ?? undefined,
    market_value_millions: marketMillions,
    minutes_played: num(row.minutes_played) ?? 0,
    goals: num(row.goals) ?? 0,
    assists: num(row.assists) ?? 0,
    matches_played: num(row.matches_played) ?? undefined,
    pass_accuracy: num(row.pass_accuracy) ?? undefined,
    rating: num(row.form_rating ?? row.rating),
  };
}

function normalizeSocialMetrics(row: Record<string, unknown> | null): SocialMetricsRow | null {
  if (!row || typeof row.athlete_id !== "string") return null;
  return {
    athlete_id: row.athlete_id,
    date: row.date != null ? String(row.date) : null,
    ig_followers: num(row.ig_followers ?? row.instagram_followers ?? row.instagram),
    tt_followers: num(row.tt_followers ?? row.tiktok_followers ?? row.tiktok),
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

export async function getTopPlayersByCmv(limit = 100): Promise<PlayerRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("cmv_scores")
    .select(cmvSelectWithJoins)
    .eq("athletes.is_active", true)
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

const CMV_FULL_SCAN_BATCH = 4000;
const CMV_FULL_SCAN_ROW_CAP = 120_000;

const ABBREV_TO_POSITION: Record<"FW" | "MF" | "DF" | "GK", PositionFilterValue> = {
  FW: "Forward",
  MF: "Midfielder",
  DF: "Defender",
  GK: "Goalkeeper",
};

export type PlayersDirectoryPositionAbbrev = "All" | "FW" | "MF" | "DF" | "GK";

export type PlayersDirectoryCmvRange = "all" | "60plus" | "40-60" | "20-40" | "under20";

export type PlayersDirectorySort = "cmv" | "sports" | "social" | "momentum";

export interface GetPlayersWithFiltersOptions {
  search?: string;
  league?: LeagueFilterValue;
  position?: PlayersDirectoryPositionAbbrev;
  cmvRange?: PlayersDirectoryCmvRange;
  sort?: PlayersDirectorySort;
  page?: number;
  pageSize?: number;
}

export interface GetPlayersWithFiltersResult {
  players: PlayerDirectoryRow[];
  totalCount: number;
  /** Página efectiva (acotada si `page` en URL era mayor que el total). */
  page: number;
}

export interface PlayerDatabaseStats {
  playerCount: number;
  leagueCount: number;
  clubCount: number;
}

async function loadAllLatestCmvPlayerRows(): Promise<PlayerRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { count: athleteCount } = await supabase
    .from("athletes")
    .select("*", { count: "exact", head: true });

  const target = athleteCount ?? 0;
  const seen = new Map<string, CmvScoreWithAthleteClub>();
  let offset = 0;

  while (offset < CMV_FULL_SCAN_ROW_CAP) {
    const { data, error } = await supabase
      .from("cmv_scores")
      .select(cmvSelectWithJoins)
      .eq("athletes.is_active", true)
      .order("date", { ascending: false })
      .range(offset, offset + CMV_FULL_SCAN_BATCH - 1);

    if (error) {
      console.error("loadAllLatestCmvPlayerRows:", error.message);
      break;
    }
    if (!data?.length) break;

    let added = 0;
    for (const row of data as CmvScoreWithAthleteClub[]) {
      const aid = row.athlete_id ?? row.athletes?.id;
      if (!aid || !row.athletes) continue;
      if (!seen.has(aid)) {
        seen.set(aid, row);
        added++;
      }
    }

    if (data.length < CMV_FULL_SCAN_BATCH) break;
    if (added === 0) break;

    offset += data.length;
    if (target > 0 && seen.size >= target) break;
  }

  return [...seen.values()].map(mapCmvJoinToPlayer);
}

const getCachedLatestPlayerRows = cache(async (): Promise<PlayerRow[]> => {
  return loadAllLatestCmvPlayerRows();
});

function matchesDirectoryCmvRange(cmv: number, range: PlayersDirectoryCmvRange): boolean {
  switch (range) {
    case "all":
      return true;
    case "60plus":
      return cmv >= 60;
    case "40-60":
      return cmv >= 40 && cmv < 60;
    case "20-40":
      return cmv >= 20 && cmv < 40;
    case "under20":
      return cmv < 20;
    default:
      return true;
  }
}

function rowMatchesDirectorySearch(row: PlayerRow, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    row.name.toLowerCase().includes(q) ||
    row.club.toLowerCase().includes(q) ||
    String(Math.round(row.cmv_total)).includes(q)
  );
}

function sortDirectoryRows(
  rows: PlayerDirectoryRow[],
  sort: PlayersDirectorySort
): PlayerDirectoryRow[] {
  const arr = [...rows];
  switch (sort) {
    case "cmv":
      arr.sort((a, b) => scoreFromRow(b.cmv_total) - scoreFromRow(a.cmv_total));
      break;
    case "sports":
      arr.sort((a, b) => scoreFromRow(b.sports_score) - scoreFromRow(a.sports_score));
      break;
    case "social":
      arr.sort((a, b) => scoreFromRow(b.social_score) - scoreFromRow(a.social_score));
      break;
    case "momentum":
      arr.sort((a, b) => scoreFromRow(b.momentum_score) - scoreFromRow(a.momentum_score));
      break;
    default:
      break;
  }
  return arr;
}

/**
 * Último snapshot CMV por jugador (mismo criterio que el ranking), con filtros y paginación.
 * Pensado para `/players`: un único barrido por request (React `cache`).
 */
export async function getPlayersWithFilters(
  options: GetPlayersWithFiltersOptions = {}
): Promise<GetPlayersWithFiltersResult> {
  const {
    search = "",
    league = "All",
    position = "All",
    cmvRange = "all",
    sort = "cmv",
    page = 1,
    pageSize = 50,
  } = options;

  const allRows = await getCachedLatestPlayerRows();
  const sortedByCmv = [...allRows].sort(
    (a, b) => scoreFromRow(b.cmv_total) - scoreFromRow(a.cmv_total)
  );

  const withRank: PlayerDirectoryRow[] = sortedByCmv.map((row, i) => {
    const sportsScore = scoreFromRow(row.sports_score);
    const socialScore = scoreFromRow(row.social_score);
    const commercialScore = scoreFromRow(row.commercial_score);
    const brandFitScore = scoreFromRow(row.brand_fit_score);
    const momentumScore = scoreFromRow(row.momentum_score);
    const adjustmentsScore = scoreFromRow(row.adjustment_score);
    return {
      ...row,
      cmv_rank: i + 1,
      opportunity_score: computeOpportunityScore({
        momentumScore,
        brandFitScore,
        adjustmentsScore,
        commercialScore,
      }),
    };
  });

  const filtered = withRank.filter((row) => {
    if (!rowMatchesDirectorySearch(row, search)) return false;
    if (!leagueMatchesFilter(row.league, league)) return false;
    if (position !== "All") {
      const posKey = position as keyof typeof ABBREV_TO_POSITION;
      if (!positionMatchesFilter(row.position, ABBREV_TO_POSITION[posKey])) return false;
    }
    if (!matchesDirectoryCmvRange(scoreFromRow(row.cmv_total), cmvRange)) return false;
    return true;
  });

  const sorted = sortDirectoryRows(filtered, sort);
  const totalCount = sorted.length;
  const ps = Math.min(100, Math.max(1, Math.floor(pageSize) || 50));
  const maxPage = Math.max(1, Math.ceil(totalCount / ps) || 1);
  const p = Math.min(Math.max(1, Math.floor(page) || 1), maxPage);
  const start = (p - 1) * ps;
  const players = sorted.slice(start, start + ps);

  return { players, totalCount, page: p };
}

export async function getPlayerDatabaseStats(): Promise<PlayerDatabaseStats> {
  const rows = await getCachedLatestPlayerRows();
  const leagues = new Set<string>();
  const clubs = new Set<string>();
  for (const r of rows) {
    if (r.league?.trim()) leagues.add(r.league.trim());
    if (r.club?.trim()) clubs.add(r.club.trim());
  }
  return {
    playerCount: rows.length,
    leagueCount: leagues.size,
    clubCount: clubs.size,
  };
}

/** Delta entre los dos `cmv_total` más recientes por jugador (aprox. variación reciente). */
export async function getCmvDeltaLatestTwoForAthletes(
  athleteIds: string[]
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (athleteIds.length === 0) return out;

  const supabase = getSupabase();
  if (!supabase) return out;

  const { data, error } = await supabase
    .from("cmv_scores")
    .select("athlete_id, cmv_total, date, athletes!inner(is_active)")
    .eq("athletes.is_active", true)
    .in("athlete_id", athleteIds);

  if (error) {
    console.error("getCmvDeltaLatestTwoForAthletes:", error.message);
    return out;
  }

  type Entry = { total: number; date: string };
  type CmvDeltaRow = {
    athlete_id: string;
    cmv_total: unknown;
    date: unknown;
    athletes?: { is_active: boolean } | null;
  };
  const byId = new Map<string, Entry[]>();
  for (const row of (data ?? []) as CmvDeltaRow[]) {
    const id = row.athlete_id;
    const list = byId.get(id) ?? [];
    list.push({
      total: scoreFromRow(row.cmv_total),
      date: String(row.date ?? ""),
    });
    byId.set(id, list);
  }

  for (const [id, list] of byId) {
    list.sort((a, b) => b.date.localeCompare(a.date));
    if (list.length >= 2) {
      const delta = list[0]!.total - list[1]!.total;
      out.set(id, Math.round(delta * 10) / 10);
    }
  }

  return out;
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
export type { PlayerDirectoryRow } from "@/types/database";
export {
  computeOpportunityScore,
  mapPlayerProfileToV0Player,
  mapPlayerRowsToV0Players,
  mapPlayerRowToV0Player,
  nationalityToFlagEmoji,
  opportunityScoreAccent,
} from "./v0-player";
