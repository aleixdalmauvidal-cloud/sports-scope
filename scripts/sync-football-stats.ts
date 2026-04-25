/**
 * Sync API-Football season stats into Supabase `sports_metrics` for active athletes with API-Football IDs.
 *
 * Env: API_FOOTBALL_KEY, API_FOOTBALL_URL (optional),
 *      NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (required — bypasses RLS; never expose client-side)
 *
 * Run: npm run sync:football
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { ParsedPlayerSeasonStats, SearchPlayerHit } from "../lib/api-football";
import type { Database } from "../types/database";
import { requiredEnv } from "./lib/env";

dotenv.config({ path: ".env.local" });

console.log("ENV CHECK:", {
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
});

const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

const SEASON = 2025;
/** Free tier ~10 req/min; spacing between athletes keeps 2 calls/player safe. */
const DELAY_BETWEEN_PLAYERS_MS = 8000;
/** Pause after search before the stats request (same athlete). */
const DELAY_SEARCH_TO_STATS_MS = 3000;
const PLAYER_NAME_ALIASES: Record<string, string> = {
  "Vinicius Jr": "Vinicius Junior",
  "Erling Haaland": "Haaland",
  "Jude Bellingham": "Bellingham",
  "Bukayo Saka": "Saka",
  "Rodrigo De Paul": "De Paul",
  "Bradley Barcola": "Barcola",
  "Julian Alvarez": "Alvarez",
  "Phil Foden": "Foden",
  "Federico Valverde": "Valverde",
  "Ousmane Dembele": "Dembele",
  "Luis Diaz": "Diaz",
  "Martin Odegaard": "Odegaard",
  "Declan Rice": "Rice",
  "Alexis Mac Allister": "Mac Allister",
  "Darwin Nunez": "Nunez",
  "Antoine Griezmann": "Griezmann",
  "Robert Lewandowski": "Lewandowski",
  "Kai Havertz": "Havertz",
  "Kevin De Bruyne": "De Bruyne",
  "Alexander Sorloth": "Sorloth",
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const {
    searchPlayer,
    getPlayerStatsForClub,
    getPlayerStats,
    scoreSearchPlayerHit,
    leagueIdsForPlayerSearch,
  } = await import("../lib/api-football");

  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  requiredEnv("API_FOOTBALL_KEY");

  const supabase = createClient<Database>(url, serviceRoleKey);

  const { data: athleteRows, error: athleteErr } = await supabase
    .from("athletes")
    .select("id, name, position, api_football_player_id, clubs(league)")
    .eq("is_active", true)
    .not("api_football_player_id", "is", null)
    .limit(200);

  if (athleteErr) throw new Error(`Failed to fetch athletes: ${athleteErr.message}`);

  const athletes = (athleteRows ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    position: r.position,
    api_football_player_id: r.api_football_player_id,
    league: (r.clubs as { league: string | null } | null)?.league ?? null,
  }));

  console.log(`[sync:football] Found ${athletes.length} active athletes with API Football IDs`);

  if (athletes.length === 0) {
    console.log("[sync:football] No active athletes found. Exiting.");
    process.exit(0);
  }

  const metricsDate = new Date().toISOString().split("T")[0]!;
  let ok = 0;
  let fail = 0;

  /** Club name not loaded from DB here; search helpers still work with league + empty club. */
  const clubLabel = "";

  for (let i = 0; i < athletes.length; i++) {
    const a = athletes[i]!;
    const tag = `[${i + 1}/${athletes.length}] ${a.name}`;
    const searchName = PLAYER_NAME_ALIASES[a.name] ?? a.name;

    try {
      if (i > 0) {
        await sleep(DELAY_BETWEEN_PLAYERS_MS);
      }

      let parsed: ParsedPlayerSeasonStats | null = null;
      let triedStoredApiId = false;

      const storedApiId = a.api_football_player_id;
      if (storedApiId != null && Number.isFinite(Number(storedApiId))) {
        triedStoredApiId = true;
        await sleep(DELAY_SEARCH_TO_STATS_MS);
        parsed = await getPlayerStats(Number(storedApiId), SEASON);
        if (!parsed) {
          console.warn(`${tag} WARN: no stats for stored API#${storedApiId} — falling back to search`);
        }
      }

      if (!parsed) {
        if (triedStoredApiId) {
          await sleep(DELAY_SEARCH_TO_STATS_MS);
        }
        const leagueCandidates = leagueIdsForPlayerSearch(a.league, clubLabel);
        let hits: SearchPlayerHit[] = [];
        for (let li = 0; li < leagueCandidates.length; li++) {
          if (li > 0) {
            await sleep(DELAY_SEARCH_TO_STATS_MS);
          }
          const lid = leagueCandidates[li]!;
          hits = await searchPlayer(searchName, SEASON, lid);
          if (hits.length > 0) break;
        }

        if (hits.length === 0) {
          console.warn(`${tag} FAIL: no search results (tried leagues ${leagueCandidates.join(", ")})`);
          fail++;
          continue;
        }

        let bestHit = hits[0]!;
        let bestScore = scoreSearchPlayerHit(bestHit, clubLabel, a.league);
        for (let j = 1; j < hits.length; j++) {
          const h = hits[j]!;
          const s = scoreSearchPlayerHit(h, clubLabel, a.league);
          if (s > bestScore) {
            bestScore = s;
            bestHit = h;
          }
        }

        await sleep(DELAY_SEARCH_TO_STATS_MS);
        parsed = await getPlayerStatsForClub(bestHit.playerId, clubLabel, a.league, SEASON);
      }

      if (!parsed) {
        console.warn(`${tag} FAIL: could not resolve season stats`);
        fail++;
        continue;
      }

      const row = {
        athlete_id: a.id,
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
        onConflict: "athlete_id,date",
      });

      if (error) {
        console.warn(`${tag} FAIL: ${error.message}`);
        fail++;
        continue;
      }

      const photoUrl = parsed.photoUrl;
      const athleteUpdate: { api_football_player_id: number; photo_url?: string | null } = {
        api_football_player_id: parsed.apiFootballPlayerId,
      };
      if (photoUrl) athleteUpdate.photo_url = photoUrl;
      const { error: athleteUpdateErr } = await supabase.from("athletes").update(athleteUpdate).eq("id", a.id);
      if (athleteUpdateErr) {
        console.warn(`${tag} WARN: sports_metrics OK but athlete update failed: ${athleteUpdateErr.message}`);
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
