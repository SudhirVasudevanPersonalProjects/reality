-- Create users table
-- This table stores user profile information including phone numbers for authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index on phone_number for fast lookups during authentication
CREATE INDEX idx_users_phone ON users(phone_number);

-- Add comment to table
COMMENT ON TABLE users IS 'Stores user profile information and authentication data';
COMMENT ON COLUMN users.phone_number IS 'Unique phone number for user identification and authentication';
COMMENT ON COLUMN users.birth_date IS 'User birth date for age verification and personalization';
