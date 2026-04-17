/**
 * Compute CMV subscores from sports_metrics + social_metrics and insert cmv_scores
 * for athletes that have sports data but no cmv_scores row yet.
 * With `--force`, recalculates every athlete that has sports_metrics (ignores existing CMV).
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run calc:cmv
 *      npx tsx scripts/calculate-cmv.ts --force
 *
 * Apply migration: supabase/migrations/20260413140000_cmv_scores_score_version.sql
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

dotenv.config({ path: ".env.local" });

const SCORE_VERSION = "v1";
const BATCH_SIZE = 50;
const PAGE_SIZE = 1000;

const DEFAULT_SOCIAL = 20;
const DEFAULT_COMMERCIAL = 15;
const DEFAULT_BRAND_FIT = 20;
const DEFAULT_MOMENTUM = 25;
const DEFAULT_ADJUSTMENT = 80;

const W_SPORTS_RATING = 0.4;
const W_SPORTS_MINUTES_PCT = 0.3;
const W_SPORTS_GA90_PCT = 0.3;

const W_CMV_SPORTS = 0.25;
const W_CMV_SOCIAL = 0.3;
const W_CMV_COMMERCIAL = 0.15;
const W_CMV_BRAND = 0.1;
const W_CMV_MOMENTUM = 0.1;
const W_CMV_ADJUSTMENT = 0.1;

type SportsRow = Database["public"]["Tables"]["sports_metrics"]["Row"];
type SocialRow = Database["public"]["Tables"]["social_metrics"]["Row"];
type AthleteRow = Database["public"]["Tables"]["athletes"]["Row"];

function computeCommercialScore(cs: any): number {
  if (!cs) return DEFAULT_COMMERCIAL;
  const brandedPostsScore =
    Math.min(100, ((cs.branded_posts_count ?? 0) / 20) * 100) * 0.4;
  const uniqueBrandsScore =
    Math.min(100, ((cs.unique_brands_count ?? 0) / 10) * 100) * 0.25;
  const verticalDiversityScore =
    Math.min(100, (((cs.brand_verticals?.length ?? 0) as number) / 6) * 100) * 0.2;
  const densityScore =
    Math.min(100, (cs.sponsorship_density ?? 0) * 100) * 0.15;
  return Math.round(
    clamp(
      brandedPostsScore + uniqueBrandsScore + verticalDiversityScore + densityScore,
      0,
      100
    )
  );
}

function computeBrandFitScore(bf: any): number {
  if (!bf) return DEFAULT_BRAND_FIT;
  return Math.round(
    clamp(
      (bf.lifestyle_score ?? 40) * 0.4 +
        (bf.fit_sportswear ?? 40) * 0.3 +
        (bf.fit_betting ?? 40) * 0.2 +
        (bf.brand_safety_score ?? 80) * 0.1,
      0,
      100
    )
  );
}

function readRequiredServiceRoleKey(): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!k) {
    console.error("[calc:cmv] SUPABASE_SERVICE_ROLE_KEY is not set in .env.local");
    process.exit(1);
  }
  return k;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Latest row per athlete_id by `date` (ISO string compare). */
function latestByAthleteId<T extends { athlete_id: string; date: string }>(rows: T[]): Map<string, T> {
  const m = new Map<string, T>();
  for (const r of rows) {
    const cur = m.get(r.athlete_id);
    if (!cur || r.date > cur.date) m.set(r.athlete_id, r);
  }
  return m;
}

/** Percentage of pool strictly below this value (0–100). */
function percentileStrictBelow(pool: number[], value: number): number {
  const vals = pool.filter((x) => Number.isFinite(x));
  if (vals.length === 0) return 50;
  let below = 0;
  for (const x of vals) {
    if (x < value) below++;
  }
  return (below / vals.length) * 100;
}

function goalsAssistsPer90(goals: number, assists: number, minutes: number): number {
  const m = Math.max(0, minutes);
  if (m < 1) return 0;
  return (goals + assists) / (m / 90);
}

function ratingTo100(rating: number | null | undefined): number {
  if (rating == null || !Number.isFinite(Number(rating))) return 50;
  return clamp((Number(rating) / 10) * 100, 0, 100);
}

function hasSocialSignal(s: SocialRow | undefined): boolean {
  if (!s) return false;
  const ig = Number(s.ig_followers ?? 0);
  const tt = Number(s.tt_followers ?? 0);
  const er = s.engagement_rate;
  if (ig + tt > 0) return true;
  if (er != null && Number.isFinite(Number(er)) && Number(er) > 0) return true;
  return false;
}

