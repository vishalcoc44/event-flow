-- Fix follows table and foreign key relationships
-- Run this in Supabase SQL Editor if you're getting foreign key errors

-- Drop existing follows table if it exists
DROP TABLE IF EXISTS follows CASCADE;

-- Create follows table with proper foreign key constraints
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL,
    target_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('USER', 'EVENT', 'CATEGORY')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, target_id, target_type)
);

-- Add foreign key constraints with explicit names
ALTER TABLE follows 
ADD CONSTRAINT follows_follower_id_fkey 
FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_target_id ON follows(target_id);
CREATE INDEX idx_follows_target_type ON follows(target_type);

-- Enable RLS on follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Create policies for follows table
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

-- Add follower count columns to existing tables if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'follower_count') THEN
        ALTER TABLE users ADD COLUMN follower_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'follower_count') THEN
        ALTER TABLE events ADD COLUMN follower_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'follower_count') THEN
        ALTER TABLE categories ADD COLUMN follower_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create or replace trigger function
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_follower_count ON follows;

-- Create trigger
CREATE TRIGGER trigger_update_follower_count
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_count();

-- Grant permissions
GRANT SELECT ON follows TO authenticated;
GRANT INSERT ON follows TO authenticated;
GRANT DELETE ON follows TO authenticated; 