-- Make captures-media bucket public so images can be loaded via Next.js Image component
-- Users still control upload/delete via RLS policies on storage.objects

UPDATE storage.buckets
SET public = true
WHERE id = 'captures-media';
