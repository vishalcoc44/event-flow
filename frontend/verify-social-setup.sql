-- Verify Social Features Setup
-- Run this after running add-social-features.sql to verify everything is working

-- 1. Check if follows table exists and has correct structure
SELECT 
    'follows' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows') as table_exists,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'follows') as column_count;

-- 2. Check follows table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'follows' 
ORDER BY ordinal_position;

-- 3. Check if follower_count columns exist in all tables
SELECT 
    table_name,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name AND column_name = 'follower_count') as has_follower_count
FROM (VALUES ('users'), ('events'), ('categories')) AS t(table_name);

-- 4. Check RLS policies on follows table
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'follows'
ORDER BY policyname;

-- 5. Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'follows';

-- 6. Check if trigger function exists
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'update_follower_count';

-- 7. Test data (this will show 0 if no follows exist yet)
SELECT 
    'Total follows' as metric,
    COUNT(*) as count
FROM follows
UNION ALL
SELECT 
    'User follows' as metric,
    COUNT(*) as count
FROM follows WHERE target_type = 'USER'
UNION ALL
SELECT 
    'Event follows' as metric,
    COUNT(*) as count
FROM follows WHERE target_type = 'EVENT'
UNION ALL
SELECT 
    'Category follows' as metric,
    COUNT(*) as count
FROM follows WHERE target_type = 'CATEGORY';

-- 8. Check foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'follows';

-- 9. Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'follows'; 