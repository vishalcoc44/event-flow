-- Function to allow users to leave their organization
-- Users can leave unless they are the organization owner
CREATE OR REPLACE FUNCTION leave_organization(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role VARCHAR;
    user_org_id UUID;
    org_owner_id UUID;
BEGIN
    -- Get user's current organization and role
    SELECT organization_id, role_in_org 
    INTO user_org_id, user_role 
    FROM users 
    WHERE id = p_user_id;
    
    -- Check if user is part of any organization
    IF user_org_id IS NULL THEN
        RAISE EXCEPTION 'User is not a member of any organization';
    END IF;
    
    -- Get organization owner
    SELECT created_by INTO org_owner_id 
    FROM organizations 
    WHERE id = user_org_id;
    
    -- Check if user is the organization owner
    IF user_role = 'OWNER' OR org_owner_id = p_user_id THEN
        RAISE EXCEPTION 'Organization owners cannot leave the organization. Please transfer ownership first or delete the organization.';
    END IF;
    
    -- Remove user from organization
    UPDATE users 
    SET 
        organization_id = NULL,
        role_in_org = NULL,
        is_org_admin = FALSE,
        joined_at = NULL
    WHERE id = p_user_id;
    
    -- Update organization user count
    UPDATE organizations 
    SET current_users_count = current_users_count - 1
    WHERE id = user_org_id;
    
    -- Note: Audit logging removed as audit_logs table doesn't exist in the current schema
    -- TODO: Re-add audit logging when audit_logs table is created
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and re-raise
        RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION leave_organization(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION leave_organization(UUID) IS 'Allows users to leave their organization. Organization owners cannot leave without transferring ownership first.';
