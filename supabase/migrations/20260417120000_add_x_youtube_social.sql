-- Añadir handles de X y YouTube en tabla athletes
ALTER TABLE athletes
  ADD COLUMN IF NOT EXISTS x_handle text,
  ADD COLUMN IF NOT EXISTS yt_handle text;

-- Añadir métricas de X y YouTube en social_metrics
ALTER TABLE social_metrics
  ADD COLUMN IF NOT EXISTS x_followers bigint,
  ADD COLUMN IF NOT EXISTS x_growth_30d integer,
  ADD COLUMN IF NOT EXISTS yt_subscribers bigint,
  ADD COLUMN IF NOT EXISTS yt_avg_views integer,
  ADD COLUMN IF NOT EXISTS yt_growth_30d integer;

-- Crear índices para búsquedas por handle
CREATE INDEX IF NOT EXISTS idx_athletes_x_handle ON athletes(x_handle);
CREATE INDEX IF NOT EXISTS idx_athletes_yt_handle ON athletes(yt_handle);
