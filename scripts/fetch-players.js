/**
 * Importa jugadores desde API-Football (La Liga + Premier League, temporada 2024)
 * y los sincroniza con Supabase (clubs, athletes, sports_metrics).
 *
 * Variables de entorno:
 *   API_FOOTBALL_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Ejecutar: node scripts/fetch-players.js
 * (o npm run fetch-players)
 *
 * Esquema esperado en Supabase (ejecutar una vez si aún no existe):
 *
 *   alter table clubs add column if not exists api_football_team_id integer unique;
 *   alter table athletes add column if not exists api_football_player_id integer unique;
 *   alter table athletes add column if not exists age integer;
 *   alter table athletes add column if not exists photo_url text;
 *
 *   create table if not exists public.sports_metrics (
 *     id uuid primary key default gen_random_uuid(),
 *     athlete_id uuid not null references public.athletes(id) on delete cascade,
 *     date date not null,
 *     season integer not null,
 *     minutes_played integer not null default 0,
 *     goals integer not null default 0,
 *     assists integer not null default 0,
 *     rating numeric,
 *     unique (athlete_id, season)
 *   );
 *
 * RLS: el rol anon suele no poder insertar; usa service_role o políticas INSERT/UPDATE
 * adecuadas para este script.
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const API_BASE = "https://v3.football.api-sports.io";
const SEASON = 2024;
/** Fecha del snapshot de métricas (NOT NULL en sports_metrics.date) */
const METRICS_DATE = new Date().toISOString().split("T")[0];
const MAX_PER_LEAGUE = 100;
const LEAGUES = [
  { id: 140, label: "La Liga" },
  { id: 39, label: "Premier League" },
];

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.warn("[env] No se encontró .env.local; se usan solo variables ya definidas.");
    return;
  }
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function mapPosition(apiPos) {
  const p = String(apiPos || "").toLowerCase();
  if (p.includes("goalkeeper")) return "GK";
  if (p.includes("defender")) return "DF";
  if (p.includes("midfielder")) return "MF";
  if (p.includes("attacker")) return "FW";
  return apiPos ? String(apiPos).slice(0, 24) : "—";
}

function parseIntSafe(v, fallback = 0) {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseRating(v) {
  if (v == null || v === "") return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

async function apiFetchPlayers(leagueId, season, page, apiKey) {
  const url = new URL(`${API_BASE}/players`);
  url.searchParams.set("league", String(leagueId));
  url.searchParams.set("season", String(season));
  url.searchParams.set("page", String(page));

  const res = await fetch(url, {
    headers: { "x-apisports-key": apiKey },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API-Football HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json();
}

async function fetchLeaguePlayers(leagueId, leagueLabel, apiKey) {
  const out = [];
  let page = 1;
  let totalPages = 1;

  console.log(`\n[fetch] Liga ${leagueId} (${leagueLabel}), hasta ${MAX_PER_LEAGUE} jugadores…`);

  while (out.length < MAX_PER_LEAGUE && page <= totalPages) {
    const data = await apiFetchPlayers(leagueId, SEASON, page, apiKey);
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error("[fetch] Errores API:", data.errors);
      break;
    }

    const batch = Array.isArray(data.response) ? data.response : [];
    totalPages = data.paging?.total ?? 1;

    console.log(
      `[fetch]   página ${page}/${totalPages} · +${batch.length} registros (acumulado ${out.length})`
    );

    for (const item of batch) {
      out.push({ item, leagueId, leagueLabel });
      if (out.length >= MAX_PER_LEAGUE) break;
    }

    page += 1;
    if (batch.length === 0) break;

    await new Promise((r) => setTimeout(r, 350));
  }

  return out.slice(0, MAX_PER_LEAGUE);
}

async function upsertClub(supabase, teamId, teamName, leagueLabel) {
  const row = {
    api_football_team_id: teamId,
    name: teamName,
    league: leagueLabel,
  };

  const { data, error } = await supabase
    .from("clubs")
    .upsert(row, { onConflict: "api_football_team_id" })
    .select("id")
    .single();

  if (error) throw new Error(`clubs upsert: ${error.message}`);
  return data.id;
}

async function upsertAthlete(supabase, payload) {
  const { data, error } = await supabase
    .from("athletes")
    .upsert(payload, { onConflict: "api_football_player_id" })
    .select("id")
    .single();

  if (error) throw new Error(`athletes upsert: ${error.message}`);
  return data.id;
}

async function upsertSportsMetrics(supabase, athleteId, season, date, metrics) {
  const row = {
    athlete_id: athleteId,
    date,
    season,
    minutes_played: metrics.minutes_played,
    goals: metrics.goals,
    assists: metrics.assists,
    rating: metrics.rating,
  };

  const { error } = await supabase
    .from("sports_metrics")
    .upsert(row, { onConflict: "athlete_id,season" });

  if (error) throw new Error(`sports_metrics upsert: ${error.message}`);
}

async function processPlayer(supabase, { item, leagueLabel }) {
  const player = item.player;
  if (!player?.id) return;

  const stat = Array.isArray(item.statistics) ? item.statistics[0] : null;
  if (!stat) {
    console.warn(`[skip] Sin statistics[0] · player ${player.id} ${player.name}`);
    return;
  }

  const team = stat.team;
  if (!team?.id || !team?.name) {
    console.warn(`[skip] Sin equipo en stats · player ${player.id} ${player.name}`);
    return;
  }

  const games = stat.games || {};
  const goals = stat.goals || {};

  const minutes = parseIntSafe(games.minutes, 0);
  const goalsTotal = parseIntSafe(goals.total, 0);
  const assists = parseIntSafe(goals.assists, 0);
  const rating = parseRating(games.rating);

  const clubId = await upsertClub(supabase, team.id, team.name, leagueLabel);

  const position = mapPosition(player.position);

  const athletePayload = {
    api_football_player_id: player.id,
    name: player.name,
    nationality: player.nationality || null,
    position,
    photo_url: player.photo || null,
    club_id: clubId,
  };
  if (player.age != null) {
    const a = parseInt(String(player.age), 10);
    if (Number.isFinite(a)) athletePayload.age = a;
  }

  const athleteId = await upsertAthlete(supabase, athletePayload);

  await upsertSportsMetrics(supabase, athleteId, SEASON, METRICS_DATE, {
    minutes_played: minutes,
    goals: goalsTotal,
    assists,
    rating,
  });
}

async function main() {
  loadEnvLocal();

  const apiKey = process.env.API_FOOTBALL_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!apiKey) {
    console.error("Falta API_FOOTBALL_KEY en el entorno.");
    process.exit(1);
  }
  if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`[sync] sports_metrics.date = ${METRICS_DATE} (season ${SEASON})`);

  let totalProcessed = 0;

  for (const { id: leagueId, label } of LEAGUES) {
    const rows = await fetchLeaguePlayers(leagueId, label, apiKey);
    console.log(`[sync] Sincronizando ${rows.length} jugadores en Supabase…`);

    let i = 0;
    for (const row of rows) {
      i += 1;
      try {
        const name = row.item?.player?.name || "?";
        await processPlayer(supabase, row);
        totalProcessed += 1;
        console.log(`[sync]   [${i}/${rows.length}] OK · ${name}`);
      } catch (e) {
        console.error(`[sync]   [${i}/${rows.length}] ERROR ·`, e.message);
      }
    }
  }

  console.log(`\n[done] Procesados correctamente: ${totalProcessed} jugadores (máx. ${MAX_PER_LEAGUE} por liga).`);
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
