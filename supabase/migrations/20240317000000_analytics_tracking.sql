-- Create analytics_events table to track user activity
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sermon_id UUID REFERENCES sermons(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'sermon_created',
    'content_generated',
    'content_exported',
    'devotional_viewed'
  )),
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_created ON analytics_events(user_id, created_at);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can only view their own analytics
CREATE POLICY "Users can view their own analytics"
ON analytics_events FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own analytics
CREATE POLICY "Users can insert their own analytics"
ON analytics_events FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create a function to get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(
  p_user_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'sermons_created', (
      SELECT COUNT(*) FROM analytics_events
      WHERE user_id = p_user_id
        AND event_type = 'sermon_created'
        AND created_at BETWEEN p_start_date AND p_end_date
    ),
    'content_generated', (
      SELECT COUNT(*) FROM analytics_events
      WHERE user_id = p_user_id
        AND event_type = 'content_generated'
        AND created_at BETWEEN p_start_date AND p_end_date
    ),
    'content_exported', (
      SELECT COUNT(*) FROM analytics_events
      WHERE user_id = p_user_id
        AND event_type = 'content_exported'
        AND created_at BETWEEN p_start_date AND p_end_date
    ),
    'devotional_views', (
      SELECT COUNT(*) FROM analytics_events
      WHERE user_id = p_user_id
        AND event_type = 'devotional_viewed'
        AND created_at BETWEEN p_start_date AND p_end_date
    ),
    'content_by_type', (
      SELECT COALESCE(json_object_agg(content_type, count), '{}')
      FROM (
        SELECT event_data->>'content_type' as content_type, COUNT(*) as count
        FROM analytics_events
        WHERE user_id = p_user_id
          AND event_type = 'content_generated'
          AND created_at BETWEEN p_start_date AND p_end_date
          AND event_data->>'content_type' IS NOT NULL
        GROUP BY event_data->>'content_type'
      ) t
    ),
    'exports_by_format', (
      SELECT COALESCE(json_object_agg(format, count), '{}')
      FROM (
        SELECT event_data->>'format' as format, COUNT(*) as count
        FROM analytics_events
        WHERE user_id = p_user_id
          AND event_type = 'content_exported'
          AND created_at BETWEEN p_start_date AND p_end_date
          AND event_data->>'format' IS NOT NULL
        GROUP BY event_data->>'format'
      ) t
    ),
    'daily_activity', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]')
      FROM (
        SELECT
          DATE(created_at) as date,
          COUNT(*) FILTER (WHERE event_type = 'sermon_created') as sermons,
          COUNT(*) FILTER (WHERE event_type = 'content_generated') as generated,
          COUNT(*) FILTER (WHERE event_type = 'content_exported') as exported
        FROM analytics_events
        WHERE user_id = p_user_id
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
