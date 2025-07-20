-- Review and Rating System Migration
-- This creates a complete review system for events

-- ========================================
-- STEP 1: Create Tables
-- ========================================

-- 1. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE, -- Whether user actually attended
    is_helpful INTEGER DEFAULT 0, -- Count of helpful votes
    is_reported BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id) -- One review per user per event
);

-- 2. Create review_helpful_votes table for tracking helpful votes
CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL, -- true for helpful, false for not helpful
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id) -- One vote per user per review
);

-- 3. Create review_reports table for reporting inappropriate reviews
CREATE TABLE IF NOT EXISTS review_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL CHECK (reason IN ('INAPPROPRIATE', 'SPAM', 'FAKE', 'OFFENSIVE', 'OTHER')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 2: Create Indexes
-- ========================================

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_event_id ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(is_verified);

CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_user_id ON review_helpful_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);

-- ========================================
-- STEP 3: Create Views
-- ========================================

-- 5. Create event rating summary view
CREATE OR REPLACE VIEW event_rating_summary AS
SELECT 
    e.id as event_id,
    e.title as event_title,
    COUNT(r.id) as total_reviews,
    COUNT(r.id) FILTER (WHERE r.is_verified = TRUE) as verified_reviews,
    ROUND(AVG(r.rating), 2) as average_rating,
    COUNT(r.id) FILTER (WHERE r.rating = 5) as five_star_count,
    COUNT(r.id) FILTER (WHERE r.rating = 4) as four_star_count,
    COUNT(r.id) FILTER (WHERE r.rating = 3) as three_star_count,
    COUNT(r.id) FILTER (WHERE r.rating = 2) as two_star_count,
    COUNT(r.id) FILTER (WHERE r.rating = 1) as one_star_count,
    MAX(r.created_at) as latest_review
FROM events e
LEFT JOIN reviews r ON e.id = r.event_id
GROUP BY e.id, e.title;

-- 6. Create user review summary view
CREATE OR REPLACE VIEW user_review_summary AS
SELECT 
    u.id as user_id,
    COALESCE(u.raw_user_meta_data->>'username', u.email) as username,
    COUNT(r.id) as total_reviews,
    ROUND(AVG(r.rating), 2) as average_rating_given,
    COUNT(r.id) FILTER (WHERE r.is_verified = TRUE) as verified_reviews,
    MAX(r.created_at) as latest_review
FROM auth.users u
LEFT JOIN reviews r ON u.id = r.user_id
GROUP BY u.id, u.raw_user_meta_data->>'username', u.email;

-- ========================================
-- STEP 4: Create Functions
-- ========================================

