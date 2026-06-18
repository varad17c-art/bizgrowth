-- ============================================================
-- BizGrowth — Consultant Profiles & Services Tables
-- ============================================================
-- Run in Supabase SQL Editor
-- ============================================================

DO $$ BEGIN
  CREATE TYPE availability_status AS ENUM ('available', 'busy', 'unavailable');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.immutable_array_to_string(arr text[], sep text)
RETURNS text AS $$
  SELECT array_to_string(arr, sep);
$$ LANGUAGE sql IMMUTABLE;

-- Consultant profiles table (extends users)
CREATE TABLE IF NOT EXISTS public.consultant_profiles (
  id                UUID                DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID                NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  tagline           VARCHAR(300)        DEFAULT '',
  expertise         TEXT[]              DEFAULT '{}',
  certifications    TEXT[]              DEFAULT '{}',
  languages         TEXT[]              DEFAULT '{}',
  hourly_rate       NUMERIC(10,2)       DEFAULT NULL,
  currency          VARCHAR(10)         DEFAULT 'INR',
  availability      availability_status NOT NULL DEFAULT 'available',
  min_engagement    VARCHAR(100)        DEFAULT '',
  portfolio_url     TEXT                DEFAULT '',
  is_verified       BOOLEAN             NOT NULL DEFAULT false,
  total_reviews     INTEGER             NOT NULL DEFAULT 0,
  avg_rating        NUMERIC(3,2)        DEFAULT NULL,
  created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Services table (offered by consultants)
CREATE TABLE IF NOT EXISTS public.services (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  consultant_id   UUID          NOT NULL REFERENCES public.consultant_profiles(id) ON DELETE CASCADE,
  title           VARCHAR(300)  NOT NULL,
  description     TEXT          DEFAULT '',
  price           NUMERIC(10,2) DEFAULT NULL,
  currency        VARCHAR(10)   DEFAULT 'INR',
  duration_hours  INTEGER       DEFAULT NULL,
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_consultant_user_id     ON public.consultant_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_consultant_availability ON public.consultant_profiles (availability);
CREATE INDEX IF NOT EXISTS idx_consultant_verified     ON public.consultant_profiles (is_verified);
CREATE INDEX IF NOT EXISTS idx_services_consultant_id  ON public.services (consultant_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active      ON public.services (is_active);

-- Full-text search on consultants
CREATE INDEX IF NOT EXISTS idx_consultant_search
  ON public.consultant_profiles USING GIN (
    to_tsvector('english', coalesce(tagline, '') || ' ' || public.immutable_array_to_string(expertise, ' '))
  );

-- Auto-update triggers
DROP TRIGGER IF EXISTS trg_consultant_updated_at ON public.consultant_profiles;
CREATE TRIGGER trg_consultant_updated_at
  BEFORE UPDATE ON public.consultant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_services_updated_at ON public.services;
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.consultant_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
