/**
 * Compute CMV subscores from sports_metrics + social_metrics and upsert cmv_scores.
 * With `--force`, recalculates every athlete that has sports_metrics (ignores existing CMV).
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run calc:cmv
 *      npx tsx scripts/calculate-cmv.ts --force
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { requiredEnv } from "./lib/env";

dotenv.config({ path: ".env.local" });

const SCORE_VERSION = "v5.0";
const BATCH_SIZE = 50;
const PAGE_SIZE = 1000;

const DEFAULT_COMMERCIAL = 15;

const W_CMV_SOCIAL = 0.4;
const W_CMV_SPORTS = 0.3;
const W_CMV_COMMERCIAL = 0.15;
const W_CMV_MOMENTUM = 0.1;
const W_CMV_BRAND_SAFETY = 0.05;

type SportsRow = Database["public"]["Tables"]["sports_metrics"]["Row"];
type SocialRow = Database["public"]["Tables"]["social_metrics"]["Row"];
type AthleteRow = Database["public"]["Tables"]["athletes"]["Row"];
type CampaignSignalsRow = Database["public"]["Tables"]["campaign_signals"]["Row"];
type CmvHistoryInsert = Database["public"]["Tables"]["cmv_history"]["Insert"];
type AthleteMetaRow = Pick<AthleteRow, "id" | "date_of_birth" | "position"> & {
  clubs: { league: string | null } | null;
};

function computeCommercialScore(cs: any): number {
  if (!cs) return DEFAULT_COMMERCIAL;

  const brandedPostsRaw = Number(cs.branded_posts_count ?? 0);
  const brandedPostsCount = Number.isFinite(brandedPostsRaw) ? brandedPostsRaw : 0;
  const brandsDetected = Array.isArray(cs.brands_detected)
    ? cs.brands_detected.filter((b: unknown) => typeof b === "string" && b.trim())
    : [];
  const verticals = Array.isArray(cs.brand_verticals)
    ? cs.brand_verticals.filter((v: unknown) => typeof v === "string" && v.trim())
    : [];

  let baseScore: number;
  if (brandedPostsCount > 0) {
    const brandedPostsScore = Math.min(100, (brandedPostsCount / 20) * 100) * 0.4;
    const uniqueBrandsScore =
      Math.min(100, ((cs.unique_brands_count ?? brandsDetected.length ?? 0) / 10) * 100) * 0.25;
    const verticalDiversityScore = Math.min(100, (verticals.length / 6) * 100) * 0.2;
    const densityScore =
      Math.min(100, (Number(cs.sponsorship_density ?? 0) || 0) * 100) * 0.15;
    baseScore = brandedPostsScore + uniqueBrandsScore + verticalDiversityScore + densityScore;
  } else {
    if (brandsDetected.length >= 7) baseScore = 80;
    else if (brandsDetected.length >= 4) baseScore = 60;
    else if (brandsDetected.length >= 1) baseScore = 40;
    else baseScore = DEFAULT_COMMERCIAL;
  }

  const uniqueVerticals = new Set(
    verticals.map((v: string) => v.trim().toLowerCase()).filter(Boolean)
  ).size;
  if (uniqueVerticals > 2) baseScore += 10;

  return Math.round(clamp(baseScore, 0, 100));
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** `isoDate` is `YYYY-MM-DD` (UTC calendar). Returns same format `days` earlier. */
function dateMinusCalendarDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - days);
  return dt.toISOString().slice(0, 10);
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

function logistic100(k: number, delta: number): number {
  return 100 / (1 + Math.exp(-k * delta));
}

function goalsAssistsPer90(goals: number, assists: number, minutes: number): number {
  const m = Math.max(0, minutes);
  if (m < 1) return 0;
  return (goals + assists) / (m / 90);
}

function getFollowerGrowth30d(s: SocialRow & Record<string, unknown>): number | null {
  const raw = s.follower_growth_30d ?? s.followers_growth_30d;
  if (raw == null || !Number.isFinite(Number(raw))) return null;
  return Number(raw);
}

function positionBucket(pos: string | null | undefined): "FW" | "MF" | "DF" | "GK" {
  const p = (pos ?? "").toUpperCase();
  if (/GOAL|GK|PORT|KEEP/.test(p)) return "GK";
  if (/DEF|CB|LB|RB|DF|LCB|RCB|WB/.test(p)) return "DF";
  if (/MID|MF|CM|DM|AM|WM|CAM|CDM|LM|RM/.test(p)) return "MF";
  return "FW";
}

