-- ============================================================
-- Migration 009: Categories, Notifications & Availability Tables
-- Run after 008_create_bookings_reviews_payments.sql
-- ============================================================

-- ---- 1. CATEGORIES ----
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500),
  icon VARCHAR(255),
  color VARCHAR(7) DEFAULT '#3B82F6',
  consultant_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);


-- ---- 2. CONSULTANT_CATEGORIES (join table) ----
-- Links a consultant profile to one or more categories
CREATE TABLE IF NOT EXISTS consultant_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(consultant_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_consultant_categories_consultant_id ON consultant_categories(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_categories_category_id ON consultant_categories(category_id);


-- ---- 3. NOTIFICATIONS ----
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_id ON notifications(related_id);


-- ---- 4. AVAILABILITY ----
-- One availability config per consultant
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  break_times JSONB,
  blocked_dates DATE[],
  max_consultations_per_day INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_consultant_id ON availability(consultant_id);


-- ---- 5. AVAILABILITY_SLOTS ----
-- Weekly recurring time slots for each availability config
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_id UUID NOT NULL REFERENCES availability(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_availability_slots_availability_id ON availability_slots(availability_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_day_of_week ON availability_slots(day_of_week);

-- ---- 6. HELPER FUNCTIONS (RPCs for Categories) ----
CREATE OR REPLACE FUNCTION increment_consultant_count(category_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE categories
  SET consultant_count = COALESCE(consultant_count, 0) + 1
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_consultant_count(category_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE categories
  SET consultant_count = GREATEST(0, COALESCE(consultant_count, 0) - 1)
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql;

