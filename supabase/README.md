# Supabase Database Setup

This directory contains the database schema migrations for the SermonForge application.

## Schema Overview

The database consists of four main tables:

1. **users_metadata** - Extended user profile information
2. **sermons** - Sermon records with upload tracking
3. **generated_content** - AI-generated content from sermons
4. **subscriptions** - User subscription and billing information

## Running Migrations

### Using Supabase CLI

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

### Manual Migration (via Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/20240213000000_initial_schema.sql`
4. Paste and run the SQL

## Features

### Row Level Security (RLS)
All tables have RLS enabled to ensure users can only access their own data.

### Automatic Triggers
- `updated_at` timestamps are automatically updated on changes
- User metadata is automatically created when a new user signs up
- Sermon processed count increments when a sermon is completed

### Indexes
Optimized indexes for:
- User lookups
- Sermon status filtering
- Content type queries
- Subscription management

## TypeScript Types

Database types are auto-generated in `/types/database.ts` and provide full type safety when querying the database.

Example usage:

```typescript
import { createClient } from '@/lib/supabase/client'
import type { Sermon, InsertSermon } from '@/types'

const supabase = createClient()

// Type-safe insert
const newSermon: InsertSermon = {
  user_id: userId,
  title: 'My Sermon',
  sermon_date: '2024-02-13',
  input_type: 'audio',
  audio_url: 'https://...',
}

const { data, error } = await supabase
  .from('sermons')
  .insert(newSermon)
  .select()
  .single()

// data is typed as Sermon
```

## Content Type Schemas

Generated content is stored as JSONB. TypeScript interfaces are provided for each content type:

- `SermonNotesContent` - Fill-in-the-blank sermon notes
- `DevotionalContent` - Devotional blog posts
- `DiscussionGuideContent` - Small group discussion guides
- `SocialMediaContent` - Social media posts
- `KidsVersionContent` - Child-friendly sermon summaries
