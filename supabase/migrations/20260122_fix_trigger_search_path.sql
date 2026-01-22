-- Fix trigger_follow_notifications to use public search path and fully qualified names
CREATE OR REPLACE FUNCTION public.trigger_follow_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
        FROM public.events
        WHERE id = NEW.target_id;
        target_type := 'event';
    ELSIF NEW.target_type = 'CATEGORY' THEN
        SELECT name INTO target_name
        FROM public.categories
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
            'FOLLOW_UPDATE'::character varying,
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

-- Fix update_follower_count to use public search path and fully qualified names
CREATE OR REPLACE FUNCTION public.update_follower_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment follower count
        IF NEW.target_type = 'USER' THEN
            UPDATE public.users SET follower_count = follower_count + 1 WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'EVENT' THEN
            UPDATE public.events SET follower_count = follower_count + 1 WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'CATEGORY' THEN
            UPDATE public.categories SET follower_count = follower_count + 1 WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement follower count
        IF OLD.target_type = 'USER' THEN
            UPDATE public.users SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'EVENT' THEN
            UPDATE public.events SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'CATEGORY' THEN
            UPDATE public.categories SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.target_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$;