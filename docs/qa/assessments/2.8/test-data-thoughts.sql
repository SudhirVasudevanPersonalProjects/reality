-- Test Data for Story 2.8 Manual Testing (Thoughts Only)
-- Run this in Supabase SQL Editor or via psql

-- Replace 'YOUR_USER_ID' with your actual user_id from auth.users table
-- To get your user_id: SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Test Thought 1: Basic thought with location (Care: 5 - Love)
INSERT INTO somethings (
  user_id,
  realm,
  text_content,
  care,
  captured_at,
  location_name,
  latitude,
  longitude,
  attributes,
  content_type
) VALUES (
  '2138c9da-b729-49aa-879e-21b96b5e9caa',  -- Replace with your user_id
  'mind',
  'Sometimes I wonder if we truly understand happiness. Is it a fleeting moment, or can it be sustained? Today felt peaceful.',
  5,
  '2025-11-05T14:30:00Z',
  'Central Park',
  40.7829,
  -73.9654,
  '{"mind_category": "thought", "why": "This reflection helped me realize that happiness isn''t about constant joy, but about appreciating peaceful moments."}'::jsonb,
  'text'
);

-- Test Thought 2: Multi-line thought, no location (Care: 3 - Neutral)
INSERT INTO somethings (
  user_id,
  realm,
  text_content,
  care,
  captured_at,
  attributes,
  content_type
) VALUES (
  '2138c9da-b729-49aa-879e-21b96b5e9caa',  -- Replace with your user_id
  'mind',
  'Line one of my thoughts
Line two continues the idea
Line three wraps it up

Maybe I should write more?',
  3,
  '2025-11-04T10:15:00Z',
  '{"mind_category": "thought"}'::jsonb,
  'text'
);

-- Test Thought 3: Thought with "why" field (Care: 4 - Like)
INSERT INTO somethings (
  user_id,
  realm,
  text_content,
  care,
  captured_at,
  attributes,
  content_type
) VALUES (
  '2138c9da-b729-49aa-879e-21b96b5e9caa',  -- Replace with your user_id
  'mind',
  'Reading that book about stoicism really changed my perspective on control. I can''t control external events, only my reactions.',
  4,
  '2025-11-03T18:45:00Z',
  '{"mind_category": "thought", "why": "This insight has been helping me stay calm during stressful situations at work.", "sun_domain": "beauty"}'::jsonb,
  'text'
);

-- Test Thought 4: Empty content (Care: 2 - Dislike)
INSERT INTO somethings (
  user_id,
  realm,
  text_content,
  care,
  captured_at,
  attributes,
  content_type
) VALUES (
  '2138c9da-b729-49aa-879e-21b96b5e9caa',  -- Replace with your user_id
  'mind',
  NULL,
  2,
  '2025-11-02T08:00:00Z',
  '{"mind_category": "thought"}'::jsonb,
  'text'
);

-- Test Thought 5: Minimal thought (Care: 1 - Hate)
INSERT INTO somethings (
  user_id,
  realm,
  text_content,
  care,
  captured_at,
  attributes,
  content_type
) VALUES (
  '2138c9da-b729-49aa-879e-21b96b5e9caa',  -- Replace with your user_id
  'mind',
  'Why did I say that? So embarrassing.',
  1,
  '2025-11-01T22:30:00Z',
  '{"mind_category": "thought"}'::jsonb,
  'text'
);

-- To verify your test data:
-- SELECT id, text_content, care, captured_at, location_name FROM somethings WHERE realm = 'mind' ORDER BY captured_at DESC;

-- To get specific IDs for testing:
-- SELECT id, substring(text_content, 1, 50) as content_preview, care FROM somethings WHERE realm = 'mind' ORDER BY captured_at DESC;
