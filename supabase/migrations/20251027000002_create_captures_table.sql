-- Create captures table
-- This table stores all user content: texts, photos, videos, URLs with location and metadata
CREATE TABLE captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'photo', 'video', 'url')),
  text_content TEXT,
  media_url TEXT,
  location_name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index on user_id for fast user queries (filtering by user)
CREATE INDEX idx_captures_user_id ON captures(user_id);

-- Index on created_at for chronological sorting (DESC for newest first)
CREATE INDEX idx_captures_created_at ON captures(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE captures IS 'Stores all user content captures: texts, photos, videos, and URLs with timestamps and location data';
COMMENT ON COLUMN captures.user_id IS 'Foreign key to users table, cascades on delete';
COMMENT ON COLUMN captures.content_type IS 'Type of content: text, photo, video, or url';
COMMENT ON COLUMN captures.text_content IS 'Text content for text messages and URL strings';
COMMENT ON COLUMN captures.media_url IS 'Supabase Storage URL for photos and videos';
COMMENT ON COLUMN captures.location_name IS 'Subjective location label (e.g., "Home", "Coffee shop")';
COMMENT ON COLUMN captures.latitude IS 'Geographic coordinate (±90.00000000, 1.1mm precision)';
COMMENT ON COLUMN captures.longitude IS 'Geographic coordinate (±180.00000000, 1.1mm precision)';
COMMENT ON COLUMN captures.metadata IS 'Flexible JSONB storage for URL metadata (TikTok IDs, YouTube links, etc.)';
