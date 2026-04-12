/**
 * Sync API-Football season stats into Supabase `sports_metrics` for the top 30 CMV athletes.
 *
 * Env: API_FOOTBALL_KEY, API_FOOTBALL_URL (optional),
 *      NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (required — bypasses RLS; never expose client-side)
 *
 * Run: npm run sync:football
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { SearchPlayerHit } from "../lib/api-football";

dotenv.config({ path: ".env.local" });

console.log("ENV CHECK:", {
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
});

function readRequiredServiceRoleKey(): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!k) {
    console.error(
      "[sync:football] SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local for this script only — it bypasses RLS and must never be committed or used in the browser."
    );
    process.exit(1);
  }
  return k;
}

const serviceRoleKey = readRequiredServiceRoleKey();

const SEASON = 2024;
/** Free tier ~10 req/min; spacing between athletes keeps 2 calls/player safe. */
const DELAY_BETWEEN_PLAYERS_MS = 7000;
/** Pause after search before the stats request (same athlete). */
const DELAY_SEARCH_TO_STATS_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const { getTopPlayersByCmv } = await import("../lib/players");
  const { searchPlayer, getPlayerStatsForClub, scoreSearchPlayerHit, leagueIdsForPlayerSearch } =
    await import("../lib/api-football");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!process.env.API_FOOTBALL_KEY?.trim()) {
    console.error("[sync:football] Missing API_FOOTBALL_KEY");
    process.exit(1);
  }
  if (!url) {
    console.error("[sync:football] Missing NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey);
  const players = await getTopPlayersByCmv(30);

  if (players.length === 0) {
    console.error("[sync:football] No players returned from getTopPlayersByCmv(30). Check Supabase env.");
    process.exit(1);
  }

  const metricsDate = new Date().toISOString().split("T")[0]!;
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < players.length; i++) {
    const p = players[i]!;
    const tag = `[${i + 1}/${players.length}] ${p.name}`;

    try {
      if (i > 0) {
        await sleep(DELAY_BETWEEN_PLAYERS_MS);
      }

      const leagueCandidates = leagueIdsForPlayerSearch(p.league, p.club);
      let hits: SearchPlayerHit[] = [];
      for (let li = 0; li < leagueCandidates.length; li++) {
        if (li > 0) {
          await sleep(DELAY_SEARCH_TO_STATS_MS);
        }
        const lid = leagueCandidates[li]!;
        hits = await searchPlayer(p.name, SEASON, lid);
        if (hits.length > 0) break;
      }

      if (hits.length === 0) {
        console.warn(`${tag} FAIL: no search results (tried leagues ${leagueCandidates.join(", ")})`);
        fail++;
        continue;
      }

      let bestHit = hits[0]!;
      let bestScore = scoreSearchPlayerHit(bestHit, p.club, p.league);
      for (let j = 1; j < hits.length; j++) {
        const h = hits[j]!;
        const s = scoreSearchPlayerHit(h, p.club, p.league);
        if (s > bestScore) {
          bestScore = s;
          bestHit = h;
        }
      }

      await sleep(DELAY_SEARCH_TO_STATS_MS);
      const parsed = await getPlayerStatsForClub(bestHit.playerId, p.club, p.league, SEASON);

      if (!parsed) {
        console.warn(`${tag} FAIL: no stats for API player ${bestHit.playerId}`);
        fail++;
        continue;
      }

      const row = {
        athlete_id: p.id,
        date: metricsDate,
        season: SEASON,
        minutes_played: parsed.minutesPlayed,
        goals: parsed.goals,
        assists: parsed.assists,
        rating: parsed.rating,
        matches_played: parsed.matchesPlayed,
        pass_accuracy: parsed.passAccuracy,
        api_football_id: parsed.apiFootballPlayerId,
      };

      const { error } = await supabase.from("sports_metrics").upsert(row, {
        onConflict: "athlete_id,season",
      });

      if (error) {
        console.warn(`${tag} FAIL: ${error.message}`);
        fail++;
        continue;
      }

      console.log(
        `${tag} OK · API#${parsed.apiFootballPlayerId} · ${parsed.goals}G ${parsed.assists}A · ${parsed.matchesPlayed} apps · ${parsed.minutesPlayed}′`
      );
      ok++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`${tag} FAIL: ${msg}`);
      fail++;
    }
  }

  console.log(`\n[sync:football] Finished. success=${ok} failed=${fail}`);
}

main().catch((e) => {
  console.error("[sync:football] Fatal:", e);
  process.exit(1);
});
