# Supabase Database Setup Instructions

## Option 1: Using Supabase Dashboard (Recommended for Quick Setup)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Run the migrations in order:

### Step 1: Run Initial Schema Migration

Copy and paste the contents of `supabase/migrations/20240213000000_initial_schema.sql` into the SQL Editor and click **Run**.

This creates:
- `users_metadata` table
- `sermons` table
- `generated_content` table
- `subscriptions` table
- All indexes, triggers, and RLS policies

### Step 2: Run Storage Setup Migration

Copy and paste the contents of `supabase/migrations/20240213000001_storage_setup.sql` into the SQL Editor and click **Run**.

This creates:
- `sermons` storage bucket
- Storage RLS policies for file uploads

### Step 3: Verify Setup

Run this query to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see: `users_metadata`, `sermons`, `generated_content`, `subscriptions`

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

## Common Issues

### Error: "Database error saving new user 303"
This means the `users_metadata` table doesn't exist yet. Run the migrations above.

### Error: "relation 'storage.buckets' does not exist"
Run the storage setup migration (Step 2).

### Auth works but no user_metadata created
The trigger should automatically create a row in `users_metadata` when a user signs up.

Check if the trigger exists:
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

If it doesn't exist, the initial migration wasn't run completely.

## Testing Your Setup

After running migrations:

1. Try signing up with a new account
2. Check if the user was created:
   ```sql
   SELECT * FROM users_metadata;
   ```
3. The table should have a row with your user_id

## Need Help?

If you encounter issues:
1. Check the Supabase logs in Dashboard → Database → Logs
2. Verify your environment variables in `.env.local` are correct
3. Make sure you're using the correct project URL and anon key
