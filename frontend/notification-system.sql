-- Notification System Migration
-- This migration creates a complete notification system for the Event Management System

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('EVENT_CREATED', 'EVENT_REMINDER', 'BOOKING_CONFIRMED', 'BOOKING_REMINDER', 'FOLLOW_UPDATE', 'CATEGORY_UPDATE')),
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    event_reminders BOOLEAN DEFAULT TRUE,
    booking_reminders BOOLEAN DEFAULT TRUE,
    follow_updates BOOLEAN DEFAULT TRUE,
    category_updates BOOLEAN DEFAULT TRUE,
    reminder_hours INTEGER DEFAULT 24, -- Hours before event to send reminder
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL UNIQUE,
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insert default notification templates
INSERT INTO notification_templates (type, title_template, message_template) VALUES
('EVENT_CREATED', 'New Event: {{event_title}}', 'A new event "{{event_title}}" has been created in {{category_name}}. Check it out!'),
('EVENT_REMINDER', 'Event Reminder: {{event_title}}', 'Don''t forget! Your event "{{event_title}}" is happening {{time_until_event}} at {{location}}.'),
('BOOKING_CONFIRMED', 'Booking Confirmed: {{event_title}}', 'Your booking for "{{event_title}}" has been confirmed. See you there!'),
('BOOKING_REMINDER', 'Booking Reminder: {{event_title}}', 'Reminder: You have a booking for "{{event_title}}" {{time_until_event}} at {{location}}.'),
('FOLLOW_UPDATE', 'Update from {{username}}', '{{username}} has {{action}} {{target_type}} "{{target_name}}".'),
('CATEGORY_UPDATE', 'New Event in {{category_name}}', 'A new event has been added to {{category_name}}, a category you follow.');

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 7. Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title VARCHAR(255),
    p_message TEXT,
    p_type VARCHAR(50),
    p_data JSONB DEFAULT '{}',
    p_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, title, message, type, data, scheduled_at)
    VALUES (p_user_id, p_title, p_message, p_type, p_data, p_scheduled_at)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- 8. Create function to create notification from template
