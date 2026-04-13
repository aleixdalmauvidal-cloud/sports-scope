/**
 * Compute CMV subscores from sports_metrics + social_metrics and insert cmv_scores
 * for athletes that have sports data but no cmv_scores row yet.
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run calc:cmv
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
  const ig = Number(s.instagram_followers ?? 0);
  const tt = Number(s.tiktok_followers ?? 0);
  const er = s.engagement_rate;
  if (ig + tt > 0) return true;
  if (er != null && Number.isFinite(Number(er)) && Number(er) > 0) return true;
  return false;
}

function socialScoreFromData(
  s: SocialRow,
  poolLogFollowers: number[],
  poolEngagement: number[]
): number {
  const ig = Number(s.instagram_followers ?? 0);
  const tt = Number(s.tiktok_followers ?? 0);
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
  const today = new Date().toISOString().split("T")[0]!;

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

  const poolLogFollowers: number[] = [];
  const poolEngagement: number[] = [];
  for (const s of latestSocial.values()) {
    const ig = Number(s.instagram_followers ?? 0);
    const tt = Number(s.tiktok_followers ?? 0);
    poolLogFollowers.push(Math.log10(1 + ig + tt));
    const er = s.engagement_rate;
    if (er != null && Number.isFinite(Number(er))) poolEngagement.push(Number(er));
  }

  console.log("[calc:cmv] Loading existing cmv_scores athlete_ids…");
  const cmvRows = await fetchAllRows<{ athlete_id: string }>(supabase, "cmv_scores", "athlete_id");
  const hasCmv = new Set(cmvRows.map((r) => r.athlete_id));

  const targets = [...latestSports.keys()].filter((id) => !hasCmv.has(id));
  console.log(`[calc:cmv] Athletes with sports_metrics, no CMV yet: ${targets.length}`);

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
    const sports_score = round2(
      clamp(
        W_SPORTS_RATING * rating100 +
          W_SPORTS_MINUTES_PCT * minPct +
          W_SPORTS_GA90_PCT * gaPct,
        0,
        100
      )
    );

    const socRow = latestSocial.get(athleteId);
    let social_score: number;
    if (hasSocialSignal(socRow)) {
      social_score = socialScoreFromData(socRow!, poolLogFollowers, poolEngagement);
    } else {
      social_score = DEFAULT_SOCIAL;
    }

    const commercial_score = DEFAULT_COMMERCIAL;
    const brand_fit_score = DEFAULT_BRAND_FIT;
    const momentum_score = DEFAULT_MOMENTUM;
    const adjustment_score = DEFAULT_ADJUSTMENT;

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
    const { error } = await supabase.from("cmv_scores").insert(batch);
    if (error) {
      console.error(`[calc:cmv] Batch insert failed at offset ${i}: ${error.message}`);
      process.exit(1);
    }
    inserted += batch.length;
    if (inserted % 100 === 0 || inserted === rowsToInsert.length) {
      console.log(`[calc:cmv] Inserted ${inserted}/${rowsToInsert.length}`);
    }
  }

  console.log(`[calc:cmv] Done. score_version=${SCORE_VERSION} date=${today}`);
}

main().catch((e) => {
  console.error("[calc:cmv] Fatal:", e);
  process.exit(1);
});
