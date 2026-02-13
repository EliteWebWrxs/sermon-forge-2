-- Fix for "Database error saving new user 303" error
-- This adds the missing INSERT policy for users_metadata table

-- If you already ran the migration and are getting signup errors, run this:

-- Drop the policy if it exists (won't error if it doesn't)
DROP POLICY IF EXISTS "Users can insert their own metadata" ON users_metadata;

-- Create the INSERT policy
CREATE POLICY "Users can insert their own metadata"
  ON users_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Verify the fix by checking all policies on users_metadata:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users_metadata';
