-- ============================================
-- STEP 1: Get your User ID (run this first)
-- ============================================
-- Copy the 'id' value from the result
SELECT id, email FROM auth.users LIMIT 1;

-- ============================================
-- STEP 2: Create Test Data (run after Step 1)
-- ============================================
-- Replace 'YOUR_USER_ID_HERE' below with the id from Step 1

-- Test Thought 1: Love (5 stars) - with location and why field
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
  'YOUR_USER_ID_HERE',
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

-- Test Thought 2: Neutral (3 stars) - multi-line text
INSERT INTO somethings (
  user_id,
  realm,
  text_content,
  care,
  captured_at,
  attributes,
  content_type
) VALUES (
  'YOUR_USER_ID_HERE',
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

-- Test Thought 3: Like (4 stars) - with why and custom domain
INSERT INTO somethings (
  user_id,
  realm,
  text_content,
  care,
  captured_at,
  attributes,
  content_type
) VALUES (
  'YOUR_USER_ID_HERE',
  'mind',
  'Reading that book about stoicism really changed my perspective on control. I can''t control external events, only my reactions.',
  4,
  '2025-11-03T18:45:00Z',
  '{"mind_category": "thought", "why": "This insight has been helping me stay calm during stressful situations at work.", "sun_domain": "beauty"}'::jsonb,
  'text'
);

-- Test Thought 4: Dislike (2 stars) - empty content
INSERT INTO somethings (
  user_id,
  realm,
  text_content,
  care,
  captured_at,
  attributes,
  content_type
) VALUES (
  'YOUR_USER_ID_HERE',
  'mind',
  NULL,
  2,
  '2025-11-02T08:00:00Z',
  '{"mind_category": "thought"}'::jsonb,
  'text'
);

-- Test Thought 5: Hate (1 star) - regretful thought
INSERT INTO somethings (
  user_id,
  realm,
  text_content,
  care,
  captured_at,
  attributes,
  content_type
) VALUES (
  'YOUR_USER_ID_HERE',
  'mind',
  'Why did I say that? So embarrassing.',
  1,
  '2025-11-01T22:30:00Z',
  '{"mind_category": "thought"}'::jsonb,
  'text'
);

-- ============================================
-- STEP 3: Get Card IDs (run after Step 2)
-- ============================================
-- Copy these IDs - you'll need them for testing
SELECT
  id,
  substring(text_content, 1, 40) as preview,
  care,
  location_name,
  captured_at
FROM somethings
WHERE realm = 'mind'
  AND user_id = 'YOUR_USER_ID_HERE'
ORDER BY captured_at DESC;
