-- Fix Foreign Key Relationships for Organization Invitations
-- This addresses the issue where the invitation functions are trying to join tables that don't have proper relationships

-- The issue: organization_invitations.invited_by references auth.users.id
-- But the functions are trying to join with public.users.id
-- This creates a mismatch that causes the "Could not find a relationship" error

-- Fix the get_user_organization_invitations function
CREATE OR REPLACE FUNCTION public.get_user_organization_invitations()
 RETURNS TABLE(id uuid, organization_id uuid, organization_name character varying, role character varying, invited_by_name character varying, message text, invitation_token uuid, expires_at timestamp with time zone, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
    user_id UUID;
    user_email VARCHAR;
BEGIN
    -- Get current user
    user_id := auth.uid();
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Get user email
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;

    RETURN QUERY
    SELECT
        i.id,
        i.organization_id,
        o.name as organization_name,
        i.role,
        COALESCE(u.first_name || ' ' || u.last_name, au.email) as invited_by_name,
        i.message,
        i.invitation_token,
        i.expires_at,
        i.created_at
    FROM public.organization_invitations i
    JOIN public.organizations o ON i.organization_id = o.id
    LEFT JOIN auth.users au ON i.invited_by = au.id
    LEFT JOIN public.users u ON au.id = u.id  -- Join through auth.users to public.users
    WHERE i.email = user_email
    AND i.status = 'PENDING'
    AND i.expires_at > NOW()
    ORDER BY i.created_at DESC;
END;
$function$;

-- Alternative approach: Fix the foreign key relationship
-- If the above doesn't work, we can update the foreign key to reference public.users instead
-- But this would require data migration, so let's try the JOIN fix first

-- Also fix the send_organization_invitation function to ensure proper relationships
CREATE OR REPLACE FUNCTION public.send_organization_invitation(
    p_organization_id UUID,
    p_email VARCHAR,
    p_role VARCHAR DEFAULT 'USER',
    p_message TEXT DEFAULT NULL
)
 RETURNS UUID
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
    invitation_id UUID;
    inviter_id UUID;
    org_name VARCHAR;
    existing_invitation_id UUID;
BEGIN
    -- Get current user
    inviter_id := auth.uid();
    IF inviter_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Check if inviter has permission
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = inviter_id
        AND organization_id = p_organization_id
        AND role_in_org IN ('OWNER', 'ADMIN')
    ) THEN
        RAISE EXCEPTION 'Only organization owners and admins can send invitations';
    END IF;

    -- Get organization name
    SELECT name INTO org_name
    FROM public.organizations
    WHERE id = p_organization_id;

    -- Check for existing pending invitation
    SELECT id INTO existing_invitation_id
    FROM public.organization_invitations
    WHERE organization_id = p_organization_id
    AND email = p_email
    AND status = 'PENDING'
    AND expires_at > NOW();

    IF existing_invitation_id IS NOT NULL THEN
        RAISE EXCEPTION 'A pending invitation already exists for this email';
    END IF;

    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM public.users u
        JOIN auth.users au ON u.id = au.id
        WHERE au.email = p_email
        AND u.organization_id = p_organization_id
    ) THEN
        RAISE EXCEPTION 'User is already a member of this organization';
    END IF;

    -- Create invitation
    INSERT INTO public.organization_invitations (
        organization_id,
        email,
        invited_by,
        role,
        message
    )
    VALUES (
        p_organization_id,
        p_email,
        inviter_id,  -- This should reference the user ID from auth.users/public.users
        p_role,
        p_message
    )
    RETURNING id INTO invitation_id;

    -- Create notification for the invited user (if they exist)
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        PERFORM public.create_notification_from_template(
            (SELECT id FROM auth.users WHERE email = p_email),
            'ORGANIZATION_INVITATION',
            jsonb_build_object(
                'organization_name', org_name,
                'inviter_name', (SELECT COALESCE(first_name || ' ' || last_name, email) FROM public.users WHERE id = inviter_id),
                'role', p_role,
                'invitation_id', invitation_id
            )
        );
    END IF;

    RETURN invitation_id;
END;
$function$;

-- Fix Row Level Security (RLS) Policies for organization_invitations table
-- This will allow proper access to invitation data

-- Enable RLS on the table (if not already enabled)
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins can manage invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization members can view invitations" ON public.organization_invitations;

-- Create RLS policies for organization_invitations table

-- Policy 1: Users can view their own pending invitations
CREATE POLICY "Users can view their own invitations"
ON public.organization_invitations
FOR SELECT
USING (
  auth.email() = email
  AND status = 'PENDING'
  AND expires_at > NOW()
);

-- Policy 2: Organization owners and admins can view all invitations for their organization
CREATE POLICY "Organization admins can view invitations"
ON public.organization_invitations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = organization_invitations.organization_id
    AND users.role_in_org IN ('OWNER', 'ADMIN')
  )
);

-- Policy 3: Organization owners and admins can create invitations
CREATE POLICY "Organization admins can create invitations"
ON public.organization_invitations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = organization_invitations.organization_id
    AND users.role_in_org IN ('OWNER', 'ADMIN')
  )
);

-- Policy 4: Organization owners and admins can update invitations
CREATE POLICY "Organization admins can update invitations"
ON public.organization_invitations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = organization_invitations.organization_id
    AND users.role_in_org IN ('OWNER', 'ADMIN')
  )
);

-- Policy 5: Organization owners and admins can delete invitations
CREATE POLICY "Organization admins can delete invitations"
ON public.organization_invitations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = organization_invitations.organization_id
    AND users.role_in_org IN ('OWNER', 'ADMIN')
  )
);

-- Also ensure that the foreign key constraints are set up correctly
-- The organization_invitations.invited_by should reference the same table as users.id
-- This might require checking the actual constraint and potentially recreating it

-- Check current constraints (for debugging)
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'organization_invitations';
