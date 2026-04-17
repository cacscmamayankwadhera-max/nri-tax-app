-- ================================================
-- Admin Settings Table — NRI Tax Suite
-- Run this in Supabase SQL Editor
-- ================================================

CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins and partners can read/write settings
CREATE POLICY "Admins can manage settings" ON public.admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'partner')
    )
  );

-- Allow service role full access (for API routes)
CREATE POLICY "Service role full access" ON public.admin_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(key);

-- Seed default settings
INSERT INTO public.admin_settings (key, value) VALUES
  ('firm_name', '"MKW Advisors"'),
  ('firm_tagline', '"NRI Tax Filing \u00b7 Advisory \u00b7 Compliance"'),
  ('default_fy', '"2025-26"'),
  ('default_model', '"claude-sonnet-4-20250514"')
ON CONFLICT (key) DO NOTHING;
