import { PlayersDatabaseClient } from "@/components/players-database-client";
import {
  getCmvDeltaLatestTwoForAthletes,
  getPlayerDatabaseStats,
  getPlayersWithFilters,
  type PlayersDirectoryCmvRange,
  type PlayersDirectoryPositionAbbrev,
  type PlayersDirectorySort,
} from "@/lib/players";
import { LEAGUE_OPTIONS, type LeagueFilterValue } from "@/lib/rankings-filters";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SearchParamValue = string | string[] | undefined;

function firstParam(v: SearchParamValue): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function asLeague(v: string | undefined): LeagueFilterValue {
  if (v && LEAGUE_OPTIONS.includes(v as LeagueFilterValue)) return v as LeagueFilterValue;
  return "All";
}

function asPosition(v: string | undefined): PlayersDirectoryPositionAbbrev {
  if (v === "FW" || v === "MF" || v === "DF" || v === "GK") return v;
  return "All";
}

function asRange(v: string | undefined): PlayersDirectoryCmvRange {
  if (v === "60plus" || v === "40-60" || v === "20-40" || v === "under20") return v;
  return "all";
}

function asSort(v: string | undefined): PlayersDirectorySort {
  if (v === "sports" || v === "social" || v === "momentum") return v;
  return "cmv";
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  await createServerSupabaseClient();

  const params = (await searchParams) ?? {};
  const search = firstParam(params.q) ?? "";
  const league = asLeague(firstParam(params.league));
  const position = asPosition(firstParam(params.position));
  const cmvRange = asRange(firstParam(params.range));
  const sort = asSort(firstParam(params.sort));

  const rawPage = Number(firstParam(params.page) ?? "1");
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1;

  const [{ players, totalCount, page: resolvedPage }, stats] = await Promise.all([
    getPlayersWithFilters({ search, league, position, cmvRange, sort, page, pageSize: 50 }),
    getPlayerDatabaseStats(),
  ]);
  const deltaMap = await getCmvDeltaLatestTwoForAthletes(players.map((p) => p.id));
  const weeklyDelta = Object.fromEntries(deltaMap.entries());

  return (
    <PlayersDatabaseClient
      players={players}
      totalCount={totalCount}
      page={resolvedPage}
      stats={stats}
      weeklyDelta={weeklyDelta}
      initial={{ search, league, position, cmvRange, sort }}
    />
  );
}
