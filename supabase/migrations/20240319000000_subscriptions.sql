-- Subscriptions table for Stripe billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  sermon_count INTEGER DEFAULT 0,
  sermon_limit INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (via webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Function to check sermon limit before creating a sermon
CREATE OR REPLACE FUNCTION check_sermon_limit()
RETURNS TRIGGER AS $$
DECLARE
  sub RECORD;
  current_month_count INTEGER;
BEGIN
  -- Get user's subscription
  SELECT * INTO sub FROM subscriptions WHERE user_id = NEW.user_id;

  -- If no subscription, allow (free tier or trial)
  IF sub IS NULL THEN
    RETURN NEW;
  END IF;

  -- If unlimited (-1), allow
  IF sub.sermon_limit = -1 THEN
    RETURN NEW;
  END IF;

  -- Count sermons created this month
  SELECT COUNT(*) INTO current_month_count
  FROM sermons
  WHERE user_id = NEW.user_id
  AND created_at >= date_trunc('month', NOW())
  AND created_at < date_trunc('month', NOW()) + INTERVAL '1 month';

  -- Check if limit exceeded
  IF current_month_count >= sub.sermon_limit THEN
    RAISE EXCEPTION 'Monthly sermon limit reached. Please upgrade your plan.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check limit on sermon creation
DROP TRIGGER IF EXISTS check_sermon_limit_trigger ON sermons;
CREATE TRIGGER check_sermon_limit_trigger
  BEFORE INSERT ON sermons
  FOR EACH ROW
  EXECUTE FUNCTION check_sermon_limit();

-- Function to increment sermon count
CREATE OR REPLACE FUNCTION increment_sermon_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE subscriptions
  SET sermon_count = sermon_count + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment count after sermon creation
DROP TRIGGER IF EXISTS increment_sermon_count_trigger ON sermons;
CREATE TRIGGER increment_sermon_count_trigger
  AFTER INSERT ON sermons
  FOR EACH ROW
  EXECUTE FUNCTION increment_sermon_count();

-- Reset sermon counts monthly (run via cron job or scheduled function)
CREATE OR REPLACE FUNCTION reset_monthly_sermon_counts()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions SET sermon_count = 0;
END;
$$ LANGUAGE plpgsql;
