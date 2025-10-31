-- Migration: Fix phone_number to be nullable for email authentication
-- Context: PRD v5.1 pivoted from phone auth (v5.0) to email auth
-- Phone number is preserved for Phase 2 SMS features but is NOT required for MVP

-- Remove NOT NULL constraint from phone_number
ALTER TABLE public.users
ALTER COLUMN phone_number DROP NOT NULL;

-- Update comment to reflect optional nature
COMMENT ON COLUMN public.users.phone_number IS 'Optional phone number for user contact (reserved for Phase 2 SMS features, not required for email auth)';

-- Note: Keep the UNIQUE constraint - if a phone number is provided, it must be unique
-- Note: Keep the index idx_users_phone for efficient lookups when phone numbers are used
