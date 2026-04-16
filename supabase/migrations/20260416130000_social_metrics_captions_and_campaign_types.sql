-- Add Instagram post captions cache to social_metrics
alter table public.social_metrics
  add column if not exists latest_post_captions text[];

-- Add campaign types to campaign_signals
alter table public.campaign_signals
  add column if not exists campaign_types text[];

