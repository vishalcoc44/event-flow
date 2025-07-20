-- Restore Original RLS Policies After Testing
-- Run this after you're done testing to restore security

-- Remove test policies
DROP POLICY IF EXISTS "Test policy - allow all operations" ON follows;
DROP POLICY IF EXISTS "Test policy - allow all user operations" ON users;
DROP POLICY IF EXISTS "Test policy - allow all event operations" ON events;
DROP POLICY IF EXISTS "Test policy - allow all category operations" ON categories;

-- Re-enable RLS if it was disabled
-- ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Restore original follows policies
CREATE POLICY "Users can view their own follows" ON follows
    FOR SELECT USING (auth.uid() = follower_id);

CREATE POLICY "Users can view who follows them" ON follows
    FOR SELECT USING (
        target_type = 'USER' AND target_id = auth.uid()
    );

CREATE POLICY "Users can view event follows" ON follows
    FOR SELECT USING (
        target_type = 'EVENT' AND EXISTS (
            SELECT 1 FROM events WHERE events.id = follows.target_id
        )
    );

CREATE POLICY "Users can view category follows" ON follows
    FOR SELECT USING (
        target_type = 'CATEGORY' AND EXISTS (
            SELECT 1 FROM categories WHERE categories.id = follows.target_id
        )
    );

CREATE POLICY "Users can create their own follows" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON follows
    FOR DELETE USING (auth.uid() = follower_id);

-- Restore original users policies
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Restore original events policies
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators can modify their events" ON events
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their events" ON events
    FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Admins can modify all events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Restore original categories policies
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Verify policies are restored
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('follows', 'users', 'events', 'categories')
ORDER BY tablename, policyname; 