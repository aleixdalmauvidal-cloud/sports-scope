-- API-Football sync fields on sports_metrics
-- Run in Supabase SQL Editor or via CLI migrations.

alter table public.sports_metrics
  add column if not exists api_football_id integer,
  add column if not exists matches_played integer,
  add column if not exists pass_accuracy numeric;

comment on column public.sports_metrics.api_football_id is 'API-Football player id for future API calls';
comment on column public.sports_metrics.matches_played is 'League appearances (season)';
comment on column public.sports_metrics.pass_accuracy is 'Pass accuracy % from API-Football';
