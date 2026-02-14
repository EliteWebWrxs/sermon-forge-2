-- Add "draft" to the sermon status check constraint

-- Drop the existing constraint
ALTER TABLE sermons DROP CONSTRAINT IF EXISTS sermons_status_check;

-- Add the new constraint with "draft" included
ALTER TABLE sermons ADD CONSTRAINT sermons_status_check
CHECK (status IN ('draft', 'uploading', 'processing', 'transcribing', 'generating', 'complete', 'error'));

-- Update any existing sermons that are stuck in processing/uploading but have a transcript
UPDATE sermons
SET status = 'draft'
WHERE status IN ('processing', 'uploading')
AND transcript IS NOT NULL;
