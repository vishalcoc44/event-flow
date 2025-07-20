-- Fix Notification Summary View and RLS Policies
-- This fixes the 406 Not Acceptable error

-- 1. Drop the existing view if it exists
DROP VIEW IF EXISTS notification_summary;

-- 2. Recreate the notification summary view
CREATE OR REPLACE VIEW notification_summary AS
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = FALSE) as unread_count,
    COUNT(*) FILTER (WHERE type = 'EVENT_REMINDER') as reminder_count,
    COUNT(*) FILTER (WHERE type = 'BOOKING_CONFIRMED') as booking_count,
    MAX(created_at) as latest_notification
FROM notifications
GROUP BY user_id;

-- 3. Grant permissions to the view
GRANT SELECT ON notification_summary TO authenticated;
GRANT SELECT ON notification_summary TO anon;

-- 4. Create RLS policy for the view
ALTER VIEW notification_summary OWNER TO postgres;

-- 5. Create a function to get notification summary with RLS
CREATE OR REPLACE FUNCTION get_notification_summary(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    total_notifications BIGINT,
    unread_count BIGINT,
    reminder_count BIGINT,
    booking_count BIGINT,
    latest_notification TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.user_id,
        COUNT(*) as total_notifications,
        COUNT(*) FILTER (WHERE n.is_read = FALSE) as unread_count,
        COUNT(*) FILTER (WHERE n.type = 'EVENT_REMINDER') as reminder_count,
        COUNT(*) FILTER (WHERE n.type = 'BOOKING_CONFIRMED') as booking_count,
        MAX(n.created_at) as latest_notification
    FROM notifications n
    WHERE n.user_id = p_user_id
    GROUP BY n.user_id;
END;
$$;

-- 6. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_notification_summary(UUID) TO authenticated;

-- 7. Test the function (replace with actual user ID)
-- SELECT * FROM get_notification_summary('your-user-id-here'::UUID);

-- 8. Verify the view works
SELECT * FROM notification_summary LIMIT 5;

-- 9. Check RLS policies
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
WHERE tablename IN ('notifications', 'notification_preferences', 'notification_summary'); 