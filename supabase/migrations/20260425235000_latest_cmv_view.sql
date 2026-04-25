CREATE OR REPLACE VIEW public.latest_cmv_scores AS
SELECT DISTINCT ON (athlete_id)
  id,
  athlete_id,
  date,
  cmv_total,
  sports_score,
  social_score,
  commercial_score,
  brand_fit_score,
  momentum_score,
  adjustment_score,
  score_version,
  created_at
FROM public.cmv_scores
ORDER BY athlete_id, date DESC, created_at DESC;

CREATE OR REPLACE VIEW public.latest_social_metrics AS
SELECT DISTINCT ON (athlete_id)
  *
FROM public.social_metrics
ORDER BY athlete_id, date DESC, created_at DESC;

CREATE OR REPLACE VIEW public.latest_sports_metrics AS
SELECT DISTINCT ON (athlete_id)
  *
FROM public.sports_metrics
ORDER BY athlete_id, date DESC, created_at DESC;
