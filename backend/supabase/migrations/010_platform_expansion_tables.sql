-- ============================================================
-- BizGrowth — Platform Expansion Tables
-- ============================================================

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  participant_two   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_participants UNIQUE (participant_one, participant_two)
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text_content      TEXT NOT NULL,
  is_read           BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Reviews Table
CREATE TABLE IF NOT EXISTS public.event_reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment           TEXT DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_event_attendee_review UNIQUE (event_id, user_id)
);

-- Portfolio Items Table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id     UUID NOT NULL REFERENCES public.consultant_profiles(id) ON DELETE CASCADE,
  title             VARCHAR(300) NOT NULL,
  description       TEXT DEFAULT '',
  project_url       TEXT DEFAULT '',
  image_url         TEXT DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_one, participant_two);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id  ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_event_id    ON public.event_reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_consultant ON public.portfolio_items(consultant_id);

-- Disable Row Level Security to match the other tables
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items DISABLE ROW LEVEL SECURITY;
