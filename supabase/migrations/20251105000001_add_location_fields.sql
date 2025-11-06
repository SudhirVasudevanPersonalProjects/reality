-- Migration: Add location fields for Story 2.5 (Physical Location Capture & Geocoding)
-- Created: 2025-11-05
-- Purpose: Add formatted_address, visited columns and spatial index for Physical realm coordinates

-- Add formatted_address column
ALTER TABLE somethings
ADD COLUMN IF NOT EXISTS formatted_address TEXT;

-- Add visited column (Story 2.4 AC6 completion)
ALTER TABLE somethings
ADD COLUMN IF NOT EXISTS visited BOOLEAN DEFAULT true;

-- Verify coordinate columns exist (should already exist from Story 2.1)
-- If not, add them:
ALTER TABLE somethings
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);

ALTER TABLE somethings
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Create spatial index for performance (Story 2.7 map queries)
CREATE INDEX IF NOT EXISTS idx_somethings_location
  ON somethings(user_id, latitude, longitude)
  WHERE latitude IS NOT NULL;

-- Add comments for future reference
COMMENT ON COLUMN somethings.latitude IS 'Geographic latitude from Mapbox geocoding (Story 2.5)';
COMMENT ON COLUMN somethings.longitude IS 'Geographic longitude from Mapbox geocoding (Story 2.5)';
COMMENT ON COLUMN somethings.formatted_address IS 'Full address from Mapbox (e.g., "123 Main St, City, State ZIP")';
COMMENT ON COLUMN somethings.visited IS 'True if location has been visited (Physical realm only)';
