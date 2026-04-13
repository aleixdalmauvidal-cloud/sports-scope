import type { PlayerProfile, PlayerRow } from "@/types/database";
import {
  formatCompactNumber,
  formatFollowerGrowthAbsolute,
  formatMarketValueMillions,
  formatPercentValue,
} from "@/lib/format";

/** Shape expected by v0 UI components (hero cards, table, grid, profile). */
export interface Player {
  id: string;
  rank: number;
  name: string;
  club: string;
  /** Club competition (e.g. La Liga); null if unknown */
  league: string | null;
  nationality: string;
  flag: string;
  position: string;
  age: number;
  marketValue: string;
  bgColor: string;
  bgGradient: string;
  photoGradient: string;
  accentColor: string;
  shirtNumber: number;
  calledUp: boolean;
  cmvScore: number;
  /**
   * 0–100: how commercially attractive the player is for a brand deal right now
   * (momentum, brand fit, adjustments, and room before deal saturation).
   */
  opportunityScore: number;
  sportsScore: number;
  socialScore: number;
  commercialScore: number;
  brandFitScore: number;
  momentumScore: number;
  adjustmentsScore: number;
  weeklyChange: number;
  instagram: string;
  instagramGrowth: string;
  tiktok: string;
  tiktokGrowth: string;
  engagementRate: string;
  engagementStatus: string;
  followerGrowth30d: string;
  brandVerticals: string[];
  cmvHistory: number[];
  /** Supabase `athletes.photo_url` (e.g. API-Football). */
  photo_url: string | null;
}

const RANK_ACCENTS = [
  "#2D7A3A",
  "#38A047",
  "#C8D8D4",
  "#7A9490",
  "#2D7A3A",
  "#38A047",
  "#D94F4F",
  "#4A5E58",
] as const;

function accentForRank(rank: number): string {
  const r = rank > 0 ? rank : 1;
  return RANK_ACCENTS[(r - 1) % RANK_ACCENTS.length];
}

/** UK subdivision flags (black flag + tag sequence, UTS #51). */
const FLAG_ENGLAND = String.fromCodePoint(
  0x1f3f4,
  0xe0067,
  0xe0062,
  0xe0065,
  0xe006e,
  0xe0067,
  0xe007f
);
const FLAG_SCOTLAND = String.fromCodePoint(
  0x1f3f4,
  0xe0067,
  0xe0062,
  0xe0073,
  0xe0063,
  0xe0074,
  0xe007f
);
const FLAG_WALES = String.fromCodePoint(
  0x1f3f4,
  0xe0067,
  0xe0062,
  0xe0077,
  0xe006c,
  0xe0073,
  0xe007f
);

/**
 * Demonym and English country names (as stored in Supabase) → flag emoji.
 * Keys must be lowercase after trim.
 */
