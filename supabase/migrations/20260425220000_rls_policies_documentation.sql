-- Enable RLS on sports_metrics and sponsor_valuations
alter table public.sports_metrics enable row level security;
alter table public.sponsor_valuations enable row level security;

-- Public read policies (athlete data is public)
create policy if not exists "Public read sports_metrics" on public.sports_metrics
  for select using (true);

create policy if not exists "Public read sponsor_valuations" on public.sponsor_valuations
  for select using (true);

-- Service role write policies
create policy if not exists "Service role write sports_metrics" on public.sports_metrics
  for all using (auth.role() = 'service_role');

create policy if not exists "Service role write sponsor_valuations" on public.sponsor_valuations
  for all using (auth.role() = 'service_role');
