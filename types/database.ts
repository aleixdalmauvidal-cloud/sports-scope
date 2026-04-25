export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      athletes: {
        Row: {
          age: number | null
          api_football_player_id: number | null
          club_id: string | null
          created_at: string | null
          date_of_birth: string | null
          id: string
          instagram_handle: string | null
          is_active: boolean | null
          name: string
          nationality: string | null
          photo_url: string | null
          position: string | null
          status: string | null
          tiktok_handle: string | null
          x_handle: string | null
          yt_handle: string | null
        }
        Insert: {
          age?: number | null
          api_football_player_id?: number | null
          club_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          name: string
          nationality?: string | null
          photo_url?: string | null
          position?: string | null
          status?: string | null
          tiktok_handle?: string | null
          x_handle?: string | null
          yt_handle?: string | null
        }
        Update: {
          age?: number | null
          api_football_player_id?: number | null
          club_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          name?: string
          nationality?: string | null
          photo_url?: string | null
          position?: string | null
          status?: string | null
          tiktok_handle?: string | null
          x_handle?: string | null
          yt_handle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athletes_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_fit: {
        Row: {
          athlete_id: string | null
          brand_safety_score: number | null
          created_at: string | null
          date: string
          fit_betting: number | null
          fit_sportswear: number | null
          id: string
          lifestyle_score: number | null
        }
        Insert: {
          athlete_id?: string | null
          brand_safety_score?: number | null
          created_at?: string | null
          date: string
          fit_betting?: number | null
          fit_sportswear?: number | null
          id?: string
          lifestyle_score?: number | null
        }
        Update: {
          athlete_id?: string | null
          brand_safety_score?: number | null
          created_at?: string | null
          date?: string
          fit_betting?: number | null
          fit_sportswear?: number | null
          id?: string
          lifestyle_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_fit_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_signals: {
        Row: {
          athlete_id: string | null
          brand_safety_score: number | null
          brand_verticals: string[] | null
          branded_posts_count: number | null
          brands_detected: string[] | null
          campaign_types: string[] | null
          created_at: string | null
          data_sources: string[] | null
          date: string
          discovered_sponsors: Json | null
          discovery_confidence: number | null
          id: string
          news_headlines: string[] | null
          sponsor_discovery_ran_at: string | null
          sponsorship_density: number | null
          unique_brands_count: number | null
          wikipedia_sponsors: string[] | null
        }
        Insert: {
          athlete_id?: string | null
          brand_safety_score?: number | null
          brand_verticals?: string[] | null
          branded_posts_count?: number | null
          brands_detected?: string[] | null
          campaign_types?: string[] | null
          created_at?: string | null
          data_sources?: string[] | null
          date: string
          discovered_sponsors?: Json | null
          discovery_confidence?: number | null
          id?: string
          news_headlines?: string[] | null
          sponsor_discovery_ran_at?: string | null
          sponsorship_density?: number | null
          unique_brands_count?: number | null
          wikipedia_sponsors?: string[] | null
        }
        Update: {
          athlete_id?: string | null
          brand_safety_score?: number | null
          brand_verticals?: string[] | null
          branded_posts_count?: number | null
          brands_detected?: string[] | null
          campaign_types?: string[] | null
          created_at?: string | null
          data_sources?: string[] | null
          date?: string
          discovered_sponsors?: Json | null
          discovery_confidence?: number | null
          id?: string
          news_headlines?: string[] | null
          sponsor_discovery_ran_at?: string | null
          sponsorship_density?: number | null
          unique_brands_count?: number | null
          wikipedia_sponsors?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_signals_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          api_football_team_id: number | null
          country: string | null
          created_at: string | null
          id: string
          league: string | null
          logo_url: string | null
          name: string
          tier: number | null
        }
        Insert: {
          api_football_team_id?: number | null
          country?: string | null
          created_at?: string | null
          id?: string
          league?: string | null
          logo_url?: string | null
          name: string
          tier?: number | null
        }
        Update: {
          api_football_team_id?: number | null
          country?: string | null
          created_at?: string | null
          id?: string
          league?: string | null
          logo_url?: string | null
          name?: string
          tier?: number | null
        }
        Relationships: []
      }
      cmv_history: {
        Row: {
          athlete_id: string | null
          cmv_total: number | null
          created_at: string | null
          date: string
          delta_30d: number | null
          delta_7d: number | null
          id: string
        }
        Insert: {
          athlete_id?: string | null
          cmv_total?: number | null
          created_at?: string | null
          date: string
          delta_30d?: number | null
          delta_7d?: number | null
          id?: string
        }
        Update: {
          athlete_id?: string | null
          cmv_total?: number | null
          created_at?: string | null
          date?: string
          delta_30d?: number | null
          delta_7d?: number | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cmv_history_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      cmv_scores: {
        Row: {
          adjustment_score: number | null
          athlete_id: string | null
          brand_fit_score: number | null
          cmv_total: number | null
          commercial_score: number | null
          created_at: string | null
          date: string
          id: string
          momentum_score: number | null
          score_version: string | null
          social_score: number | null
          sports_score: number | null
        }
        Insert: {
          adjustment_score?: number | null
          athlete_id?: string | null
          brand_fit_score?: number | null
          cmv_total?: number | null
          commercial_score?: number | null
          created_at?: string | null
          date: string
          id?: string
          momentum_score?: number | null
          score_version?: string | null
          social_score?: number | null
          sports_score?: number | null
        }
        Update: {
          adjustment_score?: number | null
          athlete_id?: string | null
          brand_fit_score?: number | null
          cmv_total?: number | null
          commercial_score?: number | null
          created_at?: string | null
          date?: string
          id?: string
          momentum_score?: number | null
          score_version?: string | null
          social_score?: number | null
          sports_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cmv_scores_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          athlete_id: string | null
          created_at: string | null
          id: string
          last_updated: string | null
          raw_data: Json | null
          source_name: string
          source_type: string
          status: string | null
        }
        Insert: {
          athlete_id?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          raw_data?: Json | null
          source_name: string
          source_type: string
          status?: string | null
        }
        Update: {
          athlete_id?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          raw_data?: Json | null
          source_name?: string
          source_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_sources_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      rankings: {
        Row: {
          athlete_id: string | null
          cmv_total: number | null
          created_at: string | null
          date: string
          id: string
          league_rank: number | null
          movement: number | null
          position_rank: number | null
          rank_position: number | null
        }
        Insert: {
          athlete_id?: string | null
          cmv_total?: number | null
          created_at?: string | null
          date: string
          id?: string
          league_rank?: number | null
          movement?: number | null
          position_rank?: number | null
          rank_position?: number | null
        }
        Update: {
          athlete_id?: string | null
          cmv_total?: number | null
          created_at?: string | null
          date?: string
          id?: string
          league_rank?: number | null
          movement?: number | null
          position_rank?: number | null
          rank_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rankings_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      social_metrics: {
        Row: {
          athlete_id: string | null
          avg_comments: number | null
          avg_likes: number | null
          avg_saves: number | null
          avg_views: number | null
          created_at: string | null
          date: string
          engagement_rate: number | null
          follower_growth_30d: number | null
          id: string
          ig_followers: number | null
          latest_post_captions: string[] | null
          posting_frequency: number | null
          tt_avg_views: number | null
          tt_followers: number | null
          x_followers: number | null
          x_growth_30d: number | null
          yt_avg_views: number | null
          yt_growth_30d: number | null
          yt_subscribers: number | null
        }
        Insert: {
          athlete_id?: string | null
          avg_comments?: number | null
          avg_likes?: number | null
          avg_saves?: number | null
          avg_views?: number | null
          created_at?: string | null
          date: string
          engagement_rate?: number | null
          follower_growth_30d?: number | null
          id?: string
          ig_followers?: number | null
          latest_post_captions?: string[] | null
          posting_frequency?: number | null
          tt_avg_views?: number | null
          tt_followers?: number | null
          x_followers?: number | null
          x_growth_30d?: number | null
          yt_avg_views?: number | null
          yt_growth_30d?: number | null
          yt_subscribers?: number | null
        }
        Update: {
          athlete_id?: string | null
          avg_comments?: number | null
          avg_likes?: number | null
          avg_saves?: number | null
          avg_views?: number | null
          created_at?: string | null
          date?: string
          engagement_rate?: number | null
          follower_growth_30d?: number | null
          id?: string
          ig_followers?: number | null
          latest_post_captions?: string[] | null
          posting_frequency?: number | null
          tt_avg_views?: number | null
          tt_followers?: number | null
          x_followers?: number | null
          x_growth_30d?: number | null
          yt_avg_views?: number | null
          yt_growth_30d?: number | null
          yt_subscribers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_metrics_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_valuations: {
        Row: {
          athlete_id: string | null
          comparable_athletes: Json | null
          created_at: string | null
          date: string
          id: string
          key_factors: Json | null
          reasoning: string | null
          valuation_ambassador_max: number | null
          valuation_ambassador_min: number | null
          valuation_annual_max: number | null
          valuation_annual_min: number | null
          valuation_event_max: number | null
          valuation_event_min: number | null
          valuation_per_post_max: number | null
          valuation_per_post_min: number | null
        }
        Insert: {
          athlete_id?: string | null
          comparable_athletes?: Json | null
          created_at?: string | null
          date: string
          id?: string
          key_factors?: Json | null
          reasoning?: string | null
          valuation_ambassador_max?: number | null
          valuation_ambassador_min?: number | null
          valuation_annual_max?: number | null
          valuation_annual_min?: number | null
          valuation_event_max?: number | null
          valuation_event_min?: number | null
          valuation_per_post_max?: number | null
          valuation_per_post_min?: number | null
        }
        Update: {
          athlete_id?: string | null
          comparable_athletes?: Json | null
          created_at?: string | null
          date?: string
          id?: string
          key_factors?: Json | null
          reasoning?: string | null
          valuation_ambassador_max?: number | null
          valuation_ambassador_min?: number | null
          valuation_annual_max?: number | null
          valuation_annual_min?: number | null
          valuation_event_max?: number | null
          valuation_event_min?: number | null
          valuation_per_post_max?: number | null
          valuation_per_post_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_valuations_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_metrics: {
        Row: {
          api_football_id: number | null
          assists: number | null
          athlete_id: string | null
          created_at: string | null
          date: string
          form_rating: number | null
          goals: number | null
          id: string
          market_value: number | null
          matches_played: number | null
          minutes_played: number | null
          pass_accuracy: number | null
          rating: number | null
          season: number | null
        }
        Insert: {
          api_football_id?: number | null
          assists?: number | null
          athlete_id?: string | null
          created_at?: string | null
          date: string
          form_rating?: number | null
          goals?: number | null
          id?: string
          market_value?: number | null
          matches_played?: number | null
          minutes_played?: number | null
          pass_accuracy?: number | null
          rating?: number | null
          season?: number | null
        }
        Update: {
          api_football_id?: number | null
          assists?: number | null
          athlete_id?: string | null
          created_at?: string | null
          date?: string
          form_rating?: number | null
          goals?: number | null
          id?: string
          market_value?: number | null
          matches_played?: number | null
          minutes_played?: number | null
          pass_accuracy?: number | null
          rating?: number | null
          season?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sports_metrics_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type PlayerRow = {
  id: string
  name: string
  club: string
  league: string | null
  position: string
  sports_score: number
  social_score: number
  commercial_score: number
  brand_fit_score: number
  momentum_score: number
  adjustment_score: number
  cmv_total: number
  nationality?: string | null
  age?: number | null
  photo_url?: string | null
}
export type SocialMetricsRow = {
  athlete_id: string
  date: string | null
  ig_followers?: number | null
  tt_followers?: number | null
  x_followers?: number | null
  yt_subscribers?: number | null
  yt_avg_views?: number | null
  tt_avg_views?: number | null
  engagement_rate?: number | null
  avg_views?: number | null
  avg_views_per_post?: number | null
  avg_likes?: number | null
  avg_comments?: number | null
  posting_frequency?: number | null
  follower_growth_30d?: number | null
  followers_growth_30d?: number | null
}
export type SportsMetricsRow = {
  athlete_id: string
  date: string
  season?: number | null
  api_football_id?: number | null
  market_value_millions?: number | null
  minutes_played?: number | null
  goals?: number | null
  assists?: number | null
  matches_played?: number | null
  pass_accuracy?: number | null
  rating?: number | null
}
export type CmvScoreRow = Database["public"]["Tables"]["cmv_scores"]["Row"]

export type PlayerDirectoryRow = PlayerRow & {
  cmv_rank: number
  opportunity_score: number
  league?: string | null
  club?: string
  sports_score?: number
  social_score?: number
  commercial_score?: number
  brand_fit_score?: number
  momentum_score?: number
  adjustment_score?: number
  cmv_total?: number
}

export type PlayerProfile = {
  id: string
  name: string
  club: string
  league: string | null
  cmv_rank: number | null
  position: string
  nationality: string | null
  age: number | null
  photo_url: string | null
  sports_score: number
  social_score: number
  commercial_score: number
  brand_fit_score: number
  momentum_score: number
  adjustment_score: number
  cmv_total: number
  sports_metrics: SportsMetricsRow | null
  social_metrics: SocialMetricsRow | null
  campaign_signals: {
    branded_posts_count?: number | null
    brands_detected?: string[] | null
    brand_verticals?: string[] | null
    sponsorship_density?: number | null
    brand_safety_score?: number | null
    unique_brands_count?: number | null
  } | null
  brand_fit_detail: {
    lifestyle_score?: number | null
    fit_sportswear?: number | null
    fit_betting?: number | null
    brand_safety_score?: number | null
  } | null
  social_metrics_detail: {
    avg_likes?: number | null
    avg_comments?: number | null
    avg_views?: number | null
    posting_frequency?: number | null
    tt_avg_views?: number | null
    x_followers?: number | null
    yt_subscribers?: number | null
    yt_avg_views?: number | null
  } | null
}

export type CmvScoreWithAthleteClub = Database["public"]["Tables"]["athletes"]["Row"] & {
  club: string | null
  league: string | null
  cmv_total: number | null
  sports_score: number | null
  social_score: number | null
  commercial_score: number | null
  brand_fit_score: number | null
  momentum_score: number | null
  adjustment_score: number | null
  athletes: {
    id: string
    name: string
    position: string | null
    nationality: string | null
    photo_url: string | null
    clubs: {
      name: string
      league: string | null
    } | null
  }
  athlete_id?: string | null
  date: string
}
