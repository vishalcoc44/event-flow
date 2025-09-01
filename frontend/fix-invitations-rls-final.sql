-- Final Fix for Organization Invitations RLS Policies
-- Run this SQL when database DDL operations are allowed
-- This will fix the 403 Forbidden error when loading invitations

-- Enable RLS on organization_invitations table (if not already enabled)
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins can view invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins can create invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins can update invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins can delete invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization members can view invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization members can create invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization members can update invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization members can delete invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Users can view their own invitations by email" ON public.organization_invitations;

-- Create comprehensive RLS policies for organization_invitations

-- 1. Users can view their own pending invitations (by email)
CREATE POLICY "Users can view their own pending invitations"
ON public.organization_invitations
FOR SELECT
USING (
  auth.email() = email
  AND status = 'PENDING'
  AND expires_at > NOW()
);

-- 2. Organization owners and admins can view all invitations for their organization
CREATE POLICY "Organization admins can view all invitations"
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

-- 3. Organization owners and admins can create invitations
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
  AND invited_by = auth.uid()
);

-- 4. Organization owners and admins can update invitations they created
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
  AND invited_by = auth.uid()
);

-- 5. Organization owners and admins can delete invitations they created
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
  AND invited_by = auth.uid()
);

-- Create the necessary database functions for proper invitation management

-- Function to get user organization invitations
CREATE OR REPLACE FUNCTION public.get_user_organization_invitations()
 RETURNS TABLE(
   id uuid,
   organization_id uuid,
   organization_name character varying,
   role character varying,
   invited_by_name character varying,
   message text,
   invitation_token uuid,
   expires_at timestamp with time zone,
   created_at timestamp with time zone
 )
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
    LEFT JOIN public.users u ON au.id = u.id
    WHERE i.email = user_email
    AND i.status = 'PENDING'
    AND i.expires_at > NOW()
    ORDER BY i.created_at DESC;
END;
$function$;

-- Function to send organization invitations
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
        inviter_id,
        p_role,
        p_message
    )
    RETURNING id INTO invitation_id;

    -- Create notification for the invited user (if they exist)
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        -- Note: This assumes create_notification_from_template function exists
        -- If it doesn't exist, you can remove this or create the function
        BEGIN
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
        EXCEPTION
            WHEN undefined_function THEN
                -- Function doesn't exist, skip notification creation
                NULL;
        END;
    END IF;

    RETURN invitation_id;
END;
$function$;

-- Verify the policies have been created correctly
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'organization_invitations'
AND schemaname = 'public'
ORDER BY policyname;
