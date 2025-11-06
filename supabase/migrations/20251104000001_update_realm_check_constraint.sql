-- ============================================================================
-- Migration: Update realm check constraint for Story 2.4
-- Story: 2.4 - Chamber Organization (Physical vs Mind)
-- ============================================================================
--
-- Purpose: Update realm column constraint to support the new simplified
-- abode model (physical/mind) instead of old three realms model (reality/mind/heart)
--
-- Background: Story 2.1 created realm with values ('reality', 'mind', 'heart')
-- but Epic 2 philosophy evolved to use 'physical' and 'mind' as the two abode layers.
-- We also need 'split' for split parent placeholders from Story 2.2.
--
-- This migration updates the constraint to allow the new values while maintaining
-- backward compatibility during the transition period.
-- ============================================================================

-- Drop the old constraint
ALTER TABLE somethings DROP CONSTRAINT IF EXISTS somethings_realm_check;

-- Add new constraint with updated values
-- Allows: NULL (unorganized), 'physical', 'mind', 'split' (new model)
-- Also keeps 'reality', 'mind', 'heart' (old model) for backward compatibility
ALTER TABLE somethings ADD CONSTRAINT somethings_realm_check
  CHECK (realm IN ('reality', 'mind', 'heart', 'physical', 'split'));

-- Update column comment
COMMENT ON COLUMN somethings.realm IS 'Realm/abode type: physical (location-based experiences), mind (thoughts/reflections), split (parent placeholder), or legacy values (reality, heart) for backward compatibility';

-- ============================================================================
-- Note: Future migration (Story 2.x) should migrate existing data from
-- old values to new values:
--   'reality' → 'physical'
--   'heart' → could map to either physical or mind with high care rating
-- Then remove legacy values from constraint.
-- ============================================================================
