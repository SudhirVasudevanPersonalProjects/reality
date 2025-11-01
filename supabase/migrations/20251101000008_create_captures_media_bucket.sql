-- Migration: Create captures-media storage bucket
-- Description: Storage bucket for user-uploaded photos and videos

-- Create the captures-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'captures-media',
  'captures-media',
  false, -- SECURITY: Private bucket - access controlled by RLS policies
  52428800, -- 50MB limit (for videos)
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg']
);

-- Policy: Users can upload files to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'captures-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'captures-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files (for upserts)
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'captures-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'captures-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
