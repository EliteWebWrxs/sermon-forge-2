-- Add new fields to users_metadata for comprehensive settings

-- Profile fields
ALTER TABLE users_metadata
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Church fields
ALTER TABLE users_metadata
ADD COLUMN IF NOT EXISTS church_website TEXT,
ADD COLUMN IF NOT EXISTS church_size TEXT,
ADD COLUMN IF NOT EXISTS denomination TEXT;

-- Notification preferences (stored as JSONB for flexibility)
ALTER TABLE users_metadata
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "processing_complete": true,
  "payment_issues": true,
  "usage_warnings": true,
  "weekly_digest": false,
  "product_updates": true
}'::jsonb;

-- Account settings
ALTER TABLE users_metadata
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_export_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_deletion_requested_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN users_metadata.display_name IS 'User display name';
COMMENT ON COLUMN users_metadata.profile_picture_url IS 'URL to user profile picture';
COMMENT ON COLUMN users_metadata.timezone IS 'User timezone for date/time display';
COMMENT ON COLUMN users_metadata.church_website IS 'Church website URL';
COMMENT ON COLUMN users_metadata.church_size IS 'Church size category (small, medium, large, mega)';
COMMENT ON COLUMN users_metadata.denomination IS 'Church denomination (optional)';
COMMENT ON COLUMN users_metadata.notification_preferences IS 'JSON object storing email notification preferences';
COMMENT ON COLUMN users_metadata.two_factor_enabled IS 'Whether 2FA is enabled for this account';
COMMENT ON COLUMN users_metadata.data_export_requested_at IS 'When user last requested data export (GDPR)';
COMMENT ON COLUMN users_metadata.account_deletion_requested_at IS 'When user requested account deletion';

-- Create index for users who requested data export (for batch processing)
CREATE INDEX IF NOT EXISTS idx_users_metadata_data_export
ON users_metadata(data_export_requested_at)
WHERE data_export_requested_at IS NOT NULL;
