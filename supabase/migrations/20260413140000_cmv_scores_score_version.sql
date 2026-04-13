-- Version tag for CMV calculation pipeline (see scripts/calculate-cmv.ts)
alter table public.cmv_scores
  add column if not exists score_version text default 'v1';

comment on column public.cmv_scores.score_version is 'Formula / pipeline version (e.g. v1 from calculate-cmv script)';
