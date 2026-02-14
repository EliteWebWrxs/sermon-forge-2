-- Create storage bucket for church logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('church-logos', 'church-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload logos to their own folder
CREATE POLICY "Users can upload church logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'church-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own logos
CREATE POLICY "Users can read their own church logos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'church-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to church logos (for exports)
CREATE POLICY "Public can read church logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'church-logos');

-- Allow users to delete their own logos
CREATE POLICY "Users can delete their own church logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'church-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own logos
CREATE POLICY "Users can update their own church logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'church-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