CREATE OR REPLACE FUNCTION create_notification_from_template(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_data JSONB DEFAULT '{}',
    p_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    template_record RECORD;
    notification_id UUID;
    final_title TEXT;
    final_message TEXT;
BEGIN
    -- Get template
    SELECT * INTO template_record 
    FROM notification_templates 
    WHERE type = p_type AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found for type: %', p_type;
    END IF;
    
    -- Replace placeholders in template
    final_title := template_record.title_template;
    final_message := template_record.message_template;
    
    -- Simple placeholder replacement (you can enhance this)
    final_title := replace(final_title, '{{event_title}}', COALESCE(p_data->>'event_title', ''));
    final_title := replace(final_title, '{{category_name}}', COALESCE(p_data->>'category_name', ''));
    final_title := replace(final_title, '{{username}}', COALESCE(p_data->>'username', ''));
    final_title := replace(final_title, '{{target_type}}', COALESCE(p_data->>'target_type', ''));
    final_title := replace(final_title, '{{target_name}}', COALESCE(p_data->>'target_name', ''));
    
    final_message := replace(final_message, '{{event_title}}', COALESCE(p_data->>'event_title', ''));
    final_message := replace(final_message, '{{category_name}}', COALESCE(p_data->>'category_name', ''));
    final_message := replace(final_message, '{{time_until_event}}', COALESCE(p_data->>'time_until_event', ''));
    final_message := replace(final_message, '{{location}}', COALESCE(p_data->>'location', ''));
    final_message := replace(final_message, '{{username}}', COALESCE(p_data->>'username', ''));
    final_message := replace(final_message, '{{action}}', COALESCE(p_data->>'action', ''));
    final_message := replace(final_message, '{{target_type}}', COALESCE(p_data->>'target_type', ''));
    final_message := replace(final_message, '{{target_name}}', COALESCE(p_data->>'target_name', ''));
    
    -- Create notification
    SELECT create_notification(p_user_id, final_title, final_message, p_type, p_data, p_scheduled_at)
    INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- 9. Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, updated_at = NOW()
    WHERE id = p_notification_id;
    
    RETURN FOUND;
END;
$$;

-- 10. Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = p_user_id AND is_read = FALSE;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$;

-- 11. Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    count_val INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_val
    FROM notifications
    WHERE user_id = p_user_id AND is_read = FALSE;
    
    RETURN count_val;
END;
$$;

-- 12. Create function to notify followers of new events
CREATE OR REPLACE FUNCTION notify_event_followers(p_event_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_record RECORD;
    follower_record RECORD;
    notification_count INTEGER := 0;
BEGIN
    -- Get event details
    SELECT e.*, c.name as category_name
    INTO event_record
    FROM events e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE e.id = p_event_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Notify users following the event's category
    FOR follower_record IN
        SELECT f.follower_id
        FROM follows f
        LEFT JOIN notification_preferences np ON f.follower_id = np.user_id
        WHERE f.target_type = 'CATEGORY' 
        AND f.target_id = event_record.category_id
        AND (np.category_updates IS NULL OR np.category_updates = TRUE)
    LOOP
        PERFORM create_notification_from_template(
            follower_record.follower_id,
            'CATEGORY_UPDATE',
            jsonb_build_object(
                'category_name', event_record.category_name,
                'event_title', event_record.title
            )
        );
        
        notification_count := notification_count + 1;
    END LOOP;
    
    RETURN notification_count;
END;
$$;

-- 13. Create function to create event reminder notifications
CREATE OR REPLACE FUNCTION create_event_reminders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    booking_record RECORD;
    reminder_hours INTEGER;
    reminder_count INTEGER := 0;
BEGIN
    -- Get all upcoming bookings that need reminders
    FOR booking_record IN 
        SELECT 
            b.id as booking_id,
            b.user_id,
            b.event_id,
            e.title as event_title,
            e.date as event_date,
            e.time as event_time,
            e.location,
            np.reminder_hours,
            np.event_reminders
        FROM bookings b
        JOIN events e ON b.event_id = e.id
        LEFT JOIN notification_preferences np ON b.user_id = np.user_id
        WHERE b.status = 'CONFIRMED'
        AND e.date > NOW()
        AND e.date <= NOW() + INTERVAL '24 hours'
        AND (np.event_reminders IS NULL OR np.event_reminders = TRUE)
        AND NOT EXISTS (
            SELECT 1 FROM notifications n 
            WHERE n.user_id = b.user_id 
            AND n.type = 'EVENT_REMINDER' 
            AND n.data->>'booking_id' = b.id::text
        )
    LOOP
        -- Calculate time until event
        reminder_hours := COALESCE(booking_record.reminder_hours, 24);
        
        -- Create reminder notification
        PERFORM create_notification_from_template(
            booking_record.user_id,
            'EVENT_REMINDER',
            jsonb_build_object(
                'event_title', booking_record.event_title,
                'time_until_event', 
                CASE 
                    WHEN booking_record.event_date::date = NOW()::date THEN 'today'
                    ELSE 'tomorrow'
                END,
                'location', booking_record.location,
                'booking_id', booking_record.booking_id
            ),
            NOW()
        );
        
        reminder_count := reminder_count + 1;
    END LOOP;
    
    RETURN reminder_count;
END;
$$;

-- 14. Create triggers for automatic notifications

-- Trigger for new events
CREATE OR REPLACE FUNCTION trigger_event_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Notify followers of the category
    PERFORM notify_event_followers(NEW.id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER event_notifications_trigger
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION trigger_event_notifications();

-- Trigger for new bookings
CREATE OR REPLACE FUNCTION trigger_booking_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    event_title TEXT;
BEGIN
    -- Get event title
    SELECT title INTO event_title
    FROM events
    WHERE id = NEW.event_id;
    
    -- Create booking confirmation notification
    PERFORM create_notification_from_template(
        NEW.user_id,
        'BOOKING_CONFIRMED',
        jsonb_build_object(
            'event_title', event_title,
            'booking_id', NEW.id
        )
    );
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER booking_notifications_trigger
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_booking_notifications();

-- Trigger for follow updates
CREATE OR REPLACE FUNCTION trigger_follow_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    target_name TEXT;
    target_type TEXT;
    follower_username TEXT;
BEGIN
    -- Get target details
    IF NEW.target_type = 'USER' THEN
        SELECT username INTO target_name
        FROM auth.users
        WHERE id = NEW.target_id;
        target_type := 'user';
    ELSIF NEW.target_type = 'EVENT' THEN
        SELECT title INTO target_name
        FROM events
        WHERE id = NEW.target_id;
        target_type := 'event';
    ELSIF NEW.target_type = 'CATEGORY' THEN
        SELECT name INTO target_name
        FROM categories
        WHERE id = NEW.target_id;
        target_type := 'category';
    END IF;
    
    -- Get follower username
    SELECT username INTO follower_username
    FROM auth.users
    WHERE id = NEW.follower_id;
    
    -- Create follow notification
    PERFORM create_notification_from_template(
        NEW.target_id,
        'FOLLOW_UPDATE',
        jsonb_build_object(
            'username', follower_username,
            'action', 'started following',
            'target_type', target_type,
            'target_name', target_name
        )
    );
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER follow_notifications_trigger
    AFTER INSERT ON follows
    FOR EACH ROW
    EXECUTE FUNCTION trigger_follow_notifications();

-- 14. Create RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Notification preferences policies
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" ON notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 15. Create view for notification summary
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

-- 16. Create function to clean old notifications
CREATE OR REPLACE FUNCTION clean_old_notifications(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
    AND is_read = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- 17. Create scheduled job to send reminders (this will be called by Edge Function)
CREATE OR REPLACE FUNCTION process_scheduled_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_record RECORD;
    processed_count INTEGER := 0;
BEGIN
    -- Process event reminders
    PERFORM create_event_reminders();
    
    -- Mark scheduled notifications as sent
    UPDATE notifications 
    SET is_sent = TRUE, sent_at = NOW()
    WHERE scheduled_at <= NOW() 
    AND is_sent = FALSE;
    
    GET DIAGNOSTICS processed_count = ROW_COUNT;
    RETURN processed_count;
END;
$$;

-- 18. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notification_preferences TO authenticated;
GRANT ALL ON notification_templates TO authenticated;
GRANT SELECT ON notification_summary TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_notification(UUID, VARCHAR, TEXT, VARCHAR, JSONB, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification_from_template(UUID, VARCHAR, JSONB, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION process_scheduled_notifications() TO authenticated;

-- 19. Create default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences);

-- 20. Add comments for documentation
COMMENT ON TABLE notifications IS 'Stores all user notifications with support for scheduling and templates';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification types and timing';
COMMENT ON TABLE notification_templates IS 'Templates for different types of notifications with placeholder support';
COMMENT ON FUNCTION create_event_reminders() IS 'Creates reminder notifications for upcoming events';
COMMENT ON FUNCTION notify_event_followers() IS 'Notifies category followers when new events are created';
COMMENT ON FUNCTION process_scheduled_notifications() IS 'Processes all scheduled notifications and sends reminders'; 