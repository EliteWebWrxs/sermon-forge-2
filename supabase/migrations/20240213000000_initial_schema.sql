-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users metadata table (extends auth.users)
CREATE TABLE users_metadata (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  church_name TEXT,
  church_logo_url TEXT,
  sermons_processed_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Sermons table
CREATE TABLE sermons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sermon_date DATE NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('audio', 'video', 'pdf', 'youtube', 'text_paste')),
  audio_url TEXT,
  video_url TEXT,
  pdf_url TEXT,
  youtube_url TEXT,
  transcript TEXT,
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'transcribing', 'generating', 'complete', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Generated content table
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sermon_id UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('sermon_notes', 'devotional', 'discussion_guide', 'social_media', 'kids_version')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Sermons indexes
CREATE INDEX idx_sermons_user_id ON sermons(user_id);
CREATE INDEX idx_sermons_status ON sermons(status);
CREATE INDEX idx_sermons_created_at ON sermons(created_at DESC);
CREATE INDEX idx_sermons_user_created ON sermons(user_id, created_at DESC);

-- Generated content indexes
CREATE INDEX idx_generated_content_sermon_id ON generated_content(sermon_id);
CREATE INDEX idx_generated_content_type ON generated_content(sermon_id, content_type);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment sermons processed count
CREATE OR REPLACE FUNCTION increment_sermons_processed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'complete' AND (OLD.status IS NULL OR OLD.status != 'complete') THEN
    UPDATE users_metadata
    SET sermons_processed_count = sermons_processed_count + 1
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update updated_at on sermons
CREATE TRIGGER update_sermons_updated_at
  BEFORE UPDATE ON sermons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to increment sermons processed count
CREATE TRIGGER increment_sermons_processed_trigger
  AFTER UPDATE ON sermons
  FOR EACH ROW
  EXECUTE FUNCTION increment_sermons_processed();

-- Trigger to create user_metadata when user signs up
CREATE OR REPLACE FUNCTION create_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users_metadata (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_metadata();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users metadata policies
CREATE POLICY "Users can view their own metadata"
  ON users_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metadata"
  ON users_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metadata"
  ON users_metadata FOR UPDATE
  USING (auth.uid() = user_id);

-- Sermons policies
CREATE POLICY "Users can view their own sermons"
  ON sermons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sermons"
  ON sermons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sermons"
  ON sermons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sermons"
  ON sermons FOR DELETE
  USING (auth.uid() = user_id);

-- Generated content policies
CREATE POLICY "Users can view content for their sermons"
  ON generated_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sermons
      WHERE sermons.id = generated_content.sermon_id
      AND sermons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert content for their sermons"
  ON generated_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sermons
      WHERE sermons.id = generated_content.sermon_id
      AND sermons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update content for their sermons"
  ON generated_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sermons
      WHERE sermons.id = generated_content.sermon_id
      AND sermons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete content for their sermons"
  ON generated_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sermons
      WHERE sermons.id = generated_content.sermon_id
      AND sermons.user_id = auth.uid()
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
