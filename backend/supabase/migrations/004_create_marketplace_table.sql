-- ============================================================
-- BizGrowth — Marketplace Listings Table
-- ============================================================
-- Run in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Listing type enum
DO $$ BEGIN
  CREATE TYPE listing_type AS ENUM ('sell', 'buy', 'partner', 'supplier', 'investor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('active', 'inactive', 'closed', 'draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.listings (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  title         VARCHAR(300)  NOT NULL,
  description   TEXT          DEFAULT '',
  type          listing_type  NOT NULL DEFAULT 'sell',
  industry      VARCHAR(100)  DEFAULT '',
  budget        NUMERIC(15,2) DEFAULT NULL,
  currency      VARCHAR(10)   DEFAULT 'INR',
  location      VARCHAR(200)  DEFAULT '',
  tags          TEXT[]        DEFAULT '{}',
  status        listing_status NOT NULL DEFAULT 'active',
  user_id       UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id        UUID          DEFAULT NULL,
  views         INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_listings_user_id   ON public.listings (user_id);
CREATE INDEX IF NOT EXISTS idx_listings_type       ON public.listings (type);
CREATE INDEX IF NOT EXISTS idx_listings_industry   ON public.listings (industry);
CREATE INDEX IF NOT EXISTS idx_listings_status     ON public.listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings (created_at DESC);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_listings_search
  ON public.listings USING GIN (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(industry, ''))
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;
