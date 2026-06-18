-- Migration 011: Support Marketplace Listing Sales in Payments

-- 1. Make booking_id nullable in payments table
ALTER TABLE public.payments ALTER COLUMN booking_id DROP NOT NULL;

-- 2. Add listing_id column referencing public.listings(id)
ALTER TABLE public.payments ADD COLUMN listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL;

-- 3. Create index for listing_id
CREATE INDEX IF NOT EXISTS idx_payments_listing_id ON public.payments(listing_id);
