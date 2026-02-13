-- Create storage bucket for sermon files
INSERT INTO storage.buckets (id, name, public)
VALUES ('sermons', 'sermons', false);

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload sermon files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sermons' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can read their own sermon files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'sermons' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own sermon files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'sermons' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own sermon files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'sermons' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
