-- Test Review System
-- Run this after the main migration to verify everything works

-- 1. Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reviews', 'review_helpful_votes', 'review_reports');

-- 2. Check if views exist
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('event_rating_summary', 'user_review_summary');

-- 3. Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'add_review',
    'update_review', 
    'delete_review',
    'vote_review_helpful',
    'report_review',
    'get_event_reviews'
);

-- 4. Check RLS policies
SELECT policyname FROM pg_policies 
WHERE tablename IN ('reviews', 'review_helpful_votes', 'review_reports');

-- 5. Test adding a review (replace with actual IDs)
-- SELECT add_review(
--     'your-event-id-here'::UUID,
--     'your-user-id-here'::UUID,
--     5,
--     'Amazing Event!',
--     'This was one of the best events I have ever attended. Highly recommended!',
--     true
-- );

-- 6. Test getting event reviews (replace with actual event ID)
-- SELECT * FROM get_event_reviews('your-event-id-here'::UUID);

-- 7. Test rating summary (replace with actual event ID)
-- SELECT * FROM event_rating_summary WHERE event_id = 'your-event-id-here'::UUID;

-- 8. Test user review summary (replace with actual user ID)
-- SELECT * FROM user_review_summary WHERE user_id = 'your-user-id-here'::UUID;

-- 9. Check recent reviews
SELECT 
    r.id,
    r.rating,
    r.title,
    r.comment,
    r.is_verified,
    r.created_at,
    e.title as event_title,
    COALESCE(u.raw_user_meta_data->>'username', u.email) as username
FROM reviews r
JOIN events e ON r.event_id = e.id
JOIN auth.users u ON r.user_id = u.id
ORDER BY r.created_at DESC
LIMIT 5;

-- 10. Check rating distribution
SELECT 
    rating,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM reviews
GROUP BY rating
ORDER BY rating DESC;

-- 11. Check helpful votes
SELECT 
    r.title,
    r.is_helpful,
    COUNT(rhv.id) as helpful_votes_count
FROM reviews r
LEFT JOIN review_helpful_votes rhv ON r.id = rhv.review_id AND rhv.is_helpful = TRUE
GROUP BY r.id, r.title, r.is_helpful
ORDER BY r.is_helpful DESC
LIMIT 5;

-- 12. Check review reports
SELECT 
    rr.reason,
    rr.status,
    rr.created_at,
    r.title as review_title
FROM review_reports rr
JOIN reviews r ON rr.review_id = r.id
ORDER BY rr.created_at DESC
LIMIT 5; 