function computeMomentumScore(s: SocialRow | undefined, rating100: number): number {
  // Base por engagement_rate
  let engagementBase = DEFAULT_MOMENTUM;
  const erRaw = s?.engagement_rate;
  if (erRaw != null && Number.isFinite(Number(erRaw))) {
    const er = Number(erRaw);
    if (er > 8) engagementBase = 90;
    else if (er > 5) engagementBase = 75;
    else if (er > 3) engagementBase = 60;
    else if (er > 1.5) engagementBase = 45;
    else if (er > 0) engagementBase = 30;
    else engagementBase = DEFAULT_MOMENTUM;
  }

  // Componente de views ratio: avg_views / ig_followers
  let viewsBase = 35;
  if (s) {
    const ig = Number(s.ig_followers ?? 0);
    const avgViewsRaw =
      (s as any).avg_views_per_post ??
      (s as any).avg_views ??
      null;
    const avgViews =
      avgViewsRaw != null && Number.isFinite(Number(avgViewsRaw))
        ? Number(avgViewsRaw)
        : 0;
    if (ig > 0 && avgViews > 0) {
      const ratio = avgViews / ig;
      if (ratio > 0.15) viewsBase = 90;
      else if (ratio > 0.08) viewsBase = 70;
      else if (ratio > 0.03) viewsBase = 50;
      else viewsBase = 35;
    }
  }

  // Componente de forma deportiva (rating100)
  let formBase = 40;
  if (rating100 >= 80) formBase = 85;
  else if (rating100 >= 70) formBase = 70;
  else if (rating100 >= 60) formBase = 55;
  else formBase = 40;

  const combined =
    0.4 * engagementBase +
    0.35 * viewsBase +
    0.25 * formBase;

  return round2(clamp(combined, 0, 100));
}

function computeAdjustmentScore(s: SocialRow | undefined): number {
  let score = 100;

  const ig = Number(s?.ig_followers ?? 0);

  // Platform diversity — penalize only if athlete has very few platforms
  // NOTE: when X and YouTube are added, include them in platformCount array
  const igPresent = ig > 1_000;
  const ttFollowers = s?.tt_followers;
  const ttPresent =
    ttFollowers != null &&
    Number.isFinite(Number(ttFollowers)) &&
    Number(ttFollowers) > 1_000;
  const platformCount = [igPresent, ttPresent].filter(Boolean).length;
  if (platformCount === 0) score -= 15;
  else if (platformCount === 1) score -= 5;

  // Inactividad: posting_frequency bajo o nulo
  const pfRaw = (s as any)?.posting_frequency ?? null;
  const postingFrequency =
    pfRaw != null && Number.isFinite(Number(pfRaw))
      ? Number(pfRaw)
      : null;
  if (postingFrequency == null || postingFrequency < 0.1) {
    score -= 10;
  }

  // Cuentas infladas / premium según combinación de followers y engagement
  const erRaw = s?.engagement_rate;
  const er =
    erRaw != null && Number.isFinite(Number(erRaw))
      ? Number(erRaw)
      : null;
  if (er != null) {
    if (er < 0.5 && ig > 1_000_000) {
      score -= 15;
    }
    if (er > 5 && ig > 10_000_000) {
      score += 10;
    }
  }

  return clamp(score, 0, 100);
}

function socialScoreFromData(
  s: SocialRow,
  poolLogFollowers: number[],
  poolEngagement: number[]
): number {
  const ig = Number(s.ig_followers ?? 0);
  const tt = Number(s.tt_followers ?? 0);
  const total = ig + tt;
  const logF = Math.log10(1 + total);
  const folPct = percentileStrictBelow(poolLogFollowers, logF);

  const er = s.engagement_rate;
  if (er != null && Number.isFinite(Number(er)) && poolEngagement.length > 0) {
    const e = Number(er);
    const engPct = percentileStrictBelow(poolEngagement, e);
    return round2(clamp(0.55 * folPct + 0.45 * engPct, 0, 100));
  }
  return round2(clamp(folPct, 0, 100));
}

function computeAgeFromDob(dob: string | null | undefined, now: Date): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const years = (now.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (!Number.isFinite(years)) return null;
  return Math.floor(years);
}

function ageMultiplier(age: number | null): number {
  if (age == null) return 1.0;
  if (age >= 17 && age <= 21) return 1.15;
  if (age >= 22 && age <= 26) return 1.05;
  if (age >= 27 && age <= 29) return 1.0;
  if (age >= 30 && age <= 32) return 0.92;
  if (age >= 33) return 0.82;
  return 1.0;
}

