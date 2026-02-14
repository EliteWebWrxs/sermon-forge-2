-- Update storage bucket to allow larger files (up to 500MB)
-- This requires Supabase Pro plan for files over 50MB

-- Update the sermons bucket to allow larger files
UPDATE storage.buckets
SET file_size_limit = 524288000 -- 500MB in bytes
WHERE id = 'sermons';

-- Note: If you're on the free tier, Supabase enforces a 50MB limit per file.
-- You'll need to upgrade to Pro or use an alternative approach for large files.
