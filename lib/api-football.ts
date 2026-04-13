/**
 * API-Football (api-sports.io) client — server / scripts only.
 * Auth via RapidAPI-style headers; key from env only.
 */

const DEFAULT_BASE = "https://v3.football.api-sports.io";
const RAPIDAPI_HOST = "v3.football.api-sports.io";

/** Big-five league ids (API-Football). */
export const API_FOOTBALL_LEAGUE_IDS = {
  laLiga: 140,
  premierLeague: 39,
  ligue1: 61,
  bundesliga: 78,
  serieA: 135,
} as const;

export type ApiFootballLeagueKey = keyof typeof API_FOOTBALL_LEAGUE_IDS;

/** Map free-text league labels (Supabase `clubs.league`) to API league id. */
export function resolveLeagueIdFromLabel(league: string | null | undefined): number | null {
  if (league == null || league.trim() === "") return null;
  const s = league.toLowerCase().trim();
  if (s.includes("la liga") || s.includes("laliga")) return API_FOOTBALL_LEAGUE_IDS.laLiga;
  if (s.includes("premier")) return API_FOOTBALL_LEAGUE_IDS.premierLeague;
  if (s.includes("ligue 1") || s.includes("ligue1") || s.includes("ligue-1"))
    return API_FOOTBALL_LEAGUE_IDS.ligue1;
  if (s.includes("bundesliga")) return API_FOOTBALL_LEAGUE_IDS.bundesliga;
  if (s.includes("serie a") || s.includes("serie-a") || s === "serie a")
    return API_FOOTBALL_LEAGUE_IDS.serieA;
  return null;
}

/**
 * Build an absolute URL for the API-Football host.
 * The hostname already includes `v3` (e.g. https://v3.football.api-sports.io); paths are `/players`, `/players/topscorers`, etc. — no extra `/v3` segment.
 * If `API_FOOTBALL_URL` mistakenly ends with `/v3`, it is stripped.
 */
export function buildUrl(
  path: string,
  query: Record<string, string | number | boolean | undefined | null>
): string {
  const rawBase = (process.env.API_FOOTBALL_URL || DEFAULT_BASE).replace(/\/$/, "");
  const base = rawBase.replace(/\/v3\/?$/, "");
  const pathPart = path.startsWith("/") ? path : `/${path}`;
  const u = new URL(`${base}${pathPart}`);
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

function apiHeaders(): HeadersInit {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key || key.trim() === "") {
    throw new Error("API_FOOTBALL_KEY is not set");
  }
  return {
    "x-rapidapi-key": key,
    "x-rapidapi-host": RAPIDAPI_HOST,
  };
}

export type ApiFootballEnvelope<T> = {
  get?: string;
  errors?: Record<string, unknown> | unknown[];
  results?: number;
  paging?: { current?: number; total?: number };
  response?: T;
};

async function apiGet<T>(path: string, query: Record<string, string | number | undefined | null>): Promise<T> {
  const url = buildUrl(path, query);
  console.log("[api-football] GET", url);
  const res = await fetch(url, { headers: apiHeaders(), cache: "no-store" });
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`API-Football: invalid JSON (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(`API-Football HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  const env = body as ApiFootballEnvelope<T>;
  if (env.errors) {
    const err = env.errors;
    const msg =
      Array.isArray(err) && err.length
        ? JSON.stringify(err[0])
        : typeof err === "object" && err !== null && Object.keys(err as object).length > 0
          ? JSON.stringify(err)
          : null;
    if (msg) throw new Error(`API-Football errors: ${msg}`);
  }
  return (env.response ?? []) as T;
}

/** Raw item from /players (search or id). */
export type ApiPlayerBundle = {
  player?: {
    id?: number;
    name?: string;
    firstname?: string;
    lastname?: string;
    nationality?: string;
    photo?: string;
    position?: string;
    age?: number;
  };
  statistics?: ApiStatistic[];
};

export type ApiStatistic = {
  team?: { id?: number; name?: string; logo?: string };
  league?: { id?: number; name?: string; country?: string };
  games?: {
    appearences?: number | null;
    appearances?: number | null;
    minutes?: number | null;
    rating?: string | number | null;
    position?: string | null;
  };
  goals?: {
    total?: number | null;
    assists?: number | null;
  };
  passes?: {
    total?: number | null;
    accuracy?: number | string | null;
  };
};

export type ParsedPlayerSeasonStats = {
  apiFootballPlayerId: number;
  /** From API `response[0].player.photo` (e.g. media.api-sports.io). */
  photoUrl: string | null;
  goals: number;
  assists: number;
  minutesPlayed: number;
  matchesPlayed: number;
  passAccuracy: number | null;
  rating: number | null;
  teamName: string | null;
  leagueId: number | null;
};

