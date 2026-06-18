-- ============================================================
-- BizGrowth — Content / Knowledge Hub Table
-- ============================================================
-- Run in Supabase SQL Editor
-- ============================================================

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM ('article', 'video', 'podcast', 'brochure', 'insight', 'report');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.content (
  id              UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  title           VARCHAR(400)    NOT NULL,
  body            TEXT            DEFAULT '',
  summary         TEXT            DEFAULT '',
  type            content_type    NOT NULL DEFAULT 'article',
  status          content_status  NOT NULL DEFAULT 'draft',
  author_id       UUID            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tags            TEXT[]          DEFAULT '{}',
  industry        VARCHAR(100)    DEFAULT '',
  thumbnail_url   TEXT            DEFAULT '',
  media_url       TEXT            DEFAULT '',
  views           INTEGER         NOT NULL DEFAULT 0,
  read_time_mins  INTEGER         DEFAULT NULL,
  published_at    TIMESTAMPTZ     DEFAULT NULL,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_author_id   ON public.content (author_id);
CREATE INDEX IF NOT EXISTS idx_content_type        ON public.content (type);
CREATE INDEX IF NOT EXISTS idx_content_status      ON public.content (status);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON public.content (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_industry    ON public.content (industry);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_content_search
  ON public.content USING GIN (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, '') || ' ' || coalesce(summary, ''))
  );

-- Auto-update trigger
DROP TRIGGER IF EXISTS trg_content_updated_at ON public.content;
CREATE TRIGGER trg_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.content DISABLE ROW LEVEL SECURITY;
