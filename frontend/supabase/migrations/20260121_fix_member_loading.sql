-- Fix get_organization_members RPC
-- The previous version attempted to select avatar_url directly from users table
-- But avatar_url is stored in user_profiles as profile_image_url

CREATE OR REPLACE FUNCTION public.get_organization_members(org_id uuid)
RETURNS TABLE(
    user_id uuid, 
    email character varying, 
    username character varying, 
    first_name character varying, 
    last_name character varying, 
    role_in_org character varying, 
    is_org_admin boolean, 
    joined_at timestamp with time zone, 
    avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        u.role_in_org,
        u.is_org_admin,
        u.joined_at,
        up.profile_image_url as avatar_url
    FROM public.users u
    LEFT JOIN public.user_profiles up ON u.id = up.user_id
    WHERE u.organization_id = org_id;
END;
$function$;