function parseIntSafe(v: unknown, fallback = 0): number {
  if (v == null || v === "") return fallback;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseFloatSafe(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parsePassAccuracy(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).replace("%", "").trim();
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function appearancesFromGames(games: ApiStatistic["games"]): number {
  if (!games) return 0;
  const a = games.appearances ?? games.appearences;
  return parseIntSafe(a, 0);
}

function normalizeToken(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Infer La Liga (140) from club name when `clubs.league` is missing or ambiguous.
 * Matches common Spanish / La Liga club tokens (e.g. Atlético Madrid, Barcelona).
 */
export function resolveLeagueIdFromSpanishClub(club: string | null | undefined): number | null {
  if (club == null || club.trim() === "") return null;
  const n = normalizeToken(club);
  if (n.length < 3) return null;
  const markers = [
    "atletico",
    "barcelona",
    "sevilla",
    "valencia",
    "villarreal",
    "betis",
    "getafe",
    "celta",
    "osasuna",
    "mallorca",
    "majorca",
    "girona",
    "alaves",
    "espanyol",
    "las palmas",
    "cadiz",
    "granada",
    "vallecano",
    "almeria",
    "leganes",
    "valladolid",
    "eibar",
    "elche",
    "huesca",
    "sociedad",
    "bilbao",
    "real madrid",
    "athletic",
  ];
  for (const m of markers) {
    const mNorm = normalizeToken(m);
    if (mNorm.length >= 2 && n.includes(mNorm)) return API_FOOTBALL_LEAGUE_IDS.laLiga;
  }
  return null;
}

/** Resolved API league id from DB league label, else from Spanish club name. */
export function resolveLeagueIdForAthlete(
  leagueLabel: string | null | undefined,
  club: string
): number | null {
  return resolveLeagueIdFromLabel(leagueLabel) ?? resolveLeagueIdFromSpanishClub(club);
}

/**
 * League ids to try for `/players?search=…` (API requires `league` or `team`).
 * Order: primary resolution, then La Liga (140), then Premier (39) if not already included.
 */
export function leagueIdsForPlayerSearch(leagueLabel: string | null, club: string): number[] {
  const primary = resolveLeagueIdForAthlete(leagueLabel, club);
  const out: number[] = [];
  if (primary != null) out.push(primary);
  const fallbacks = [API_FOOTBALL_LEAGUE_IDS.laLiga, API_FOOTBALL_LEAGUE_IDS.premierLeague];
  for (const id of fallbacks) {
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

/** Score how well an API team name matches our club label (0–100+). */
function clubMatchScore(apiTeamName: string | undefined, ourClub: string): number {
  if (!apiTeamName || !ourClub) return 0;
  const a = normalizeToken(apiTeamName);
  const b = normalizeToken(ourClub);
  if (a.length < 2 || b.length < 2) return 0;
  if (a === b) return 100;
  if (a.includes(b) || b.includes(a)) return 80;
  const aw = new Set(a.split(" ").filter((w) => w.length > 2));
  const bw = new Set(b.split(" ").filter((w) => w.length > 2));
  let hit = 0;
  for (const w of bw) {
    if (aw.has(w)) hit += 1;
  }
  if (bw.size === 0) return 0;
  return Math.round((hit / bw.size) * 60);
}

/**
 * Pick the statistics row that best matches our athlete's club + league.
 */
export function pickStatisticForClub(
  statistics: ApiStatistic[] | undefined,
  club: string,
  preferredLeagueId: number | null
): ApiStatistic | null {
  const list = Array.isArray(statistics) ? statistics : [];
  if (list.length === 0) return null;
  if (list.length === 1) return list[0] ?? null;

  let best: ApiStatistic | null = null;
  let bestScore = -1;

  for (const st of list) {
    const lid = st.league?.id ?? null;
    const leagueBonus = preferredLeagueId != null && lid === preferredLeagueId ? 50 : 0;
    const team = st.team?.name ?? "";
    const cm = clubMatchScore(team, club);
    const score = leagueBonus + cm;
    if (score > bestScore) {
      bestScore = score;
      best = st;
    }
  }

  return best ?? list[0] ?? null;
}

/** When there is no club filter (e.g. GET by player id), prefer the row with the most minutes. */
export function pickBestStatisticRow(statistics: ApiStatistic[] | undefined): ApiStatistic | null {
  const list = Array.isArray(statistics) ? statistics : [];
  if (list.length === 0) return null;
  if (list.length === 1) return list[0] ?? null;
  let best: ApiStatistic = list[0]!;
  let bestMin = -1;
  for (const st of list) {
    const m = parseIntSafe(st.games?.minutes, 0);
    if (m > bestMin) {
      bestMin = m;
      best = st;
    }
  }
  return best;
}

function bundleToParsed(
  bundle: ApiPlayerBundle,
  stat: ApiStatistic | null,
  explicitPlayerId?: number
): ParsedPlayerSeasonStats | null {
  const pid = explicitPlayerId ?? bundle.player?.id;
  if (pid == null || !Number.isFinite(Number(pid))) return null;
  if (!stat) return null;

  const games = stat.games || {};
  const goals = stat.goals || {};
  const passes = stat.passes || {};

  const rating = parseFloatSafe(games.rating);
  const passAccuracy = parsePassAccuracy(passes.accuracy);
  const rawPhoto = bundle.player?.photo;
  const photoUrl =
    typeof rawPhoto === "string" && rawPhoto.trim() !== "" ? rawPhoto.trim() : null;

  return {
    apiFootballPlayerId: Number(pid),
    photoUrl,
    goals: parseIntSafe(goals.total, 0),
    assists: parseIntSafe(goals.assists, 0),
    minutesPlayed: parseIntSafe(games.minutes, 0),
    matchesPlayed: appearancesFromGames(games),
    passAccuracy,
    rating,
    teamName: stat.team?.name ?? null,
    leagueId: stat.league?.id ?? null,
  };
}

/**
 * GET /v3/players?id={playerId}&season={season}
 */
export async function getPlayerStats(
  playerId: number,
  season: number
): Promise<ParsedPlayerSeasonStats | null> {
  const rows = await apiGet<ApiPlayerBundle[]>("/players", {
    id: playerId,
    season,
  });
  const bundle = rows[0];
  if (!bundle?.player?.id) return null;
  const stat = pickBestStatisticRow(bundle.statistics);
  const chosen = stat ?? bundle.statistics?.[0] ?? null;
  return bundleToParsed(bundle, chosen, playerId);
}

export type SearchPlayerHit = {
  playerId: number;
  name: string;
  statistics: ApiStatistic[] | undefined;
};

/**
 * GET /players?search={name}&season={season}&league={leagueId}
 * API-Football requires `league` or `team` when using `search`; pass `leagueId` when known.
 */
export async function searchPlayer(
  name: string,
  season: number,
  leagueId?: number | null
): Promise<SearchPlayerHit[]> {
  const trimmed = name.trim();
  if (!trimmed) return [];

  const query: Record<string, string | number | undefined | null> = {
    search: trimmed,
    season,
  };
  if (leagueId != null && Number.isFinite(Number(leagueId))) {
    query.league = Number(leagueId);
  }

  const rows = await apiGet<ApiPlayerBundle[]>("/players", query);

  const out: SearchPlayerHit[] = [];
  for (const row of rows) {
    const id = row.player?.id;
    const n = row.player?.name;
    if (id == null || n == null) continue;
    out.push({
      playerId: Number(id),
      name: n,
      statistics: row.statistics,
    });
  }
  return out;
}

export type TopScorerRow = {
  player: { id?: number; name?: string; firstname?: string; lastname?: string };
  statistics?: ApiStatistic[];
  goals?: { total?: number | null };
};

/**
 * GET /v3/players/topscorers?league={leagueId}&season={season}
 */
export async function getTopPlayersByLeague(
  leagueId: number,
  season: number
): Promise<TopScorerRow[]> {
  return apiGet<TopScorerRow[]>("/players/topscorers", {
    league: leagueId,
    season,
  });
}

/** How well a search result matches our club + league (for disambiguation). */
export function scoreSearchPlayerHit(
  hit: SearchPlayerHit,
  club: string,
  leagueLabel: string | null
): number {
  const leagueId = resolveLeagueIdForAthlete(leagueLabel, club);
  const stat = pickStatisticForClub(hit.statistics, club, leagueId);
  const leagueBonus = leagueId != null && stat?.league?.id === leagueId ? 50 : 0;
  const cm = clubMatchScore(stat?.team?.name, club);
  return leagueBonus + cm;
}

/**
 * Full season stats for one API player id, choosing the statistics row for the given club/league.
 */
export async function getPlayerStatsForClub(
  playerId: number,
  club: string,
  leagueLabel: string | null,
  season: number
): Promise<ParsedPlayerSeasonStats | null> {
  const rows = await apiGet<ApiPlayerBundle[]>("/players", {
    id: playerId,
    season,
  });
  const bundle = rows[0];
  if (!bundle?.player?.id) return null;
  const leagueId = resolveLeagueIdForAthlete(leagueLabel, club);
  let stat = pickStatisticForClub(bundle.statistics, club, leagueId);
  if (!stat) stat = pickBestStatisticRow(bundle.statistics);
  if (!stat) stat = bundle.statistics?.[0] ?? null;
  return bundleToParsed(bundle, stat, playerId);
}