function agePeak(bucket: "FW" | "MF" | "DF" | "GK"): number {
  switch (bucket) {
    case "GK":
      return 31;
    case "DF":
      return 29;
    case "MF":
      return 28;
    default:
      return 27;
  }
}

function competitionScore(league: string | null | undefined): number {
  if (!league) return 85;
  const L = league.toLowerCase();
  if (L.includes("premier")) return 100;
  if (L.includes("la liga") || L.includes("laliga")) return 97;
  if (L.includes("bundesliga")) return 95;
  if (L.includes("serie a")) return 93;
  if (L.includes("ligue 1") || L.includes("ligue1")) return 91;
  return 85;
}

/** Cap so no single platform holds more than 50% of raw follower total; then weighted sum. */
function cappedWeightedFollowers(ig: number, tt: number, yt: number, xf: number): number {
  let a = Math.max(0, ig);
  let b = Math.max(0, tt);
  let c = Math.max(0, yt);
  let d = Math.max(0, xf);
  for (let iter = 0; iter < 8; iter++) {
    const sum = a + b + c + d;
    if (sum <= 0) return 0;
    const maxv = Math.max(a, b, c, d);
    if (maxv <= sum * 0.5 + 1e-9) break;
    const half = sum * 0.5;
    if (a === maxv) a = half;
    else if (b === maxv) b = half;
    else if (c === maxv) c = half;
    else d = half;
  }
  return a * 0.4 + b * 0.3 + c * 0.2 + d * 0.1;
}

function platformConcentration(ig: number, tt: number, yt: number, xf: number): number {
  const sum = ig + tt + yt + xf;
  if (sum <= 0) return 0;
  return Math.max(ig, tt, yt, xf) / sum;
}

function computeAgeFromDob(dob: string | null | undefined, now: Date): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const years = (now.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (!Number.isFinite(years)) return null;
  return Math.floor(years);
}

function confidenceScore(args: {
  ig_followers: number | null | undefined;
  engagement_rate: number | null | undefined;
  rating: number | null | undefined;
  goals: number | null | undefined;
  minutes_played: number | null | undefined;
}): number {
  const signals: boolean[] = [
    args.ig_followers != null &&
      Number.isFinite(Number(args.ig_followers)) &&
      Number(args.ig_followers) > 0,
    args.engagement_rate != null && Number.isFinite(Number(args.engagement_rate)),
    args.rating != null && Number.isFinite(Number(args.rating)),
    args.goals != null && Number.isFinite(Number(args.goals)),
    args.minutes_played != null && Number.isFinite(Number(args.minutes_played)),
  ];
  const present = signals.filter((x) => x).length;
  return clamp(0.6 + (present / 5) * 0.4, 0.6, 1.0);
}

function brandSafetyMultiplier(s: SocialRow | undefined): number {
  let m = 1.0;
  if (!s) return clamp(m, 0, 1);

  const ig = s.ig_followers != null && Number.isFinite(Number(s.ig_followers)) ? Number(s.ig_followers) : null;
  const tt = s.tt_followers != null && Number.isFinite(Number(s.tt_followers)) ? Number(s.tt_followers) : null;
  const xf = s.x_followers != null && Number.isFinite(Number(s.x_followers)) ? Number(s.x_followers) : null;
  const er =
    s.engagement_rate != null && Number.isFinite(Number(s.engagement_rate))
      ? Number(s.engagement_rate)
      : null;

  if (er != null && er < 0.3 && ig != null && ig > 1_000_000) m -= 0.15;
  if (tt == null && ig == null && xf == null) m -= 0.1;

  const igN = ig ?? 0;
  const ttN = tt ?? 0;
  const ytN =
    s.yt_subscribers != null && Number.isFinite(Number(s.yt_subscribers))
      ? Number(s.yt_subscribers)
      : 0;
  const xfN = xf ?? 0;
  if (platformConcentration(igN, ttN, ytN, xfN) > 0.85) m -= 0.05;

  return clamp(m, 0, 1);
}

