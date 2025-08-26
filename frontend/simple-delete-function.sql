-- Simple safe_delete_event_space function for Supabase
-- This follows the same patterns as your existing database functions

-- Drop any existing versions
DROP FUNCTION IF EXISTS public.safe_delete_event_space;

-- Create the function
CREATE OR REPLACE FUNCTION public.safe_delete_event_space(
    p_space_id UUID,
    p_user_id UUID,
    p_move_events_to_space_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    space_org_id UUID;
    user_org_id UUID;
    user_role_in_org VARCHAR;
    event_count INTEGER;
    total_spaces INTEGER;
    events_moved INTEGER := 0;
    target_space_id UUID;
BEGIN
    -- Debug: Log the start of the function
    RAISE NOTICE 'Starting deletion for space_id: %, user_id: %', p_space_id, p_user_id;
    
    -- Get the space's organization
    SELECT organization_id INTO space_org_id
    FROM public.event_spaces 
    WHERE id = p_space_id;
    
    IF space_org_id IS NULL THEN
        RAISE EXCEPTION 'Event space not found';
    END IF;
    
    RAISE NOTICE 'Found space in organization: %', space_org_id;
    
    -- Get user's organization and role
    SELECT organization_id, role_in_org INTO user_org_id, user_role_in_org
    FROM public.users 
    WHERE id = p_user_id;
    
    -- Check permissions
    IF user_org_id IS NULL OR user_org_id != space_org_id THEN
        RAISE EXCEPTION 'User does not have access to this event space';
    END IF;
    
    IF user_role_in_org NOT IN ('OWNER', 'ADMIN') THEN
        RAISE EXCEPTION 'Only organization owners and admins can delete event spaces';
    END IF;
    
    -- Count events in this space
    SELECT COUNT(*) INTO event_count
    FROM public.events 
    WHERE event_space_id = p_space_id;
    
    -- Count total spaces in organization
    SELECT COUNT(*) INTO total_spaces
    FROM public.event_spaces 
    WHERE organization_id = space_org_id;
    
    RAISE NOTICE 'Event count: %, Total spaces: %', event_count, total_spaces;
    
    -- If this is the last space and it has events, prevent deletion
    IF total_spaces <= 1 AND event_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete the last event space when it contains events. Please delete the events first.';
    END IF;
    
    -- IMPORTANT: Check if there are any events still referencing this space
    -- This could be the reason deletion is failing silently
    SELECT COUNT(*) INTO event_count
    FROM public.events 
    WHERE event_space_id = p_space_id;
    
    RAISE NOTICE 'Final event count check before deletion: %', event_count;
    
    -- If there are events and this is not the last space, move them
    IF event_count > 0 AND total_spaces > 1 THEN
        -- Find another space to move events to
        IF p_move_events_to_space_id IS NOT NULL THEN
            -- Validate the target space
            SELECT id INTO target_space_id
            FROM public.event_spaces 
            WHERE id = p_move_events_to_space_id 
            AND organization_id = space_org_id;
            
            IF target_space_id IS NULL THEN
                RAISE EXCEPTION 'Target event space not found';
            END IF;
        ELSE
            -- Find any other space in the same organization
            SELECT id INTO target_space_id
            FROM public.event_spaces 
            WHERE organization_id = space_org_id 
            AND id != p_space_id
            LIMIT 1;
            
            IF target_space_id IS NULL THEN
                RAISE EXCEPTION 'No alternative event space found';
            END IF;
        END IF;
        
        -- Move the events
        UPDATE public.events 
        SET event_space_id = target_space_id
        WHERE event_space_id = p_space_id;
        
        events_moved := event_count;
    END IF;
    
    -- Delete the event space
    DELETE FROM public.event_spaces WHERE id = p_space_id;
    
    -- Check if the deletion actually happened
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event space was not deleted - possibly due to foreign key constraints or permissions';
    END IF;
    
    -- Double-check that it's actually gone
    IF EXISTS (SELECT 1 FROM public.event_spaces WHERE id = p_space_id) THEN
        RAISE EXCEPTION 'Event space still exists after deletion attempt - check for constraints or triggers';
    END IF;
    
    -- Return success result
    RETURN json_build_object(
        'success', true,
        'events_moved', events_moved,
        'moved_to_space_id', target_space_id,
        'message', CASE 
            WHEN events_moved > 0 THEN 
                'Event space deleted successfully. ' || events_moved || ' events were moved to another space.'
            ELSE 
                'Event space deleted successfully.'
        END
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to delete event space: ' || SQLERRM
        );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.safe_delete_event_space TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_event_space TO service_role;
