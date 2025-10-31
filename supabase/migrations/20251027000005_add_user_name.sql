-- Add optional name column to users table
-- Name can be extracted from first text message or set on web later

ALTER TABLE users ADD COLUMN name TEXT;

-- Add comment
COMMENT ON COLUMN users.name IS 'User display name, optionally extracted from first SMS or set on web';