-- 7. Create function to add review
CREATE OR REPLACE FUNCTION add_review(
    p_event_id UUID,
    p_user_id UUID,
    p_rating INTEGER,
    p_title VARCHAR DEFAULT NULL,
    p_comment TEXT DEFAULT NULL,
    p_is_verified BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    review_id UUID;
BEGIN
    -- Check if user has already reviewed this event
    IF EXISTS (SELECT 1 FROM reviews WHERE event_id = p_event_id AND user_id = p_user_id) THEN
        RAISE EXCEPTION 'User has already reviewed this event';
    END IF;
    
    -- Check if rating is valid
    IF p_rating < 1 OR p_rating > 5 THEN
        RAISE EXCEPTION 'Rating must be between 1 and 5';
    END IF;
    
    -- Insert review
    INSERT INTO reviews (event_id, user_id, rating, title, comment, is_verified)
    VALUES (p_event_id, p_user_id, p_rating, p_title, p_comment, p_is_verified)
    RETURNING id INTO review_id;
    
    RETURN review_id;
END;
$$;

-- 8. Create function to update review
CREATE OR REPLACE FUNCTION update_review(
    p_review_id UUID,
    p_user_id UUID,
    p_rating INTEGER DEFAULT NULL,
    p_title VARCHAR DEFAULT NULL,
    p_comment TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user owns the review
    IF NOT EXISTS (SELECT 1 FROM reviews WHERE id = p_review_id AND user_id = p_user_id) THEN
        RETURN FALSE;
    END IF;
    
    -- Update review
    UPDATE reviews 
    SET 
        rating = COALESCE(p_rating, rating),
        title = COALESCE(p_title, title),
        comment = COALESCE(p_comment, comment),
        updated_at = NOW()
    WHERE id = p_review_id AND user_id = p_user_id;
    
    RETURN FOUND;
END;
$$;

-- 9. Create function to delete review
CREATE OR REPLACE FUNCTION delete_review(p_review_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM reviews 
    WHERE id = p_review_id AND user_id = p_user_id;
    
    RETURN FOUND;
END;
$$;

-- 10. Create function to vote on review helpfulness
CREATE OR REPLACE FUNCTION vote_review_helpful(
    p_review_id UUID,
    p_user_id UUID,
    p_is_helpful BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update vote
    INSERT INTO review_helpful_votes (review_id, user_id, is_helpful)
    VALUES (p_review_id, p_user_id, p_is_helpful)
    ON CONFLICT (review_id, user_id) 
    DO UPDATE SET is_helpful = p_is_helpful, created_at = NOW();
    
    -- Update helpful count on review
    UPDATE reviews 
    SET is_helpful = (
        SELECT COUNT(*) 
        FROM review_helpful_votes 
        WHERE review_id = p_review_id AND is_helpful = TRUE
    )
    WHERE id = p_review_id;
    
    RETURN TRUE;
END;
$$;

-- 11. Create function to report review
CREATE OR REPLACE FUNCTION report_review(
    p_review_id UUID,
    p_reporter_id UUID,
    p_reason VARCHAR,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    report_id UUID;
BEGIN
    -- Check if user has already reported this review
    IF EXISTS (SELECT 1 FROM review_reports WHERE review_id = p_review_id AND reporter_id = p_reporter_id) THEN
        RAISE EXCEPTION 'User has already reported this review';
    END IF;
    
    -- Insert report
    INSERT INTO review_reports (review_id, reporter_id, reason, description)
    VALUES (p_review_id, p_reporter_id, p_reason, p_description)
    RETURNING id INTO report_id;
    
    -- Mark review as reported if multiple reports
    UPDATE reviews 
    SET is_reported = TRUE
    WHERE id = p_review_id AND (
        SELECT COUNT(*) FROM review_reports WHERE review_id = p_review_id
    ) >= 3;
    
    RETURN report_id;
END;
$$;

-- 12. Create function to get event reviews with pagination
CREATE OR REPLACE FUNCTION get_event_reviews(
    p_event_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0,
    p_sort_by VARCHAR DEFAULT 'created_at',
    p_sort_order VARCHAR DEFAULT 'DESC'
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    username TEXT,
    rating INTEGER,
    title VARCHAR,
    comment TEXT,
    is_verified BOOLEAN,
    is_helpful INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    helpful_votes_count INTEGER,
    user_helpful_vote BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.user_id,
        COALESCE(u.raw_user_meta_data->>'username', u.email) as username,
        r.rating,
        r.title,
        r.comment,
        r.is_verified,
        r.is_helpful,
        r.created_at,
        COUNT(rhv.id) FILTER (WHERE rhv.is_helpful = TRUE) as helpful_votes_count,
        MAX(rhv2.is_helpful) as user_helpful_vote
    FROM reviews r
    JOIN auth.users u ON r.user_id = u.id
    LEFT JOIN review_helpful_votes rhv ON r.id = rhv.review_id
    LEFT JOIN review_helpful_votes rhv2 ON r.id = rhv2.review_id AND rhv2.user_id = auth.uid()
    WHERE r.event_id = p_event_id
    GROUP BY r.id, r.user_id, u.username, r.rating, r.title, r.comment, r.is_verified, r.is_helpful, r.created_at
    ORDER BY 
        CASE WHEN p_sort_by = 'rating' AND p_sort_order = 'DESC' THEN r.rating END DESC,
        CASE WHEN p_sort_by = 'rating' AND p_sort_order = 'ASC' THEN r.rating END ASC,
        CASE WHEN p_sort_by = 'helpful' AND p_sort_order = 'DESC' THEN r.is_helpful END DESC,
        CASE WHEN p_sort_by = 'helpful' AND p_sort_order = 'ASC' THEN r.is_helpful END ASC,
        CASE WHEN p_sort_by = 'verified' AND p_sort_order = 'DESC' THEN r.is_verified::int END DESC,
        CASE WHEN p_sort_by = 'verified' AND p_sort_order = 'ASC' THEN r.is_verified::int END ASC,
        r.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- ========================================
-- STEP 5: Create Triggers
-- ========================================

-- 13. Create trigger to update event rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_event_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- This trigger ensures the event_rating_summary view stays updated
    -- The view will automatically reflect changes
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER review_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_event_rating();

-- ========================================
-- STEP 6: Create RLS Policies
-- ========================================

-- 14. Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

-- 15. Reviews policies
CREATE POLICY "Users can view all reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- 16. Review helpful votes policies
CREATE POLICY "Users can view all helpful votes" ON review_helpful_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own helpful votes" ON review_helpful_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own helpful votes" ON review_helpful_votes
    FOR UPDATE USING (auth.uid() = user_id);

-- 17. Review reports policies
CREATE POLICY "Users can view their own reports" ON review_reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON review_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ========================================
-- STEP 7: Grant Permissions
-- ========================================

-- 18. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON reviews TO authenticated;
GRANT ALL ON review_helpful_votes TO authenticated;
GRANT ALL ON review_reports TO authenticated;
GRANT SELECT ON event_rating_summary TO authenticated;
GRANT SELECT ON user_review_summary TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION add_review(UUID, UUID, INTEGER, VARCHAR, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_review(UUID, UUID, INTEGER, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_review(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION vote_review_helpful(UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION report_review(UUID, UUID, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_reviews(UUID, INTEGER, INTEGER, VARCHAR, VARCHAR) TO authenticated;

-- ========================================
-- STEP 8: Add Comments
-- ========================================

-- 19. Add comments for documentation
COMMENT ON TABLE reviews IS 'Stores user reviews and ratings for events';
COMMENT ON TABLE review_helpful_votes IS 'Tracks helpful votes on reviews';
COMMENT ON TABLE review_reports IS 'Stores reports of inappropriate reviews';
COMMENT ON VIEW event_rating_summary IS 'Summary of ratings and review counts for each event';
COMMENT ON VIEW user_review_summary IS 'Summary of reviews given by each user';
COMMENT ON FUNCTION add_review(UUID, UUID, INTEGER, VARCHAR, TEXT, BOOLEAN) IS 'Adds a new review for an event';
COMMENT ON FUNCTION get_event_reviews(UUID, INTEGER, INTEGER, VARCHAR, VARCHAR) IS 'Gets paginated reviews for an event with sorting options'; 