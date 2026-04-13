import type { Player } from "@/lib/v0-player";

export const LEAGUE_OPTIONS = [
  "All",
  "LaLiga",
  "Premier League",
  "Ligue 1",
  "Bundesliga",
  "Serie A",
] as const;

export type LeagueFilterValue = (typeof LEAGUE_OPTIONS)[number];

export const POSITION_OPTIONS = ["All", "Forward", "Midfielder", "Defender", "Goalkeeper"] as const;
export type PositionFilterValue = (typeof POSITION_OPTIONS)[number];

export const CMV_RANGE_OPTIONS = [
  { value: "all" as const, label: "All" },
  { value: "80plus" as const, label: "80+" },
  { value: "60-80" as const, label: "60–80" },
  { value: "40-60" as const, label: "40–60" },
  { value: "under40" as const, label: "Under 40" },
];

export type CmvRangeValue = (typeof CMV_RANGE_OPTIONS)[number]["value"];

export const SORT_OPTIONS = [
  { value: "cmv" as const, label: "CMV Score" },
  { value: "sports" as const, label: "Sports Value" },
  { value: "social" as const, label: "Social Score" },
  { value: "commercial" as const, label: "Commercial Score" },
  { value: "momentum" as const, label: "Momentum" },
  { value: "risers" as const, label: "Biggest Risers (7d)" },
] as const;

export type SortOptionValue = (typeof SORT_OPTIONS)[number]["value"];

/** Substrings to match against `player.league` (lowercased). */
const LEAGUE_SUBSTRINGS: Record<Exclude<LeagueFilterValue, "All">, string[]> = {
  LaLiga: ["la liga", "laliga", "primera división", "primera division", "laliga ea sports"],
  "Premier League": ["premier league", "english premier league", "epl"],
  "Ligue 1": ["ligue 1", "ligue1", "ligue mcdonald"],
  Bundesliga: ["bundesliga", "1. bundesliga", "fußball-bundesliga"],
  "Serie A": ["serie a", "italian serie a", "serie a tim", "serie a enilive"],
};

const POSITION_TOKENS: Record<Exclude<PositionFilterValue, "All">, string[]> = {
  Forward: ["fw", "forward", "f", "del", "st", "cf", "lw", "rw", "ss", "att"],
  Midfielder: ["mf", "mid", "med", "midfielder", "cm", "dm", "cdm", "am", "cam", "lm", "rm", "wm"],
  Defender: ["df", "def", "defender", "cb", "lb", "rb", "wb", "lwb", "rwb", "sw", "dfc"],
  Goalkeeper: ["gk", "goalkeeper", "keeper", "por", "gk"],
};

function normLeague(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

function normPosition(s: string): string {
  return s.trim().toLowerCase().replace(/\./g, "");
}

export function leagueMatchesFilter(
  league: string | null | undefined,
  filterLeague: LeagueFilterValue
): boolean {
  if (filterLeague === "All") return true;
  const hay = normLeague(league);
  if (!hay) return false;
  const needles = LEAGUE_SUBSTRINGS[filterLeague];
  const compact = hay.replace(/\s+/g, "");
  return needles.some((n) => hay.includes(n) || compact.includes(n.replace(/\s+/g, "")));
}

export function playerMatchesLeague(player: Player, filterLeague: LeagueFilterValue): boolean {
  return leagueMatchesFilter(player.league, filterLeague);
}

export function positionMatchesFilter(position: string, filterPos: PositionFilterValue): boolean {
  if (filterPos === "All") return true;
  const p = normPosition(position);
  if (!p) return false;
  const tokens = POSITION_TOKENS[filterPos];
  return tokens.some((t) => p === t || p.startsWith(`${t} `) || p.includes(` ${t}`) || p.endsWith(t));
}

export function playerMatchesPosition(player: Player, filterPos: PositionFilterValue): boolean {
  return positionMatchesFilter(player.position, filterPos);
}

/** Etiqueta corta de posición para tablas densas (FW / MF / DF / GK). */
export function abbreviatePositionLabel(position: string): string {
  const p = position?.trim();
  if (!p) return "—";
  if (positionMatchesFilter(p, "Goalkeeper")) return "GK";
  if (positionMatchesFilter(p, "Defender")) return "DF";
  if (positionMatchesFilter(p, "Midfielder")) return "MF";
  if (positionMatchesFilter(p, "Forward")) return "FW";
  return p;
}

export function playerMatchesCmvRange(player: Player, range: CmvRangeValue): boolean {
  const s = player.cmvScore;
  switch (range) {
    case "all":
      return true;
    case "80plus":
      return s >= 80;
    case "60-80":
      return s >= 60 && s < 80;
    case "40-60":
      return s >= 40 && s < 60;
    case "under40":
      return s < 40;
    default:
      return true;
  }
}

export function playerMatchesSearch(player: Player, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    player.name.toLowerCase().includes(q) ||
    player.club.toLowerCase().includes(q) ||
    String(player.cmvScore).includes(q)
  );
}

export function applyRankingFilters(
  players: Player[],
  opts: {
    search: string;
    league: LeagueFilterValue;
    position: PositionFilterValue;
    cmvRange: CmvRangeValue;
  }
): Player[] {
  return players.filter(
    (p) =>
      playerMatchesSearch(p, opts.search) &&
      playerMatchesLeague(p, opts.league) &&
      playerMatchesPosition(p, opts.position) &&
      playerMatchesCmvRange(p, opts.cmvRange)
  );
}

export function sortRankingPlayers(players: Player[], sort: SortOptionValue): Player[] {
  const arr = [...players];
  switch (sort) {
    case "cmv":
      arr.sort((a, b) => b.cmvScore - a.cmvScore);
      break;
    case "sports":
      arr.sort((a, b) => b.sportsScore - a.sportsScore);
      break;
    case "social":
      arr.sort((a, b) => b.socialScore - a.socialScore);
      break;
    case "commercial":
      arr.sort((a, b) => b.commercialScore - a.commercialScore);
      break;
    case "momentum":
      arr.sort((a, b) => b.momentumScore - a.momentumScore);
      break;
    case "risers":
      arr.sort((a, b) => b.weeklyChange - a.weeklyChange);
      break;
    default:
      break;
  }
  return arr;
}

export function hasNonDefaultRankingFilters(opts: {
  search: string;
  league: LeagueFilterValue;
  position: PositionFilterValue;
  cmvRange: CmvRangeValue;
  sort: SortOptionValue;
}): boolean {
  return (
    opts.search.trim() !== "" ||
    opts.league !== "All" ||
    opts.position !== "All" ||
    opts.cmvRange !== "all" ||
    opts.sort !== "cmv"
  );
}
