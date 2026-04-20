-- Required for scripts/calculate-cmv.ts cmv_history upsert (onConflict: athlete_id,date)
create unique index if not exists cmv_history_athlete_id_date_uidx
  on public.cmv_history (athlete_id, date);
