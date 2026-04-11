-- Sports Scope: tabla de jugadores para ranking CMV
-- Ejecutar en Supabase → SQL Editor

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  club text not null,
  position text not null,
  sports_score numeric not null default 0,
  social_score numeric not null default 0,
  cmv_total numeric not null default 0,
  nationality text,
  age integer,
  photo_url text
);

create index if not exists players_cmv_total_idx on public.players (cmv_total desc);

alter table public.players enable row level security;

drop policy if exists "Allow public read players" on public.players;

create policy "Allow public read players"
  on public.players
  for select
  using (true);

-- Datos de ejemplo (opcional)
insert into public.players (name, club, position, sports_score, social_score, cmv_total, nationality, age)
values
  ('Ejemplo Alpha', 'FC Demo', 'FW', 92.4, 88.1, 125000000, 'ES', 24),
  ('Ejemplo Beta', 'SC Sample', 'MF', 89.0, 91.2, 118500000, 'BR', 26),
  ('Ejemplo Gamma', 'United Test', 'DF', 87.5, 72.0, 89500000, 'FR', 28);
