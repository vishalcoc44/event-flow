-- Test Notification System Functions
-- Run this after the main migration to verify everything works

-- 1. Test creating a notification
SELECT create_notification(
    '00000000-0000-0000-0000-000000000000'::UUID, -- Replace with actual user ID
    'Test Notification',
    'This is a test notification message',
    'EVENT_CREATED',
    '{"event_title": "Test Event", "category_name": "Test Category"}'::jsonb
);

-- 2. Test creating notification from template
SELECT create_notification_from_template(
    '00000000-0000-0000-0000-000000000000'::UUID, -- Replace with actual user ID
    'EVENT_CREATED',
    '{"event_title": "Test Event", "category_name": "Test Category"}'::jsonb
);

-- 3. Test marking notification as read
SELECT mark_notification_read(
    (SELECT id FROM notifications WHERE title = 'Test Notification' LIMIT 1)
);

-- 4. Test marking all notifications as read
SELECT mark_all_notifications_read(
    '00000000-0000-0000-0000-000000000000'::UUID -- Replace with actual user ID
);

-- 5. Test getting unread count
SELECT get_unread_notification_count(
    '00000000-0000-0000-0000-000000000000'::UUID -- Replace with actual user ID
);

-- 6. Test notification summary view
SELECT * FROM notification_summary 
WHERE user_id = '00000000-0000-0000-0000-000000000000'::UUID; -- Replace with actual user ID

-- 7. Test cleaning old notifications
SELECT clean_old_notifications(30);

-- 8. Test processing scheduled notifications
SELECT process_scheduled_notifications();

-- 9. Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'notification_preferences', 'notification_templates');

-- 10. Verify functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'create_notification',
    'create_notification_from_template',
    'mark_notification_read',
    'mark_all_notifications_read',
    'get_unread_notification_count',
    'create_event_reminders',
    'notify_event_followers',
    'clean_old_notifications',
    'process_scheduled_notifications'
);

-- 11. Verify triggers exist
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN (
    'event_notifications_trigger',
    'booking_notifications_trigger',
    'follow_notifications_trigger'
);

-- 12. Verify RLS policies exist
SELECT policyname FROM pg_policies 
WHERE tablename IN ('notifications', 'notification_preferences');

-- 13. Check notification templates
SELECT * FROM notification_templates;

-- 14. Check notification preferences for existing users
SELECT * FROM notification_preferences LIMIT 5;

-- 15. Check recent notifications
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5; 