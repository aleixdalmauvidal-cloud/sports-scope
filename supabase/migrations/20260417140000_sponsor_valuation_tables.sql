ALTER TABLE campaign_signals
  ADD COLUMN IF NOT EXISTS discovered_sponsors jsonb,
  ADD COLUMN IF NOT EXISTS sponsor_discovery_ran_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS discovery_confidence numeric;

CREATE TABLE IF NOT EXISTS sponsor_valuations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id uuid REFERENCES athletes(id),
  date date NOT NULL,
  valuation_per_post_min integer,
  valuation_per_post_max integer,
  valuation_annual_min integer,
  valuation_annual_max integer,
  valuation_ambassador_min integer,
  valuation_ambassador_max integer,
  valuation_event_min integer,
  valuation_event_max integer,
  reasoning text,
  key_factors jsonb,
  comparable_athletes jsonb,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(athlete_id, date)
);
