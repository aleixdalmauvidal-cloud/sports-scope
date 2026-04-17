ALTER TABLE campaign_signals
  ADD COLUMN IF NOT EXISTS news_headlines text[],
  ADD COLUMN IF NOT EXISTS wikipedia_sponsors text[],
  ADD COLUMN IF NOT EXISTS data_sources text[];
