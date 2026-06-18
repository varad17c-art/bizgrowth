-- ============================================================
-- BizGrowth — Events & Event Registrations Tables
-- ============================================================
-- Run in Supabase SQL Editor
-- ============================================================

DO $$ BEGIN
  CREATE TYPE event_type AS ENUM ('conclave', 'webinar', 'conference', 'workshop', 'networking', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled', 'draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('confirmed', 'waitlisted', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  title           VARCHAR(300)  NOT NULL,
  description     TEXT          DEFAULT '',
  type            event_type    NOT NULL DEFAULT 'other',
  status          event_status  NOT NULL DEFAULT 'draft',
  event_date      TIMESTAMPTZ   NOT NULL,
  end_date        TIMESTAMPTZ   DEFAULT NULL,
  location        VARCHAR(300)  DEFAULT '',
  is_virtual      BOOLEAN       NOT NULL DEFAULT false,
  virtual_link    VARCHAR(500)  DEFAULT '',
  capacity        INTEGER       DEFAULT NULL,
  registration_fee NUMERIC(10,2) DEFAULT 0,
  currency        VARCHAR(10)   DEFAULT 'INR',
  thumbnail_url   TEXT          DEFAULT '',
  tags            TEXT[]        DEFAULT '{}',
  organizer_id    UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id          UUID          DEFAULT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Event registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id              UUID                DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id        UUID                NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id         UUID                NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status          registration_status NOT NULL DEFAULT 'confirmed',
  registered_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id  ON public.events (organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_type          ON public.events (type);
CREATE INDEX IF NOT EXISTS idx_events_status        ON public.events (status);
CREATE INDEX IF NOT EXISTS idx_events_event_date    ON public.events (event_date);
CREATE INDEX IF NOT EXISTS idx_event_reg_event_id   ON public.event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user_id    ON public.event_registrations (user_id);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_events_search
  ON public.events USING GIN (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
  );

-- Auto-update triggers
DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations DISABLE ROW LEVEL SECURITY;