const NATIONALITY_TO_FLAG: Record<string, string> = {
  // User-specified + common synonyms
  french: "🇫🇷",
  france: "🇫🇷",
  spanish: "🇪🇸",
  spain: "🇪🇸",
  brazilian: "🇧🇷",
  brazil: "🇧🇷",
  norwegian: "🇳🇴",
  norway: "🇳🇴",
  english: FLAG_ENGLAND,
  england: FLAG_ENGLAND,
  egyptian: "🇪🇬",
  egypt: "🇪🇬",
  argentine: "🇦🇷",
  argentinian: "🇦🇷",
  argentina: "🇦🇷",
  german: "🇩🇪",
  germany: "🇩🇪",
  portuguese: "🇵🇹",
  portugal: "🇵🇹",
  dutch: "🇳🇱",
  netherlands: "🇳🇱",
  holland: "🇳🇱",
  belgian: "🇧🇪",
  belgium: "🇧🇪",
  senegalese: "🇸🇳",
  senegal: "🇸🇳",
  croatian: "🇭🇷",
  croatia: "🇭🇷",
  uruguayan: "🇺🇾",
  uruguay: "🇺🇾",
  swedish: "🇸🇪",
  sweden: "🇸🇪",
  swiss: "🇨🇭",
  switzerland: "🇨🇭",
  austrian: "🇦🇹",
  austria: "🇦🇹",
  polish: "🇵🇱",
  poland: "🇵🇱",
  // Common extras (football)
  italian: "🇮🇹",
  italy: "🇮🇹",
  american: "🇺🇸",
  "united states": "🇺🇸",
  usa: "🇺🇸",
  mexican: "🇲🇽",
  mexico: "🇲🇽",
  colombian: "🇨🇴",
  colombia: "🇨🇴",
  chilean: "🇨🇱",
  chile: "🇨🇱",
  peruvian: "🇵🇪",
  peru: "🇵🇪",
  ecuadorian: "🇪🇨",
  ecuador: "🇪🇨",
  venezuelan: "🇻🇪",
  venezuela: "🇻🇪",
  japanese: "🇯🇵",
  japan: "🇯🇵",
  korean: "🇰🇷",
  "south korean": "🇰🇷",
  "south korea": "🇰🇷",
  chinese: "🇨🇳",
  china: "🇨🇳",
  australian: "🇦🇺",
  australia: "🇦🇺",
  canadian: "🇨🇦",
  canada: "🇨🇦",
  moroccan: "🇲🇦",
  morocco: "🇲🇦",
  algerian: "🇩🇿",
  algeria: "🇩🇿",
  tunisian: "🇹🇳",
  tunisia: "🇹🇳",
  nigerian: "🇳🇬",
  nigeria: "🇳🇬",
  ghanaian: "🇬🇭",
  ghana: "🇬🇭",
  cameroonian: "🇨🇲",
  cameroon: "🇨🇲",
  ivorian: "🇨🇮",
  "côte d'ivoire": "🇨🇮",
  "cote d'ivoire": "🇨🇮",
  greek: "🇬🇷",
  greece: "🇬🇷",
  turkish: "🇹🇷",
  turkey: "🇹🇷",
  russian: "🇷🇺",
  russia: "🇷🇺",
  ukrainian: "🇺🇦",
  ukraine: "🇺🇦",
  serbian: "🇷🇸",
  serbia: "🇷🇸",
  bosnian: "🇧🇦",
  bosnia: "🇧🇦",
  slovak: "🇸🇰",
  slovakia: "🇸🇰",
  czech: "🇨🇿",
  "czech republic": "🇨🇿",
  czechia: "🇨🇿",
  hungarian: "🇭🇺",
  hungary: "🇭🇺",
  romanian: "🇷🇴",
  romania: "🇷🇴",
  bulgarian: "🇧🇬",
  bulgaria: "🇧🇬",
  slovenian: "🇸🇮",
  slovenia: "🇸🇮",
  danish: "🇩🇰",
  denmark: "🇩🇰",
  finnish: "🇫🇮",
  finland: "🇫🇮",
  icelandic: "🇮🇸",
  iceland: "🇮🇸",
  irish: "🇮🇪",
  ireland: "🇮🇪",
  welsh: FLAG_WALES,
  wales: FLAG_WALES,
  scottish: FLAG_SCOTLAND,
  scotland: FLAG_SCOTLAND,
  british: "🇬🇧",
  "united kingdom": "🇬🇧",
  uk: "🇬🇧",
  "northern irish": "🇬🇧",
  "northern ireland": "🇬🇧",
  paraguayan: "🇵🇾",
  paraguay: "🇵🇾",
  bolivian: "🇧🇴",
  bolivia: "🇧🇴",
  "costa rican": "🇨🇷",
  "costa rica": "🇨🇷",
  panamanian: "🇵🇦",
  panama: "🇵🇦",
  honduran: "🇭🇳",
  honduras: "🇭🇳",
  salvadoran: "🇸🇻",
  "el salvador": "🇸🇻",
  guatemalan: "🇬🇹",
  guatemala: "🇬🇹",
  jamaican: "🇯🇲",
  jamaica: "🇯🇲",
  "south african": "🇿🇦",
  "south africa": "🇿🇦",
  zambian: "🇿🇲",
  zambia: "🇿🇲",
  kenyan: "🇰🇪",
  kenya: "🇰🇪",
  iranian: "🇮🇷",
  iran: "🇮🇷",
  iraqi: "🇮🇶",
  iraq: "🇮🇶",
  saudi: "🇸🇦",
  "saudi arabian": "🇸🇦",
  "saudi arabia": "🇸🇦",
  emirati: "🇦🇪",
  "united arab emirates": "🇦🇪",
  uae: "🇦🇪",
  qatari: "🇶🇦",
  qatar: "🇶🇦",
  israeli: "🇮🇱",
  israel: "🇮🇱",
  "new zealander": "🇳🇿",
  "new zealand": "🇳🇿",
  georgian: "🇬🇪",
  georgia: "🇬🇪",
  armenian: "🇦🇲",
  armenia: "🇦🇲",
  albanian: "🇦🇱",
  albania: "🇦🇱",
  "north macedonian": "🇲🇰",
  macedonian: "🇲🇰",
  macedonia: "🇲🇰",
  kosovar: "🇽🇰",
  kosovo: "🇽🇰",
  luxembourgish: "🇱🇺",
  luxembourg: "🇱🇺",
  malian: "🇲🇱",
  mali: "🇲🇱",
  gabonese: "🇬🇦",
  gabon: "🇬🇦",
  congolese: "🇨🇩",
  "dr congo": "🇨🇩",
  "democratic republic of the congo": "🇨🇩",
  angolan: "🇦🇴",
  angola: "🇦🇴",
  mozambican: "🇲🇿",
  mozambique: "🇲🇿",
  zimbabwean: "🇿🇼",
  zimbabwe: "🇿🇼",
  togolese: "🇹🇬",
  togo: "🇹🇬",
  burkinabe: "🇧🇫",
  "burkina faso": "🇧🇫",
  "cape verdean": "🇨🇻",
  "cape verde": "🇨🇻",
  "equatorial guinean": "🇬🇶",
  "equatorial guinea": "🇬🇶",
};

