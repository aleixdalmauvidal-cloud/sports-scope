create index if not exists idx_brand_fit_athlete_date
  on public.brand_fit (athlete_id, date desc);
