-- Add onboarding tracking fields to users_metadata
ALTER TABLE users_metadata
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS product_tour_completed BOOLEAN DEFAULT FALSE;

-- Add index for quickly finding users who haven't completed onboarding
CREATE INDEX IF NOT EXISTS idx_users_metadata_onboarding
ON users_metadata (user_id)
WHERE onboarding_completed = FALSE;
