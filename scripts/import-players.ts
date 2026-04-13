/**
 * Import squad players from API-Football into Supabase `athletes` (+ `clubs`), then sync stats for new rows.
 *
 * Env: API_FOOTBALL_KEY, API_FOOTBALL_URL (optional),
 *      NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run import:players
 * Full pipeline: npm run import:all
 *
 * Apply migration first: supabase/migrations/20260413120000_athletes_api_football_player_id.sql
 */

import dotenv from "dotenv";
import { randomUUID } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { getTeamSquad, getPlayerStats, type SquadPlayer } from "../lib/api-football";

dotenv.config({ path: ".env.local" });

// To add more leagues, add entries here with the API-Football league ID
// Full list at: https://www.api-football.com/documentation-v3#tag/Leagues
const LEAGUES_TO_IMPORT = [
  { leagueId: 140, name: "LaLiga", season: 2024 },
  { leagueId: 39, name: "Premier League", season: 2024 },
  { leagueId: 61, name: "Ligue 1", season: 2024 },
  { leagueId: 78, name: "Bundesliga", season: 2024 },
  { leagueId: 135, name: "Serie A", season: 2024 },
] as const;

const TOP_TEAMS: Record<number, number[]> = {
  140: [541, 529, 530, 532, 548, 543, 546, 531, 547, 538],
  39: [42, 40, 33, 34, 47, 49, 50, 51, 52, 66],
  61: [85, 91, 80, 93, 94, 84, 97, 98, 99, 100],
  78: [157, 165, 168, 169, 170, 171, 172, 173, 174, 175],
  135: [505, 489, 496, 492, 487, 488, 494, 499, 500, 502],
};

const DELAY_BETWEEN_TEAM_MS = 2000;
const DELAY_BETWEEN_STATS_MS = 3000;

function readRequiredServiceRoleKey(): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!k) {
    console.error("[import:players] SUPABASE_SERVICE_ROLE_KEY is not set in .env.local");
    process.exit(1);
  }
  return k;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Map API-Football position strings to FW / MF / DF / GK */
function mapPosition(raw: string | null | undefined): string {
  if (raw == null || raw.trim() === "") return "MF";
  const u = raw.toUpperCase();
  if (u.includes("GOAL") || u === "GK" || u === "G") return "GK";
  if (u.includes("DEF") || u === "DF" || u === "D") return "DF";
  if (u.includes("MID") || u === "MF" || u === "M") return "MF";
  if (u.includes("ATT") || u.includes("FORWARD") || u.includes("STRIK") || u === "FW" || u === "F") return "FW";
  return "MF";
}

async function ensureClubId(
  supabase: SupabaseClient<Database>,
  teamName: string,
  leagueName: string
): Promise<string> {
  const { data: found } = await supabase
    .from("clubs")
    .select("id")
    .eq("name", teamName)
    .eq("league", leagueName)
    .maybeSingle();

  if (found?.id) return found.id;

  const id = randomUUID();
  const { error } = await supabase.from("clubs").insert({
    id,
    name: teamName,
    league: leagueName,
  });

  if (error) {
    const { data: again } = await supabase
      .from("clubs")
      .select("id")
      .eq("name", teamName)
      .eq("league", leagueName)
      .maybeSingle();
    if (again?.id) return again.id;
    throw error;
  }
  return id;
}

type UpsertOutcome = "imported" | "skipped";

async function upsertAthleteFromSquad(
  supabase: SupabaseClient<Database>,
  p: SquadPlayer,
  clubId: string
): Promise<{ outcome: UpsertOutcome; newAthleteId?: string }> {
  const apiId = p.apiFootballId;
  const pos = mapPosition(p.positionRaw);

  const { data: byApi } = await supabase
    .from("athletes")
    .select("id, club_id")
    .eq("api_football_player_id", apiId)
    .maybeSingle();

  if (byApi?.id) {
    const { error } = await supabase
      .from("athletes")
      .update({
        name: p.name,
        position: pos,
        nationality: p.nationality,
        photo_url: p.photo,
        age: p.age ?? null,
        club_id: clubId,
        status: "active",
      })
      .eq("id", byApi.id);
    if (error) throw error;
    return { outcome: "skipped" };
  }

  const { data: nameRows } = await supabase
    .from("athletes")
    .select("id, club_id, api_football_player_id")
    .eq("name", p.name);

  const orphans = (nameRows ?? []).filter((r) => r.api_football_player_id == null);
  if (orphans.length === 1) {
    const row = orphans[0]!;
    const { error } = await supabase
      .from("athletes")
      .update({
        api_football_player_id: apiId,
        club_id: clubId,
        position: pos,
        nationality: p.nationality,
        photo_url: p.photo,
        age: p.age ?? null,
        status: "active",
      })
      .eq("id", row.id);
    if (error) throw error;
    return { outcome: "skipped" };
  }

  if (orphans.length > 1) {
    console.warn(
      `[import:players] Ambiguous name "${p.name}" (${orphans.length} rows without api_football_player_id) — inserting new row`
    );
  }

  const id = randomUUID();
  const { error: insErr } = await supabase.from("athletes").insert({
    id,
    name: p.name,
    position: pos,
    nationality: p.nationality,
    club_id: clubId,
    age: p.age ?? null,
    photo_url: p.photo,
    status: "active",
    api_football_player_id: apiId,
  });

  if (insErr) throw insErr;
  return { outcome: "imported", newAthleteId: id };
}

