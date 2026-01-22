-- Create badge_type enum
DO $$ BEGIN
    CREATE TYPE badge_type AS ENUM (
        'FREQUENT_FLYER', -- 5+ bookings
        'EVENT_ENTHUSIAST', -- 10+ bookings
        'VIP_MEMBER', -- 25+ bookings
        'EARLY_ADOPTER', -- First 100 users
        'TOP_REVIEWER' -- 5+ helpful reviews
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_type badge_type NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT user_badges_unique_type UNIQUE (user_id, badge_type)
);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own badges
CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT
    USING (auth.uid() = user_id);

-- Public can view badges if profile is public (can be refined later)
CREATE POLICY "Public can view badges" ON user_badges
    FOR SELECT
    USING (true);

-- Trigger function to award badges
CREATE OR REPLACE FUNCTION award_badges()
RETURNS TRIGGER AS $$
DECLARE
    v_booking_count INT;
BEGIN
    -- Only check on INSERT or UPDATE (when status becomes CONFIRMED)
    IF (TG_OP = 'INSERT' AND NEW.status = 'CONFIRMED') OR
       (TG_OP = 'UPDATE' AND OLD.status != 'CONFIRMED' AND NEW.status = 'CONFIRMED') THEN
        
        -- Count confirmed bookings for the user
        SELECT COUNT(*) INTO v_booking_count
        FROM bookings
        WHERE user_id = NEW.user_id AND status = 'CONFIRMED';

        -- Check for Frequent Flyer (5+)
        IF v_booking_count >= 5 THEN
            INSERT INTO user_badges (user_id, badge_type)
            VALUES (NEW.user_id, 'FREQUENT_FLYER')
            ON CONFLICT (user_id, badge_type) DO NOTHING;
        END IF;

        -- Check for Event Enthusiast (10+)
        IF v_booking_count >= 10 THEN
            INSERT INTO user_badges (user_id, badge_type)
            VALUES (NEW.user_id, 'EVENT_ENTHUSIAST')
            ON CONFLICT (user_id, badge_type) DO NOTHING;
        END IF;

        -- Check for VIP Member (25+)
        IF v_booking_count >= 25 THEN
            INSERT INTO user_badges (user_id, badge_type)
            VALUES (NEW.user_id, 'VIP_MEMBER')
            ON CONFLICT (user_id, badge_type) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for bookings
CREATE TRIGGER tr_award_badges_on_booking
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION award_badges();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
