-- Add max_somethings_bound column to users table
-- This determines how many somethings a user can have in their "Somewhere" abode

ALTER TABLE users
ADD COLUMN max_somethings_bound INT DEFAULT 50;

COMMENT ON COLUMN users.max_somethings_bound IS
  'Maximum number of somethings user can have in Somewhere abode before organizing';
