-- Update the sermons bucket to be publicly accessible
-- This is required so external services (like AssemblyAI) can access uploaded files
UPDATE storage.buckets
SET public = true
WHERE id = 'sermons';

-- Note: The RLS policies still protect write/delete operations
-- Only read access is public