function leagueMultiplier(league: string | null | undefined): number {
  if (!league) return 0.88;
  switch (league) {
    case "Premier League":
      return 1.0;
    case "LaLiga":
      return 0.97;
    case "Ligue 1":
      return 0.93;
    case "Serie A":
      return 0.93;
    case "Bundesliga":
      return 0.95;
    default:
      return 0.88;
  }
}

async function fetchAllRows<T>(
  supabase: ReturnType<typeof createClient<Database>>,
  table: "sports_metrics" | "social_metrics" | "cmv_scores",
  select: string
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order("date", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    const chunk = (data ?? []) as T[];
    out.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
  }
  return out;
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    console.error("[calc:cmv] Missing NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }

  const supabase = createClient<Database>(url, readRequiredServiceRoleKey());
  const now = new Date();
  const today = now.toISOString().split("T")[0]!;
  const force = process.argv.includes("--force");

  console.log("[calc:cmv] Loading sports_metrics…");
  const allSports = await fetchAllRows<SportsRow>(supabase, "sports_metrics", "*");
  const latestSports = latestByAthleteId(allSports);

  const minutesPool: number[] = [];
  const ga90Pool: number[] = [];
  for (const r of latestSports.values()) {
    const min = Number(r.minutes_played ?? 0);
    const g = Number(r.goals ?? 0);
    const a = Number(r.assists ?? 0);
    minutesPool.push(min);
    ga90Pool.push(goalsAssistsPer90(g, a, min));
  }

  console.log("[calc:cmv] Loading social_metrics…");
  const allSocial = await fetchAllRows<SocialRow>(supabase, "social_metrics", "*");
  const latestSocial = latestByAthleteId(allSocial);

  console.log("[calc:cmv] Loading athletes + clubs…");
  const athletesById = new Map<
    string,
    { ageYears: number | null; league: string | null }
  >();
  {
    const { data, error } = await supabase
      .from("athletes")
      .select("id, date_of_birth, clubs ( league )");
    if (error) {
      console.error("[calc:cmv] athletes join clubs:", error.message);
    } else {
      for (const row of (data ?? []) as (AthleteRow & {
        clubs: { league: string | null } | null;
      })[]) {
        const ageYears = computeAgeFromDob(row.date_of_birth as any, now);
        const league = row.clubs?.league ?? null;
        athletesById.set(row.id, { ageYears, league });
      }
    }
  }

  console.log("[calc:cmv] Loading campaign_signals + brand_fit (active athletes)…");
  const campaignMap = new Map<string, any>();
  const brandFitMap = new Map<string, any>();
  {
    const { data: activeAthletes, error: activeErr } = await supabase
      .from("athletes")
      .select("id")
      .eq("is_active", true);
    if (activeErr) {
      console.error("[calc:cmv] athletes (is_active):", activeErr.message);
    } else {
      const activeIds = (activeAthletes ?? [])
        .map((r: any) => String(r.id ?? ""))
        .filter(Boolean);

      const [{ data: csData, error: csErr }, { data: bfData, error: bfErr }] =
        await Promise.all([
          supabase
            // not in local Database types yet
            .from("campaign_signals" as any)
            .select("*")
            .in("athlete_id", activeIds)
            .order("date", { ascending: false }),
          supabase
            .from("brand_fit" as any)
            .select("*")
            .in("athlete_id", activeIds)
            .order("date", { ascending: false }),
        ]);

      if (csErr) console.error("[calc:cmv] campaign_signals:", csErr.message);
      if (bfErr) console.error("[calc:cmv] brand_fit:", bfErr.message);

      for (const row of (csData ?? []) as any[]) {
        const aid = String(row.athlete_id ?? "");
        if (!aid) continue;
        if (!campaignMap.has(aid)) campaignMap.set(aid, row);
      }

      for (const row of (bfData ?? []) as any[]) {
        const aid = String(row.athlete_id ?? "");
        if (!aid) continue;
        if (!brandFitMap.has(aid)) brandFitMap.set(aid, row);
      }
    }
  }

  const poolLogFollowers: number[] = [];
  const poolEngagement: number[] = [];
  for (const s of latestSocial.values()) {
    const ig = Number(s.ig_followers ?? 0);
    const tt = Number(s.tt_followers ?? 0);
    poolLogFollowers.push(Math.log10(1 + ig + tt));
    const er = s.engagement_rate;
    if (er != null && Number.isFinite(Number(er))) poolEngagement.push(Number(er));
  }

  let targets: string[];
  if (force) {
    targets = [...latestSports.keys()];
    console.log("[calc:cmv] --force: recalculating CMV for all athletes with sports_metrics");
    console.log(`[calc:cmv] Athletes with sports_metrics (full recompute): ${targets.length}`);
  } else {
    console.log("[calc:cmv] Loading existing cmv_scores athlete_ids…");
    const cmvRows = await fetchAllRows<{ athlete_id: string }>(supabase, "cmv_scores", "athlete_id");
    const hasCmv = new Set(cmvRows.map((r) => r.athlete_id));
    targets = [...latestSports.keys()].filter((id) => !hasCmv.has(id));
    console.log(`[calc:cmv] Athletes with sports_metrics, no CMV yet: ${targets.length}`);
  }

  if (targets.length === 0) {
    console.log("[calc:cmv] Nothing to do.");
    return;
  }

  const rowsToInsert: Database["public"]["Tables"]["cmv_scores"]["Insert"][] = [];
  let processed = 0;

  for (const athleteId of targets) {
    const sm = latestSports.get(athleteId)!;
    const rating100 = ratingTo100(sm.rating);
    const min = Number(sm.minutes_played ?? 0);
    const g = Number(sm.goals ?? 0);
    const a = Number(sm.assists ?? 0);
    const ga90 = goalsAssistsPer90(g, a, min);
    const minPct = percentileStrictBelow(minutesPool, min);
    const gaPct = percentileStrictBelow(ga90Pool, ga90);
    const base_sports_score = round2(
      clamp(
        W_SPORTS_RATING * rating100 +
          W_SPORTS_MINUTES_PCT * minPct +
          W_SPORTS_GA90_PCT * gaPct,
        0,
        100
      )
    );

    const athleteMeta = athletesById.get(athleteId) ?? { ageYears: null, league: null };
    const ageMult = ageMultiplier(athleteMeta.ageYears);
    const leagueMult = leagueMultiplier(athleteMeta.league);
    const sports_score = round2(
      clamp(base_sports_score * ageMult * leagueMult, 0, 100)
    );

    const socRow = latestSocial.get(athleteId);
    let social_score: number;
    if (hasSocialSignal(socRow)) {
      social_score = socialScoreFromData(socRow!, poolLogFollowers, poolEngagement);
    } else {
      social_score = DEFAULT_SOCIAL;
    }

    const commercial_score = computeCommercialScore(campaignMap.get(athleteId));
    const brand_fit_score = computeBrandFitScore(brandFitMap.get(athleteId));
    const momentum_score = computeMomentumScore(socRow, rating100);
    const adjustment_score = computeAdjustmentScore(socRow);

    const cmv_total = round2(
      clamp(
        sports_score * W_CMV_SPORTS +
          social_score * W_CMV_SOCIAL +
          commercial_score * W_CMV_COMMERCIAL +
          brand_fit_score * W_CMV_BRAND +
          momentum_score * W_CMV_MOMENTUM +
          adjustment_score * W_CMV_ADJUSTMENT,
        0,
        100
      )
    );

    rowsToInsert.push({
      athlete_id: athleteId,
      date: today,
      sports_score,
      social_score,
      commercial_score,
      brand_fit_score,
      momentum_score,
      adjustment_score,
      cmv_total,
      score_version: SCORE_VERSION,
    });

    processed++;
    if (processed % 100 === 0) {
      console.log(`[calc:cmv] Prepared ${processed}/${targets.length} rows…`);
    }
  }

  console.log(`[calc:cmv] Inserting ${rowsToInsert.length} rows in batches of ${BATCH_SIZE}…`);
  let inserted = 0;
  for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
    const batch = rowsToInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("cmv_scores")
      .upsert(batch, { onConflict: "athlete_id,date" });
    if (error) {
      console.error(`[calc:cmv] Batch insert failed at offset ${i}: ${error.message}`);
      process.exit(1);
    }
    inserted += batch.length;
    if (inserted % 100 === 0 || inserted === rowsToInsert.length) {
      console.log(`[calc:cmv] Inserted ${inserted}/${rowsToInsert.length}`);
    }
  }

  console.log(
    `[calc:cmv] Done. score_version=${SCORE_VERSION} date=${today}${force ? " (force)" : ""}`
  );
}

main().catch((e) => {
  console.error("[calc:cmv] Fatal:", e);
  process.exit(1);
});
