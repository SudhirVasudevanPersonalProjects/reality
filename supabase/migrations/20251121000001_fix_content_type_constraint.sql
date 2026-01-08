-- ============================================================================
-- Fix content_type constraint to include new types (abode, why)
-- ============================================================================

-- Drop the old constraint that only allowed: text, photo, video, url
ALTER TABLE somethings DROP CONSTRAINT IF EXISTS captures_content_type_check;

-- Add new constraint with expanded allowed types
ALTER TABLE somethings ADD CONSTRAINT somethings_content_type_check
  CHECK (content_type IN ('text', 'photo', 'video', 'url', 'abode', 'why'));

-- Update comment
COMMENT ON COLUMN somethings.content_type IS 'Type of content: text, photo, video, url, abode (container), why (reasoning)';
