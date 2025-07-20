-- Add Social Features to Existing Schema
-- This script adds only the missing social features without affecting existing tables

-- 1. Add follower_count columns to existing tables
DO $$ 
BEGIN
    -- Add follower_count to users table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'follower_count') THEN
        ALTER TABLE users ADD COLUMN follower_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added follower_count column to users table';
    ELSE
        RAISE NOTICE 'follower_count column already exists in users table';
    END IF;
    
    -- Add follower_count to events table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'follower_count') THEN
        ALTER TABLE events ADD COLUMN follower_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added follower_count column to events table';
    ELSE
        RAISE NOTICE 'follower_count column already exists in events table';
    END IF;
    
    -- Add follower_count to categories table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'follower_count') THEN
        ALTER TABLE categories ADD COLUMN follower_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added follower_count column to categories table';
    ELSE
        RAISE NOTICE 'follower_count column already exists in categories table';
    END IF;
END $$;

-- 2. Create follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL,
    target_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('USER', 'EVENT', 'CATEGORY')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, target_id, target_type)
);

-- 3. Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'follows_follower_id_fkey' 
        AND table_name = 'follows'
    ) THEN
        ALTER TABLE follows 
        ADD CONSTRAINT follows_follower_id_fkey 
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint follows_follower_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint follows_follower_id_fkey already exists';
    END IF;
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_target_id ON follows(target_id);
CREATE INDEX IF NOT EXISTS idx_follows_target_type ON follows(target_type);

-- 5. Enable RLS on follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies on follows table if they exist
DROP POLICY IF EXISTS "Users can view their own follows" ON follows;
DROP POLICY IF EXISTS "Users can view who follows them" ON follows;
DROP POLICY IF EXISTS "Users can view event follows" ON follows;
DROP POLICY IF EXISTS "Users can view category follows" ON follows;
DROP POLICY IF EXISTS "Users can create their own follows" ON follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON follows;

-- 7. Create policies for follows table
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

-- 8. Create or replace trigger function
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment follower count
        IF NEW.target_type = 'USER' THEN
            UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'EVENT' THEN
            UPDATE events SET follower_count = follower_count + 1 WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'CATEGORY' THEN
            UPDATE categories SET follower_count = follower_count + 1 WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement follower count
        IF OLD.target_type = 'USER' THEN
            UPDATE users SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'EVENT' THEN
            UPDATE events SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'CATEGORY' THEN
            UPDATE categories SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.target_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_follower_count ON follows;

-- 10. Create trigger
CREATE TRIGGER trigger_update_follower_count
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_count();

-- 11. Grant permissions
GRANT SELECT ON follows TO authenticated;
GRANT INSERT ON follows TO authenticated;
GRANT DELETE ON follows TO authenticated;

-- 12. Verify the setup
DO $$
BEGIN
    RAISE NOTICE 'Social features setup completed successfully!';
    RAISE NOTICE 'Follows table created/verified';
    RAISE NOTICE 'Follower count columns added to users, events, and categories tables';
    RAISE NOTICE 'RLS policies created for follows table';
    RAISE NOTICE 'Trigger function created for automatic follower count updates';
END $$; 