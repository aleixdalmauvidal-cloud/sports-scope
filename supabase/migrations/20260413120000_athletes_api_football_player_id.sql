-- API-Football player id on athletes (import + fast sync path)
alter table public.athletes
  add column if not exists api_football_player_id integer;

create index if not exists idx_athletes_api_football_id on public.athletes (api_football_player_id);

comment on column public.athletes.api_football_player_id is 'API-Football / API-Sports player id for squads import and stats sync';

-- Optional lifecycle flag for imported athletes
alter table public.athletes
  add column if not exists status text default 'active';

comment on column public.athletes.status is 'e.g. active | inactive';
