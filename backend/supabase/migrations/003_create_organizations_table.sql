-- ============================================================
-- BizGrowth — Organizations Table
-- ============================================================
-- Run in Supabase SQL Editor (after 002_add_user_profile_columns.sql)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.organizations (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name          VARCHAR(300)  NOT NULL,
  description   TEXT          DEFAULT '',
  industry      VARCHAR(100)  DEFAULT '',
  website       VARCHAR(500)  DEFAULT '',
  logo_url      TEXT          DEFAULT '',
  size          VARCHAR(50)   DEFAULT '',
  founded_year  INTEGER       DEFAULT NULL,
  city          VARCHAR(100)  DEFAULT '',
  country       VARCHAR(100)  DEFAULT '',
  user_id       UUID          REFERENCES public.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_user_id   ON public.organizations (user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_industry  ON public.organizations (industry);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON public.organizations (created_at DESC);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_organizations_search
  ON public.organizations USING GIN (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(industry, ''))
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