function iso2ToRegionalIndicator(code: string): string | null {
  const upper = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return null;
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + upper.charCodeAt(0) - 65,
    A + upper.charCodeAt(1) - 65
  );
}

/**
 * Maps Supabase `nationality` (ISO2 code or English demonym/country name) to a flag emoji.
 */
export function nationalityToFlagEmoji(nationality: string | null | undefined): string {
  if (nationality == null) return "🏳️";
  const trimmed = nationality.trim();
  if (trimmed === "") return "🏳️";

  if (trimmed.length === 2 && /^[A-Za-z]{2}$/.test(trimmed)) {
    const fromIso = iso2ToRegionalIndicator(trimmed);
    if (fromIso) return fromIso;
  }

  const key = trimmed.toLowerCase();
  const mapped = NATIONALITY_TO_FLAG[key];
  if (mapped) return mapped;

  return "🏳️";
}

function roundScore(n: number): number {
  return Math.round(Number.isFinite(n) ? n : 0);
}

/**
 * Opportunity Score (0–100): momentum + brand fit + adjustments + headroom vs commercial saturation.
 * Weights match product spec; computed from the same subscores shown in the UI.
 */
export function computeOpportunityScore(input: {
  momentumScore: number;
  brandFitScore: number;
  adjustmentsScore: number;
  commercialScore: number;
}): number {
  const m = Number.isFinite(input.momentumScore) ? input.momentumScore : 0;
  const b = Number.isFinite(input.brandFitScore) ? input.brandFitScore : 0;
  const a = Number.isFinite(input.adjustmentsScore) ? input.adjustmentsScore : 0;
  const c = Number.isFinite(input.commercialScore) ? input.commercialScore : 0;
  const cClamped = Math.min(100, Math.max(0, c));
  const raw =
    m * 0.35 + b * 0.25 + a * 0.25 + (100 - cClamped) * 0.15;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

/** Accent for OPP badges: high / mid / low. */
export function opportunityScoreAccent(score: number): string {
  if (score >= 80) return "#2D9E50";
  if (score >= 60) return "#38A047";
  return "rgba(255,255,255,0.55)";
}

export function mapPlayerRowToV0Player(row: PlayerRow, rank: number): Player {
  const accent = accentForRank(rank);
  const cmv = roundScore(row.cmv_total);
  const sportsScore = roundScore(row.sports_score);
  const socialScore = roundScore(row.social_score);
  const commercialScore = roundScore(row.commercial_score);
  const brandFitScore = roundScore(row.brand_fit_score);
  const momentumScore = roundScore(row.momentum_score);
  const adjustmentsScore = roundScore(row.adjustment_score);
  const opportunityScore = computeOpportunityScore({
    momentumScore,
    brandFitScore,
    adjustmentsScore,
    commercialScore,
  });
  const nat = row.nationality?.trim() || "—";
  return {
    id: row.id,
    rank,
    name: row.name,
    club: row.club,
    league: row.league ?? null,
    nationality: nat,
    flag: nationalityToFlagEmoji(row.nationality),
    position: row.position,
    age: row.age ?? 0,
    marketValue: "—",
    bgColor: "#0D1110",
    bgGradient: `radial-gradient(circle at 50% 30%, ${accent}66 0%, #0D1110 100%)`,
    photoGradient: `linear-gradient(180deg, ${accent}55 0%, #0D1110 100%)`,
    accentColor: accent,
    shirtNumber: rank,
    calledUp: false,
    cmvScore: cmv,
    opportunityScore,
    sportsScore,
    socialScore,
    commercialScore,
    brandFitScore,
    momentumScore,
    adjustmentsScore,
    weeklyChange: 0,
    instagram: "—",
    instagramGrowth: "—",
    tiktok: "—",
    tiktokGrowth: "—",
    engagementRate: "—",
    engagementStatus: "—",
    followerGrowth30d: "—",
    brandVerticals: [],
    cmvHistory: Array.from({ length: 15 }, () => cmv),
    photo_url: row.photo_url ?? null,
  };
}

export function mapPlayerRowsToV0Players(rows: PlayerRow[]): Player[] {
  return rows.map((row, i) => mapPlayerRowToV0Player(row, i + 1));
}

export function mapPlayerProfileToV0Player(profile: PlayerProfile): Player {
  const rank = profile.cmv_rank && profile.cmv_rank > 0 ? profile.cmv_rank : 1;
  const rowLike: PlayerRow = {
    id: profile.id,
    name: profile.name,
    club: profile.club,
    league: profile.league,
    position: profile.position,
    sports_score: profile.sports_score,
    social_score: profile.social_score,
    commercial_score: profile.commercial_score,
    brand_fit_score: profile.brand_fit_score,
    momentum_score: profile.momentum_score,
    adjustment_score: profile.adjustment_score,
    cmv_total: profile.cmv_total,
    nationality: profile.nationality,
    age: profile.age ?? undefined,
    photo_url: profile.photo_url,
  };
  const base = mapPlayerRowToV0Player(rowLike, rank);
  const sm = profile.social_metrics;
  const sp = profile.sports_metrics;
  const er = sm?.engagement_rate;
  return {
    ...base,
    age: profile.age ?? 0,
    marketValue: formatMarketValueMillions(sp?.market_value_millions),
    nationality: profile.nationality?.trim() || base.nationality,
    flag: nationalityToFlagEmoji(profile.nationality),
    instagram: formatCompactNumber(sm?.instagram_followers),
    tiktok: formatCompactNumber(sm?.tiktok_followers),
    instagramGrowth: "—",
    tiktokGrowth: "—",
    engagementRate: formatPercentValue(er),
    engagementStatus:
      er != null && Number.isFinite(Number(er)) && Number(er) >= 3
        ? "above avg"
        : er != null && Number.isFinite(Number(er))
          ? "typical"
          : "—",
    followerGrowth30d: formatFollowerGrowthAbsolute(sm?.followers_growth_30d),
  };
}
