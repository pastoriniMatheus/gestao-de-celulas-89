
-- Ensure storage bucket for contact photos exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos', 
  'photos', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;

-- Create policy to allow public read access to photos
CREATE POLICY "Public read access for photos" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

-- Create policy to allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'photos');

-- Create policy to allow authenticated users to update their own photos
CREATE POLICY "Authenticated users can update photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'photos');

-- Create policy to allow authenticated users to delete photos
CREATE POLICY "Authenticated users can delete photos" ON storage.objects
FOR DELETE USING (bucket_id = 'photos');
