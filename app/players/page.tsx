import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Player Database | Sports Scope",
  description:
    "Search and filter 1400+ footballers by CMV, league, position and more.",
};

const VALID_SORTS: PlayersDirectorySort[] = ["cmv", "sports", "social", "momentum"];
const VALID_POSITIONS: PlayersDirectoryPositionAbbrev[] = ["All", "FW", "MF", "DF", "GK"];
const VALID_RANGES: PlayersDirectoryCmvRange[] = ["all", "60plus", "40-60", "20-40", "under20"];

const PAGE_SIZE = 50;

function parseLeague(v: string | undefined): LeagueFilterValue {
  if (!v) return "All";
  return LEAGUE_OPTIONS.includes(v as LeagueFilterValue) ? (v as LeagueFilterValue) : "All";
}

function parsePosition(v: string | undefined): PlayersDirectoryPositionAbbrev {
  if (!v) return "All";
  return VALID_POSITIONS.includes(v as PlayersDirectoryPositionAbbrev)
    ? (v as PlayersDirectoryPositionAbbrev)
    : "All";
}

function parseCmvRange(v: string | undefined): PlayersDirectoryCmvRange {
  if (!v) return "all";
  return VALID_RANGES.includes(v as PlayersDirectoryCmvRange) ? (v as PlayersDirectoryCmvRange) : "all";
}

function parseSort(v: string | undefined): PlayersDirectorySort {
  if (!v) return "cmv";
  return VALID_SORTS.includes(v as PlayersDirectorySort) ? (v as PlayersDirectorySort) : "cmv";
}

function parsePage(v: string | undefined): number {
  const n = parseInt(v ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const league = parseLeague(typeof sp.league === "string" ? sp.league : undefined);
  const position = parsePosition(typeof sp.position === "string" ? sp.position : undefined);
  const cmvRange = parseCmvRange(typeof sp.range === "string" ? sp.range : undefined);
  const sort = parseSort(typeof sp.sort === "string" ? sp.sort : undefined);
  const page = parsePage(typeof sp.page === "string" ? sp.page : undefined);

  const [result, stats] = await Promise.all([
    getPlayersWithFilters({
      search: q,
      league,
      position,
      cmvRange,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    getPlayerDatabaseStats(),
  ]);

  const deltas = await getCmvDeltaLatestTwoForAthletes(result.players.map((p) => p.id));
  const weeklyDelta = Object.fromEntries(deltas);

  return (
    <PlayersDatabaseClient
      players={result.players}
      totalCount={result.totalCount}
      page={result.page}
      stats={stats}
      weeklyDelta={weeklyDelta}
      initial={{
        search: q,
        league,
        position,
        cmvRange,
        sort,
      }}
    />
  );
}
