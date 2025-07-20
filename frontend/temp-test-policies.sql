-- Temporary RLS Policy Modifications for Testing
-- WARNING: Only use this for testing, not in production!

-- Temporarily disable RLS on follows table for testing
-- ALTER TABLE follows DISABLE ROW LEVEL SECURITY;

-- Or create a more permissive policy for testing
DROP POLICY IF EXISTS "Test policy - allow all operations" ON follows;

CREATE POLICY "Test policy - allow all operations" ON follows
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Temporarily allow all operations on users table for testing
DROP POLICY IF EXISTS "Test policy - allow all user operations" ON users;

CREATE POLICY "Test policy - allow all user operations" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Temporarily allow all operations on events table for testing
DROP POLICY IF EXISTS "Test policy - allow all event operations" ON events;

CREATE POLICY "Test policy - allow all event operations" ON events
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Temporarily allow all operations on categories table for testing
DROP POLICY IF EXISTS "Test policy - allow all category operations" ON categories;

CREATE POLICY "Test policy - allow all category operations" ON categories
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('follows', 'users', 'events', 'categories')
ORDER BY tablename, policyname; 