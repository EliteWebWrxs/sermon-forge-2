-- Add trial tracking fields to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_sermon_limit INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS had_trial BOOLEAN DEFAULT FALSE;

-- Add index for trial queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions(trial_end)
WHERE trial_end IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN subscriptions.trial_end IS 'When the trial period ends (null if not on trial)';
COMMENT ON COLUMN subscriptions.trial_sermon_limit IS 'Number of sermons allowed during trial (default 2)';
COMMENT ON COLUMN subscriptions.had_trial IS 'Whether user has ever had a trial (prevents multiple trials)';
