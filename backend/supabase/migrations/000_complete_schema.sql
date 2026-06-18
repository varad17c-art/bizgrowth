-- ============================================================
-- BizGrowth — COMPLETE DATABASE SCHEMA
-- ============================================================
-- Paste this ENTIRE file into Supabase SQL Editor and click Run.
-- This is fully idempotent — safe to run multiple times.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 0. Extensions
-- ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- 1. ENUM types (all namespaced under public schema)
-- ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('client', 'consultant', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.user_status AS ENUM ('active', 'suspended', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.listing_type AS ENUM ('sell', 'buy', 'partner', 'supplier', 'investor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.listing_status AS ENUM ('active', 'inactive', 'closed', 'draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.event_type AS ENUM ('conclave', 'webinar', 'conference', 'workshop', 'networking', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled', 'draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.registration_status AS ENUM ('confirmed', 'waitlisted', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.content_type AS ENUM ('article', 'video', 'podcast', 'brochure', 'insight', 'report');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.availability_status AS ENUM ('available', 'busy', 'unavailable');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ──────────────────────────────────────────────────────────────
-- 2. Shared trigger function: auto-update updated_at
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.immutable_array_to_string(arr text[], sep text)
RETURNS text AS $$
  SELECT array_to_string(arr, sep);
$$ LANGUAGE sql IMMUTABLE;


-- ──────────────────────────────────────────────────────────────
-- 3. public.users  (credentials + basic identity)
--    The auth.model.ts inserts: email, password_hash, first_name, last_name, role
--    The admin.model.ts reads:  id, name, email, role, status, created_at
--    → We keep BOTH a stored name column (for admin) and first_name/last_name
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  first_name    VARCHAR(100)  NOT NULL DEFAULT '',
  last_name     VARCHAR(100)  NOT NULL DEFAULT '',
  -- Computed-style helper column used by admin queries (kept in sync via trigger)
  name          VARCHAR(200)  GENERATED ALWAYS AS (
                  TRIM(first_name || ' ' || last_name)
                ) STORED,
  role          public.user_role   NOT NULL DEFAULT 'client',
  status        public.user_status NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email      ON public.users (email);
CREATE INDEX        IF NOT EXISTS idx_users_role       ON public.users (role);
CREATE INDEX        IF NOT EXISTS idx_users_status     ON public.users (status);
CREATE INDEX        IF NOT EXISTS idx_users_created_at ON public.users (created_at DESC);

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- 4. public.profiles  (all profile/demographic data)
--    The auth.model.ts inserts: auth_user_id, email, first_name, last_name, role, status
--    The auth.model.ts reads:   profile_id, first_name, last_name, role, status, bio,
--                               phone, avatar_url, company_name, industry, city, state,
--                               country, website, linkedin_url, experience_years,
--                               created_at, updated_at
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID               NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id     UUID               NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  email            VARCHAR(255)       NOT NULL DEFAULT '',
  first_name       VARCHAR(100)       NOT NULL DEFAULT '',
  last_name        VARCHAR(100)       NOT NULL DEFAULT '',
  role             public.user_role   NOT NULL DEFAULT 'client',
  status           public.user_status NOT NULL DEFAULT 'active',
  -- Extended profile fields
  bio              TEXT               DEFAULT '',
  phone            VARCHAR(20)        DEFAULT '',
  avatar_url       TEXT               DEFAULT '',
  company_name     VARCHAR(200)       DEFAULT '',
  industry         VARCHAR(100)       DEFAULT '',
  city             VARCHAR(100)       DEFAULT '',
  state            VARCHAR(100)       DEFAULT '',
  country          VARCHAR(100)       DEFAULT '',
  website          VARCHAR(500)       DEFAULT '',
  linkedin_url     VARCHAR(500)       DEFAULT '',
  experience_years INTEGER            DEFAULT 0,
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_industry     ON public.profiles (industry);
CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles (company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_search
  ON public.profiles USING GIN (
    to_tsvector('english',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name, '') || ' ' ||
      coalesce(company_name, '') || ' ' ||
      coalesce(bio, '')
    )
  );

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- 5. public.organizations
--    organizations.model.ts uses: id, name, description, industry, user_id,
--                                  created_at, updated_at
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id            UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

CREATE INDEX IF NOT EXISTS idx_organizations_user_id    ON public.organizations (user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_industry   ON public.organizations (industry);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON public.organizations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_organizations_search
  ON public.organizations USING GIN (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(industry, '')
    )
  );

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- 6. public.listings  (Marketplace)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.listings (
  id            UUID                  NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title         VARCHAR(300)          NOT NULL,
  description   TEXT                  DEFAULT '',
  type          public.listing_type   NOT NULL DEFAULT 'sell',
  industry      VARCHAR(100)          DEFAULT '',
  budget        NUMERIC(15,2)         DEFAULT NULL,
  currency      VARCHAR(10)           DEFAULT 'INR',
  location      VARCHAR(200)          DEFAULT '',
  tags          TEXT[]                DEFAULT '{}',
  status        public.listing_status NOT NULL DEFAULT 'active',
  user_id       UUID                  NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id        UUID                  DEFAULT NULL,
  views         INTEGER               NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_user_id    ON public.listings (user_id);
CREATE INDEX IF NOT EXISTS idx_listings_type       ON public.listings (type);
CREATE INDEX IF NOT EXISTS idx_listings_industry   ON public.listings (industry);
CREATE INDEX IF NOT EXISTS idx_listings_status     ON public.listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_search
  ON public.listings USING GIN (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(industry, '')
    )
  );

DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- 7. public.events & public.event_registrations
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id                UUID                NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title             VARCHAR(300)        NOT NULL,
  description       TEXT                DEFAULT '',
  type              public.event_type   NOT NULL DEFAULT 'other',
  status            public.event_status NOT NULL DEFAULT 'upcoming',
  event_date        TIMESTAMPTZ         NOT NULL,
  end_date          TIMESTAMPTZ         DEFAULT NULL,
  location          VARCHAR(300)        DEFAULT '',
  is_virtual        BOOLEAN             NOT NULL DEFAULT false,
  virtual_link      VARCHAR(500)        DEFAULT '',
  capacity          INTEGER             DEFAULT NULL,
  registration_fee  NUMERIC(10,2)       DEFAULT 0,
  currency          VARCHAR(10)         DEFAULT 'INR',
  thumbnail_url     TEXT                DEFAULT '',
  tags              TEXT[]              DEFAULT '{}',
  organizer_id      UUID                NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id            UUID                DEFAULT NULL,
  created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id              UUID                        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id        UUID                        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id         UUID                        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status          public.registration_status  NOT NULL DEFAULT 'confirmed',
  registered_at   TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_events_organizer_id   ON public.events (organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_type           ON public.events (type);
CREATE INDEX IF NOT EXISTS idx_events_status         ON public.events (status);
CREATE INDEX IF NOT EXISTS idx_events_event_date     ON public.events (event_date);
CREATE INDEX IF NOT EXISTS idx_event_reg_event_id    ON public.event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user_id     ON public.event_registrations (user_id);
CREATE INDEX IF NOT EXISTS idx_events_search
  ON public.events USING GIN (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(location, '')
    )
  );

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations DISABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- 8. public.content  (Knowledge Hub)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content (
  id              UUID                  NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title           VARCHAR(400)          NOT NULL,
  body            TEXT                  DEFAULT '',
  summary         TEXT                  DEFAULT '',
  type            public.content_type   NOT NULL DEFAULT 'article',
  status          public.content_status NOT NULL DEFAULT 'draft',
  author_id       UUID                  NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tags            TEXT[]                DEFAULT '{}',
  industry        VARCHAR(100)          DEFAULT '',
  thumbnail_url   TEXT                  DEFAULT '',
  media_url       TEXT                  DEFAULT '',
  views           INTEGER               NOT NULL DEFAULT 0,
  read_time_mins  INTEGER               DEFAULT NULL,
  published_at    TIMESTAMPTZ           DEFAULT NULL,
  created_at      TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_author_id     ON public.content (author_id);
CREATE INDEX IF NOT EXISTS idx_content_type          ON public.content (type);
CREATE INDEX IF NOT EXISTS idx_content_status        ON public.content (status);
CREATE INDEX IF NOT EXISTS idx_content_published_at  ON public.content (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_industry      ON public.content (industry);
CREATE INDEX IF NOT EXISTS idx_content_search
  ON public.content USING GIN (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(body, '') || ' ' ||
      coalesce(summary, '')
    )
  );

DROP TRIGGER IF EXISTS trg_content_updated_at ON public.content;
CREATE TRIGGER trg_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.content DISABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- 9. public.consultant_profiles & public.services
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.consultant_profiles (
  id                UUID                        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID                        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  tagline           VARCHAR(300)                DEFAULT '',
  expertise         TEXT[]                      DEFAULT '{}',
  certifications    TEXT[]                      DEFAULT '{}',
  languages         TEXT[]                      DEFAULT '{}',
  hourly_rate       NUMERIC(10,2)               DEFAULT NULL,
  currency          VARCHAR(10)                 DEFAULT 'INR',
  availability      public.availability_status  NOT NULL DEFAULT 'available',
  min_engagement    VARCHAR(100)                DEFAULT '',
  portfolio_url     TEXT                        DEFAULT '',
  is_verified       BOOLEAN                     NOT NULL DEFAULT false,
  total_reviews     INTEGER                     NOT NULL DEFAULT 0,
  avg_rating        NUMERIC(3,2)                DEFAULT NULL,
  created_at        TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ                 NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id              UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

CREATE INDEX IF NOT EXISTS idx_consultant_user_id      ON public.consultant_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_consultant_availability ON public.consultant_profiles (availability);
CREATE INDEX IF NOT EXISTS idx_consultant_verified     ON public.consultant_profiles (is_verified);
CREATE INDEX IF NOT EXISTS idx_services_consultant_id  ON public.services (consultant_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active      ON public.services (is_active);
CREATE INDEX IF NOT EXISTS idx_consultant_search
  ON public.consultant_profiles USING GIN (
    to_tsvector('english',
      coalesce(tagline, '') || ' ' ||
      public.immutable_array_to_string(expertise, ' ')
    )
  );

DROP TRIGGER IF EXISTS trg_consultant_updated_at ON public.consultant_profiles;
CREATE TRIGGER trg_consultant_updated_at
  BEFORE UPDATE ON public.consultant_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_services_updated_at ON public.services;
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.consultant_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- 10. Bookings, Reviews & Payments (Phase 2 & 3)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes BETWEEN 15 AND 480),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  meeting_link VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_consultant_id ON public.bookings(consultant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON public.bookings(scheduled_at);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  comment TEXT NOT NULL CHECK (LENGTH(comment) <= 2000),
  helpful INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_consultant_id ON public.reviews(consultant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON public.reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP')),
  razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(100) UNIQUE,
  razorpay_signature VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('card', 'netbanking', 'upi', 'wallet')),
  transaction_id VARCHAR(100) UNIQUE,
  error_message TEXT,
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_consultant_id ON public.payments(consultant_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON public.payments(razorpay_order_id);

-- ──────────────────────────────────────────────────────────────
-- 11. Categories, Notifications & Availability (Phase 3)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500),
  icon VARCHAR(255),
  color VARCHAR(7) DEFAULT '#3B82F6',
  consultant_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

CREATE TABLE IF NOT EXISTS public.consultant_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(consultant_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_consultant_categories_consultant_id ON public.consultant_categories(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_categories_category_id ON public.consultant_categories(category_id);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('booking', 'review', 'payment', 'reminder', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  channels TEXT[] NOT NULL DEFAULT ARRAY['in-app']::TEXT[],
  related_id UUID,
  related_model VARCHAR(50) CHECK (related_model IN ('Booking', 'Review', 'Payment')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_id ON public.notifications(related_id);

CREATE TABLE IF NOT EXISTS public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  break_times JSONB,
  blocked_dates DATE[],
  max_consultations_per_day INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_consultant_id ON public.availability(consultant_id);

CREATE TABLE IF NOT EXISTS public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_id UUID NOT NULL REFERENCES public.availability(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_availability_slots_availability_id ON public.availability_slots(availability_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_day_of_week ON public.availability_slots(day_of_week);

-- ──────────────────────────────────────────────────────────────
-- 12. Helper Functions (RPCs)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_consultant_count(category_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.categories
  SET consultant_count = COALESCE(consultant_count, 0) + 1
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.decrement_consultant_count(category_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.categories
  SET consultant_count = GREATEST(0, COALESCE(consultant_count, 0) - 1)
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- DONE! All tables and RPC functions created successfully!
-- ============================================================

