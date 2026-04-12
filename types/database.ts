/** Vista aplanada para ranking y perfil (UI) */
export type PlayerRow = {
  id: string;
  name: string;
  club: string;
  /** Liga del club (ej. La Liga) */
  league: string | null;
  position: string;
  sports_score: number;
  social_score: number;
  commercial_score: number;
  brand_fit_score: number;
  momentum_score: number;
  adjustment_score: number;
  cmv_total: number;
  nationality?: string | null;
  age?: number | null;
  photo_url?: string | null;
};

export type AthleteRow = {
  id: string;
  name: string;
  position: string;
  nationality: string | null;
  club_id: string;
  age?: number | null;
  photo_url?: string | null;
};

export type ClubRow = {
  id: string;
  name: string;
  league: string | null;
};

export type CmvScoreRow = {
  athlete_id: string;
  date: string;
  sports_score: number;
  social_score: number;
  commercial_score: number;
  brand_fit_score: number;
  momentum_score: number;
  adjustment_score: number;
  cmv_total: number;
};

/** Fila en sports_metrics (valores esperados en Supabase) */
export type SportsMetricsRow = {
  athlete_id: string;
  date: string;
  season?: number | null;
  /** Derivado en UI desde `market_value` (€) ÷ 1e6 o columnas legacy */
  market_value_millions?: number | null;
  minutes_played?: number | null;
  goals?: number | null;
  assists?: number | null;
  /** API-Football / Supabase: suele venir de `form_rating` */
  rating?: number | null;
};

/** Fila en social_metrics (valores esperados en Supabase) */
export type SocialMetricsRow = {
  athlete_id: string;
  date?: string | null;
  /** Normalizado desde `ig_followers` */
  instagram_followers?: number | null;
  /** Normalizado desde `tt_followers` */
  tiktok_followers?: number | null;
  engagement_rate?: number | null;
  avg_views_per_post?: number | null;
  /** Normalizado desde `follower_growth_30d` (seguidores absolutos, no %) */
  followers_growth_30d?: number | null;
};

/** Perfil completo para /player/[id] */
export type PlayerProfile = {
  id: string;
  name: string;
  club: string;
  league: string | null;
  /** Posición en ranking CMV global (1 = primero); null si fuera del top consultado */
  cmv_rank: number | null;
  position: string;
  nationality: string | null;
  age: number | null;
  photo_url: string | null;
  sports_score: number;
  social_score: number;
  commercial_score: number;
  brand_fit_score: number;
  momentum_score: number;
  adjustment_score: number;
  cmv_total: number;
  sports_metrics: SportsMetricsRow | null;
  social_metrics: SocialMetricsRow | null;
};

/** Respuesta anidada de PostgREST al seleccionar desde `cmv_scores` */
export type CmvScoreWithAthleteClub = {
  sports_score: number;
  social_score: number;
  commercial_score: number;
  brand_fit_score: number;
  momentum_score: number;
  adjustment_score: number;
  cmv_total: number;
  date: string;
  athletes: {
    id: string;
    name: string;
    position: string;
    nationality: string | null;
    photo_url: string | null;
    clubs: Pick<ClubRow, "name" | "league"> | null;
  };
};

export type Database = {
  public: {
    Tables: {
      athletes: {
        Row: AthleteRow;
        Insert: Omit<AthleteRow, "id"> & { id?: string };
        Update: Partial<AthleteRow>;
      };
      clubs: {
        Row: ClubRow;
        Insert: Omit<ClubRow, "id"> & { id?: string };
        Update: Partial<ClubRow>;
      };
      cmv_scores: {
        Row: CmvScoreRow;
        Insert: {
          athlete_id: string;
          date: string;
          sports_score?: number;
          social_score?: number;
          commercial_score?: number;
          brand_fit_score?: number;
          momentum_score?: number;
          adjustment_score?: number;
          cmv_total?: number;
        };
        Update: Partial<CmvScoreRow>;
      };
      sports_metrics: {
        Row: SportsMetricsRow;
        Insert: Omit<SportsMetricsRow, never> & { athlete_id: string; date: string };
        Update: Partial<SportsMetricsRow>;
      };
      social_metrics: {
        Row: SocialMetricsRow;
        Insert: Omit<SocialMetricsRow, never> & { athlete_id: string };
        Update: Partial<SocialMetricsRow>;
      };
    };
  };
};
