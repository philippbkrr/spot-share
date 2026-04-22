-- =============================================
-- SpotShare Storage Setup
-- =============================================

-- Create storage bucket for spot images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'spot-images',
  'spot-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Storage policies
CREATE POLICY "Anyone can view spot images"
ON storage.objects FOR SELECT
USING (bucket_id = 'spot-images');

CREATE POLICY "Authenticated users can upload spot images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'spot-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own spot images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'spot-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own spot images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'spot-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);