async function fetchAllRows<T>(
  supabase: ReturnType<typeof createClient<Database>>,
  table: string,
  select: string
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const query = supabase
      .from(table as any)
      .select(select)
      .range(from, from + PAGE_SIZE - 1);
    const { data, error } = select === "*"
      ? await query.order("date", { ascending: false })
      : await query;
    if (error) throw new Error(`${table}: ${error.message}`);
    const chunk = (data ?? []) as T[];
    out.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
  }
  return out;
}

async function main(): Promise<void> {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient<Database>(url, serviceRoleKey);
  const now = new Date();
  const today = now.toISOString().split("T")[0]!;
  const force = process.argv.includes("--force");

  console.log("[calc:cmv] Loading latest_sports_metrics…");
  const latestSportsRows = await fetchAllRows<SportsRow>(
    supabase,
    "latest_sports_metrics",
    "*"
  );
  const latestSports = new Map(
    latestSportsRows
      .filter((r) => typeof r.athlete_id === "string" && r.athlete_id.length > 0)
      .map((r) => [r.athlete_id as string, r])
  );

  console.log("[calc:cmv] Loading latest_social_metrics…");
  const latestSocialRows = await fetchAllRows<SocialRow>(
    supabase,
    "latest_social_metrics",
    "*"
  );
  const latestSocial = new Map(
    latestSocialRows
      .filter((r) => typeof r.athlete_id === "string" && r.athlete_id.length > 0)
      .map((r) => [r.athlete_id as string, r])
  );

  /** Pools for social follower growth avg */
  const growthVals: number[] = [];
  for (const s of latestSocial.values()) {
    const g = getFollowerGrowth30d(s as SocialRow & Record<string, unknown>);
    if (g != null) growthVals.push(g);
  }
  const growthAvg =
    growthVals.length > 0 ? growthVals.reduce((a, b) => a + b, 0) / growthVals.length : 0;

  /** Virality ratio pool */
  const viralityPool: number[] = [];
  for (const s of latestSocial.values()) {
    const ig = Number(s.ig_followers ?? 0);
    const saves = s.avg_saves;
    if (ig > 0 && saves != null && Number.isFinite(Number(saves)) && Number(saves) >= 0) {
      viralityPool.push(Number(saves) / ig);
    }
  }
  const viralityAvg =
    viralityPool.length > 0
      ? viralityPool.reduce((a, b) => a + b, 0) / viralityPool.length
      : 0;

  /** Weighted follower pool (log scale for percentile) */
  const poolWeightedFollowers: number[] = [];
  for (const s of latestSocial.values()) {
    const ig = Number(s.ig_followers ?? 0);
    const tt = Number(s.tt_followers ?? 0);
    const yt = Number(s.yt_subscribers ?? 0);
    const xf = Number(s.x_followers ?? 0);
    const w = cappedWeightedFollowers(ig, tt, yt, xf);
    poolWeightedFollowers.push(Math.log10(1 + w));
  }

  console.log("[calc:cmv] Loading athletes + clubs…");
  const athletesById = new Map<
    string,
    {
      ageYears: number | null;
      league: string | null;
      position: string;
    }
  >();
  {
    let data: AthleteMetaRow[] | null = null;
    let error: Error | null = null;
    {
      const res = await supabase
        .from("athletes")
        .select("id, date_of_birth, position, clubs ( league )");
      data = res.data ?? null;
      error = res.error;
    }
    if (error) {
      console.error("[calc:cmv] athletes join clubs:", error.message);
    } else {
      for (const row of data ?? []) {
        const dob = row.date_of_birth;
        const ageYears = computeAgeFromDob(dob, now);
        const league = row.clubs?.league ?? null;
        athletesById.set(row.id, {
          ageYears,
          league,
          position: row.position ?? "FW",
        });
      }
    }
  }

  /** GA90 pools by position bucket */
  const ga90ByBucket = new Map<string, number[]>();
  for (const r of latestSports.values()) {
    if (!r.athlete_id) continue;
    const meta = athletesById.get(r.athlete_id);
    const bucket = positionBucket(meta?.position);
    const min = Number(r.minutes_played ?? 0);
    const g = Number(r.goals ?? 0);
    const a = Number(r.assists ?? 0);
    const ga90 = goalsAssistsPer90(g, a, min);
    const list = ga90ByBucket.get(bucket) ?? [];
    list.push(ga90);
    ga90ByBucket.set(bucket, list);
  }

  console.log("[calc:cmv] Loading campaign_signals (active athletes)…");
  const campaignMap = new Map<string, CampaignSignalsRow>();
  {
    const { data: activeAthletes, error: activeErr } = await supabase
      .from("athletes")
      .select("id")
      .eq("is_active", true);
    if (activeErr) {
      console.error("[calc:cmv] athletes (is_active):", activeErr.message);
    } else {
      const activeIds = (activeAthletes ?? [])
        .map((r) => String(r.id ?? ""))
        .filter(Boolean);

      const { data: csData, error: csErr } = await supabase
        .from("campaign_signals")
        .select("*")
        .in("athlete_id", activeIds)
        .order("date", { ascending: false });

      if (csErr) console.error("[calc:cmv] campaign_signals:", csErr.message);

      for (const row of csData ?? []) {
        const aid = String(row.athlete_id ?? "");
        if (!aid) continue;
        if (!campaignMap.has(aid)) campaignMap.set(aid, row);
      }
    }
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
    const socAny = latestSocial.get(athleteId) as (SocialRow & Record<string, unknown>) | undefined;

    const meta = athletesById.get(athleteId) ?? {
      ageYears: null,
      league: null,
      position: "FW",
    };
    const bucket = positionBucket(meta.position);
    const ga90Pool = ga90ByBucket.get(bucket) ?? [];

    const min = Number(sm.minutes_played ?? 0);
    const g = Number(sm.goals ?? 0);
    const a = Number(sm.assists ?? 0);
    const ga90 = goalsAssistsPer90(g, a, min);
    const outputPct = percentileStrictBelow(ga90Pool, ga90);
    const minutesScore = clamp((min / 3060) * 100, 0, 100);
    const ratingRaw = sm.rating;
    const recentForm =
      ratingRaw != null && Number.isFinite(Number(ratingRaw))
        ? clamp(((Number(ratingRaw) - 1) / 9) * 100, 0, 100)
        : 50;
    const roleScore = 60;
    const competition = competitionScore(meta.league);
    const careerProgression = 55;
    const age = meta.ageYears;
    const peak = agePeak(bucket);
    const agePotential =
      age != null ? clamp(100 - Math.abs(age - peak) * 3, 20, 100) : 50;

    const sports_score = round2(
      clamp(
        0.2 * outputPct +
          0.15 * minutesScore +
          0.15 * recentForm +
          0.15 * roleScore +
          0.15 * competition +
          0.1 * careerProgression +
          0.1 * agePotential,
        0,
        100
      )
    );

    const ig = socAny ? Number(socAny.ig_followers ?? 0) : 0;
    const tt = socAny ? Number(socAny.tt_followers ?? 0) : 0;
    const yt = socAny ? Number(socAny.yt_subscribers ?? 0) : 0;
    const xf = socAny ? Number(socAny.x_followers ?? 0) : 0;
    const weightedFollowers = cappedWeightedFollowers(ig, tt, yt, xf);
    const followerPoolScore = percentileStrictBelow(
      poolWeightedFollowers,
      Math.log10(1 + weightedFollowers)
    );

    const growth = socAny ? getFollowerGrowth30d(socAny) : null;
    let followerGrowthScore: number;
    if (growth == null) {
      followerGrowthScore = 50;
    } else if (growthAvg <= 0 || !Number.isFinite(growthAvg)) {
      followerGrowthScore = logistic100(3, growth);
    } else {
      const delta = (growth - growthAvg) / growthAvg;
      followerGrowthScore = logistic100(3, delta);
    }
    followerGrowthScore = clamp(followerGrowthScore, 0, 100);

    const erRaw = socAny?.engagement_rate;
    const engagementRateScore =
      erRaw != null && Number.isFinite(Number(erRaw))
        ? clamp(logistic100(0.15, Number(erRaw) - 1), 0, 100)
        : 0;

    let viralityScore = 30;
    if (socAny && ig > 0) {
      const saves = socAny.avg_saves;
      const avgLikes = socAny.avg_likes;
      if (saves != null && Number.isFinite(Number(saves)) && Number(saves) >= 0) {
        const ratio = Number(saves) / ig;
        if (viralityAvg > 0 && Number.isFinite(viralityAvg)) {
          const deltaV = (ratio - viralityAvg) / viralityAvg;
          viralityScore = clamp(logistic100(3, deltaV), 0, 100);
        } else {
          viralityScore = clamp(logistic100(10, ratio), 0, 100);
        }
      } else if (avgLikes != null && Number.isFinite(Number(avgLikes)) && ig > 0) {
        const likesRatio = Number(avgLikes) / ig;
        if (likesRatio > 0.05) viralityScore = 80;
        else if (likesRatio > 0.02) viralityScore = 60;
        else if (likesRatio > 0.01) viralityScore = 45;
        else viralityScore = 30;
      }
    }

    const trendsRaw = socAny?.google_trends_score;
    const searchAndMedia =
      trendsRaw != null && Number.isFinite(Number(trendsRaw))
        ? clamp(Number(trendsRaw), 0, 100)
        : 50;
    const geography = 40;
    const spikes = 30;

    const socialInner = clamp(
      0.25 * followerGrowthScore +
        0.2 * engagementRateScore +
        0.2 * viralityScore +
        0.15 * searchAndMedia +
        0.1 * geography +
        0.1 * spikes,
      0,
      100
    );
    /** Blend six spec pillars with weighted-reach percentile (spec leaves combination implicit). */
    const social_score = round2(
      clamp(0.85 * socialInner + 0.15 * followerPoolScore, 0, 100)
    );

    const ratingNorm =
      ratingRaw != null && Number.isFinite(Number(ratingRaw))
        ? clamp(((Number(ratingRaw) - 1) / 9) * 100, 0, 100)
        : 50;
    let deltaSports: number;
    if (ratingRaw == null || !Number.isFinite(Number(ratingRaw))) {
      deltaSports = 50;
    } else if (ratingNorm > 70) {
      deltaSports = clamp(60 + ((ratingNorm - 70) / 30) * 20, 60, 80);
    } else {
      deltaSports = clamp(30 + (ratingNorm / 70) * 30, 0, 100);
    }

    let deltaSocial: number;
    if (growth == null) {
      deltaSocial = 50;
    } else if (!Number.isFinite(growthAvg) || Math.abs(growthAvg) < 1e-9) {
      deltaSocial = clamp(logistic100(3, growth), 0, 100);
    } else {
      const d = (growth - growthAvg) / Math.abs(growthAvg);
      deltaSocial = clamp(logistic100(3, d), 0, 100);
    }

    const deltaCommercial = 50;
    let momentum_score = round2(
      clamp(0.5 * deltaSocial + 0.3 * deltaSports + 0.2 * deltaCommercial, 0, 100)
    );
    const pfRaw = socAny?.posting_frequency;
    const pf =
      pfRaw != null && Number.isFinite(Number(pfRaw)) ? Number(pfRaw) : null;
    if (pf != null && pf > 1) momentum_score = round2(clamp(momentum_score * 1.1, 0, 100));
    else if (pf == null || pf < 0.1) {
      momentum_score = round2(clamp(momentum_score * 0.7, 0, 100));
    }

    const commercial_score = computeCommercialScore(campaignMap.get(athleteId));

    const brandMult = brandSafetyMultiplier(socAny as SocialRow | undefined);
    const brandSafetyScore100 = round2(clamp(100 * brandMult, 0, 100));
    const brand_fit_score = brandSafetyScore100;

    const conf = confidenceScore({
      ig_followers: socAny?.ig_followers,
      engagement_rate: socAny?.engagement_rate,
      rating: sm.rating,
      goals: sm.goals,
      minutes_played: sm.minutes_played,
    });
    const adjustment_score = round2(clamp(100 * conf, 0, 100));

    const cmv_raw = round2(
      clamp(
        W_CMV_SOCIAL * social_score +
          W_CMV_SPORTS * sports_score +
          W_CMV_COMMERCIAL * commercial_score +
          W_CMV_MOMENTUM * momentum_score +
          W_CMV_BRAND_SAFETY * brandSafetyScore100,
        0,
        100
      )
    );
    const cmv_total = round2(clamp(cmv_raw * conf, 0, 100));

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

  console.log(`[calc:cmv] Upserting ${rowsToInsert.length} rows in batches of ${BATCH_SIZE}…`);
  let inserted = 0;
  for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
    const batch = rowsToInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("cmv_scores").upsert(batch as never[], {
      onConflict: "athlete_id,date",
    });
    if (error) {
      console.error(`[calc:cmv] Batch upsert failed at offset ${i}: ${error.message}`);
      process.exit(1);
    }
    inserted += batch.length;
    if (inserted % 500 === 0 || inserted === rowsToInsert.length) {
      console.log(`[calc:cmv] Upserted ${inserted}/${rowsToInsert.length}`);
    }
  }

  const historyStart = dateMinusCalendarDays(today, 31);
  const date7 = dateMinusCalendarDays(today, 7);
  const date30 = dateMinusCalendarDays(today, 30);
  const todayTotals = new Map(rowsToInsert.map((r) => [r.athlete_id, r.cmv_total ?? 0]));

  const athleteDateToTotal = new Map<string, Map<string, number>>();
  const FETCH_IN_CHUNK = 200;
  console.log("[calc:cmv] Loading cmv_scores for cmv_history (last 31 days)…");
  for (let off = 0; off < targets.length; off += FETCH_IN_CHUNK) {
    const idChunk = targets.slice(off, off + FETCH_IN_CHUNK);
    const { data: scoreRows, error: histFetchErr } = await supabase
      .from("cmv_scores")
      .select("athlete_id,date,cmv_total")
      .in("athlete_id", idChunk)
      .gte("date", historyStart)
      .lte("date", today)
      .order("date", { ascending: true });
    if (histFetchErr) {
      console.error(`[calc:cmv] cmv_scores history fetch: ${histFetchErr.message}`);
      process.exit(1);
    }
    for (const row of (scoreRows ?? []) as {
      athlete_id: string;
      date: string;
      cmv_total: number | null;
    }[]) {
      const aid = row.athlete_id;
      if (!aid) continue;
      const inner = athleteDateToTotal.get(aid) ?? new Map<string, number>();
      if (row.cmv_total != null && Number.isFinite(Number(row.cmv_total))) {
        inner.set(row.date, Number(row.cmv_total));
      }
      athleteDateToTotal.set(aid, inner);
    }
  }

  const historyRows: CmvHistoryInsert[] = [];

  for (const athleteId of targets) {
    const dateMap = athleteDateToTotal.get(athleteId) ?? new Map<string, number>();
    const cmvToday =
      dateMap.get(today) ??
      (todayTotals.has(athleteId) ? Number(todayTotals.get(athleteId)) : NaN);
    if (!Number.isFinite(cmvToday)) continue;

    const v7 = dateMap.has(date7) ? dateMap.get(date7)! : null;
    const v30 = dateMap.has(date30) ? dateMap.get(date30)! : null;
    const delta_7d = v7 != null ? round2(cmvToday - v7) : null;
    const delta_30d = v30 != null ? round2(cmvToday - v30) : null;

    historyRows.push({
      athlete_id: athleteId,
      date: today,
      cmv_total: round2(cmvToday),
      delta_7d,
      delta_30d,
    });
  }

  console.log(`[calc:cmv] Upserting ${historyRows.length} cmv_history rows in batches of ${BATCH_SIZE}…`);
  let histUpserted = 0;
  for (let i = 0; i < historyRows.length; i += BATCH_SIZE) {
    const batch = historyRows.slice(i, i + BATCH_SIZE);
    const hist = () => supabase.from("cmv_history");
    let histErr = (await hist().upsert(batch, { onConflict: "athlete_id,date" })).error;
    if (
      histErr &&
      typeof histErr.message === "string" &&
      histErr.message.includes("no unique or exclusion constraint matching the ON CONFLICT")
    ) {
      const ids = batch
        .map((r) => r.athlete_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0);
      const { error: delErr } = await hist().delete().eq("date", today).in("athlete_id", ids);
      if (delErr) {
        console.error(`[calc:cmv] cmv_history delete fallback at offset ${i}: ${delErr.message}`);
        process.exit(1);
      }
      histErr = (await hist().insert(batch)).error;
    }
    if (histErr) {
      console.error(`[calc:cmv] cmv_history batch failed at offset ${i}: ${histErr.message}`);
      process.exit(1);
    }
    histUpserted += batch.length;
    if (histUpserted % 500 === 0 || histUpserted === historyRows.length) {
      console.log(`[calc:cmv] cmv_history upserted ${histUpserted}/${historyRows.length}`);
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