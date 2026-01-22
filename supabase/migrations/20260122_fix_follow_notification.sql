-- Redefine create_notification_from_template with explicit types
CREATE OR REPLACE FUNCTION public.create_notification_from_template(
    p_user_id uuid, 
    p_type character varying, 
    p_data jsonb DEFAULT '{}'::jsonb, 
    p_scheduled_at timestamp with time zone DEFAULT NULL::timestamp with time zone
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    template_record RECORD;
    notification_id UUID;
    final_title TEXT;
    final_message TEXT;
BEGIN
    SELECT * INTO template_record 
    FROM public.notification_templates 
    WHERE type = p_type AND is_active = TRUE;
    
    IF NOT FOUND THEN
        -- Fallback if template is missing, don't fail hard
        RAISE NOTICE 'Template not found for type: %, skipping notification', p_type;
        RETURN NULL;
    END IF;
    
    final_title := template_record.title_template;
    final_message := template_record.message_template;
    
    -- Replace placeholders safely
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
    
    INSERT INTO public.notifications (user_id, title, message, type, data, scheduled_at)
    VALUES (p_user_id, final_title, final_message, p_type, p_data, p_scheduled_at)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$function$;

-- Update trigger_follow_notifications to use explicit casting
CREATE OR REPLACE FUNCTION public.trigger_follow_notifications()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
    target_name TEXT;
    target_type TEXT;
    follower_username TEXT;
BEGIN
    -- Get target details
    IF NEW.target_type = 'USER' THEN
        SELECT COALESCE(username, email) INTO target_name
        FROM public.users
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
    SELECT COALESCE(username, email) INTO follower_username
    FROM public.users
    WHERE id = NEW.follower_id;
    
    -- Create follow notification with EXPLICIT CASTING for the second argument
    IF NEW.target_type = 'USER' THEN
        PERFORM public.create_notification_from_template(
            NEW.target_id,
            'FOLLOW_UPDATE'::character varying, -- Explicit cast here
            jsonb_build_object(
                'username', follower_username,
                'action', 'started following',
                'target_type', target_type,
                'target_name', target_name
            )
        );
    END IF;
    
    RETURN NEW;
END;
$function$;