async function syncStatsForNewAthlete(
  supabase: SupabaseClient<Database>,
  athleteId: string,
  apiFootballPlayerId: number,
  season: number
): Promise<boolean> {
  const parsed = await getPlayerStats(apiFootballPlayerId, season);
  if (!parsed) return false;

  const metricsDate = new Date().toISOString().split("T")[0]!;
  const row = {
    athlete_id: athleteId,
    date: metricsDate,
    season,
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
    console.warn(`[import:players] stats upsert ${athleteId}: ${error.message}`);
    return false;
  }

  if (parsed.photoUrl) {
    await supabase.from("athletes").update({ photo_url: parsed.photoUrl }).eq("id", athleteId);
  }
  return true;
}

async function main(): Promise<void> {
  if (!process.env.API_FOOTBALL_KEY?.trim()) {
    console.error("[import:players] Missing API_FOOTBALL_KEY");
    process.exit(1);
  }

  const testSquad = await getTeamSquad(541);
  console.log(
    "TEST SQUAD Real Madrid:",
    JSON.stringify(testSquad?.players?.slice(0, 2), null, 2)
  );

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    console.error("[import:players] Missing NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }

  const supabase = createClient<Database>(url, readRequiredServiceRoleKey());
  const season = LEAGUES_TO_IMPORT[0]?.season ?? 2024;

  const newAthleteIds: string[] = [];
  let teamIndex = 0;

  for (const league of LEAGUES_TO_IMPORT) {
    const teamIds = TOP_TEAMS[league.leagueId];
    if (!teamIds?.length) {
      console.warn(`[import:players] No TOP_TEAMS for league ${league.leagueId} (${league.name})`);
      continue;
    }

    for (const teamId of teamIds) {
      if (teamIndex > 0) await sleep(DELAY_BETWEEN_TEAM_MS);
      teamIndex++;

      let imported = 0;
      let skipped = 0;

      try {
        const squad = await getTeamSquad(teamId);
        if (!squad) {
          console.warn(`[${league.name}] team ${teamId} — no squad data`);
          continue;
        }

        const clubId = await ensureClubId(supabase, squad.teamName, league.name);

        for (const pl of squad.players) {
          try {
            const { outcome, newAthleteId } = await upsertAthleteFromSquad(supabase, pl, clubId);
            if (outcome === "imported") {
              imported++;
              if (newAthleteId) newAthleteIds.push(newAthleteId);
            } else skipped++;
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.warn(`[import:players] player ${pl.name} (${pl.apiFootballId}): ${msg}`);
            skipped++;
          }
        }

        console.log(`[${league.name}] [${squad.teamName}] — ${imported} players imported, ${skipped} skipped`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`[${league.name}] team ${teamId} FAIL: ${msg}`);
      }
    }
  }

  console.log(`\n[import:players] Squad import finished. New athletes queued for stats: ${newAthleteIds.length}`);

  let statsOk = 0;
  let statsFail = 0;
  for (let i = 0; i < newAthleteIds.length; i++) {
    if (i > 0) await sleep(DELAY_BETWEEN_STATS_MS);
    const athleteId = newAthleteIds[i]!;
    const { data: row } = await supabase
      .from("athletes")
      .select("api_football_player_id, name")
      .eq("id", athleteId)
      .maybeSingle();
    const apiId = row?.api_football_player_id;
    if (apiId == null) {
      statsFail++;
      continue;
    }
    try {
      const ok = await syncStatsForNewAthlete(supabase, athleteId, apiId, season);
      if (ok) {
        statsOk++;
        console.log(`[import:players] stats OK · ${row?.name ?? athleteId} · API#${apiId}`);
      } else statsFail++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[import:players] stats FAIL · ${row?.name}: ${msg}`);
      statsFail++;
    }
  }

  console.log(`\n[import:players] Stats sync for new players: success=${statsOk} failed=${statsFail}`);
}

main().catch((e) => {
  console.error("[import:players] Fatal:", e);
  process.exit(1);
});
