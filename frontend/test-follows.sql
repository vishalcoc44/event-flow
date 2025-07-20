-- Test script to verify follows table is working
-- Run this in Supabase SQL Editor to test the setup

-- Check if follows table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'follows'
) as follows_table_exists;

-- Check follows table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'follows' 
ORDER BY ordinal_position;

-- Check if there are any follows
SELECT COUNT(*) as total_follows FROM follows;

-- Check if follower_count columns exist
SELECT 
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'follower_count') as users_has_follower_count,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'follower_count') as events_has_follower_count,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'follower_count') as categories_has_follower_count;

-- Check RLS policies on follows table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'follows';

-- Test insert (this will only work if you're authenticated)
-- INSERT INTO follows (follower_id, target_id, target_type) 
-- VALUES ('your-user-id', 'target-user-id', 'USER'); 