CREATE TABLE IF NOT EXISTS public.rate_limits (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_rate_limits_key_time ON public.rate_limits(key, created_at);

-- Auto-cleanup: delete entries older than 1 hour
-- Run via Supabase cron or pg_cron
-- DELETE FROM public.rate_limits WHERE created_at < NOW() - INTERVAL '1 hour';
