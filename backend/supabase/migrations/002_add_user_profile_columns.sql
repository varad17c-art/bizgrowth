-- ============================================================
-- BizGrowth — Add Profile Columns to Users Table
-- ============================================================
-- Run this SQL in your Supabase Dashboard:
--   SQL Editor → New Query → Paste → Run
-- ============================================================

-- 1. Add profile columns to existing users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bio          TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone        VARCHAR(20) DEFAULT '',
  ADD COLUMN IF NOT EXISTS avatar_url   TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS company      VARCHAR(200) DEFAULT '',
  ADD COLUMN IF NOT EXISTS industry     VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS city         VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS state        VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS country      VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS website      VARCHAR(500) DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500) DEFAULT '',
  ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;

-- 2. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_industry ON users (industry);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
CREATE INDEX IF NOT EXISTS idx_users_company ON users (company);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);

-- 3. Full-text search index on name + company + bio (for user discovery)
CREATE INDEX IF NOT EXISTS idx_users_search
  ON users USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(company, '') || ' ' || coalesce(bio, '')));
