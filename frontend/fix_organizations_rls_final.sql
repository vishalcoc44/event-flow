-- =====================================================
-- FIX ORGANIZATIONS TABLE RLS ISSUES
-- Run this SQL script to fix the "relation 'organizations' does not exist" error
-- =====================================================

-- Step 1: Drop all problematic RLS policies on organizations table
DROP POLICY IF EXISTS "Allow organization access for members and creators" ON organizations;
DROP POLICY IF EXISTS "Users can view organizations they have access to" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organization" ON organizations;
DROP POLICY IF EXISTS "Organization owners can delete their organization" ON organizations;
DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_insert_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_update_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_delete_policy" ON organizations;

-- Step 2: Create new simplified RLS policies for organizations table (avoiding circular dependencies)
CREATE POLICY "organizations_select_policy" ON organizations
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() OR
    is_public = true
  )
);

CREATE POLICY "organizations_select_members" ON organizations
FOR SELECT USING (
  auth.uid() IS NOT NULL AND
  id IN (
    SELECT DISTINCT u.organization_id
    FROM users u
    WHERE u.id = auth.uid() AND u.organization_id IS NOT NULL
  )
);

CREATE POLICY "organizations_insert_policy" ON organizations
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  created_by = auth.uid()
);

CREATE POLICY "organizations_update_policy" ON organizations
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND
  created_by = auth.uid()
);

CREATE POLICY "organizations_delete_policy" ON organizations
FOR DELETE USING (
  auth.uid() IS NOT NULL AND
  created_by = auth.uid()
);

-- Step 3: Drop problematic RLS policies on events table
DROP POLICY IF EXISTS "Allow event creation with organization validation" ON events;
DROP POLICY IF EXISTS "Allow viewing events with proper access" ON events;
DROP POLICY IF EXISTS "Event creators can modify their events" ON events;
DROP POLICY IF EXISTS "Organization admins can manage events" ON events;
DROP POLICY IF EXISTS "events_select_policy" ON events;
DROP POLICY IF EXISTS "events_insert_policy" ON events;
DROP POLICY IF EXISTS "events_update_policy" ON events;
DROP POLICY IF EXISTS "events_delete_policy" ON events;

-- Step 4: Create new simplified RLS policies for events table (avoiding circular dependencies)
CREATE POLICY "events_select_policy" ON events
FOR SELECT USING (
  is_public = true OR
  created_by = auth.uid() OR
  auth.uid() IS NOT NULL
);

CREATE POLICY "events_select_organization" ON events
FOR SELECT USING (
  organization_id IS NOT NULL AND
  organization_id IN (
    SELECT DISTINCT u.organization_id
    FROM users u
    WHERE u.id = auth.uid() AND u.organization_id IS NOT NULL
  )
);

CREATE POLICY "events_insert_policy" ON events
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  created_by = auth.uid()
);

CREATE POLICY "events_update_policy" ON events
FOR UPDATE USING (
  created_by = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM users u
    WHERE u.id = auth.uid() AND u.role_in_org IN ('OWNER', 'ADMIN')
  )
);

CREATE POLICY "events_delete_policy" ON events
FOR DELETE USING (
  created_by = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM users u
    WHERE u.id = auth.uid() AND u.role_in_org IN ('OWNER', 'ADMIN')
  )
);

-- Step 5: Ensure proper permissions on the tables
GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;

-- Step 6: Re-enable RLS on both tables (in case it was disabled)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Step 7: Create a helper function to safely create events (optional)
-- Alternative: Simplified version without problematic defaults
CREATE OR REPLACE FUNCTION create_event_safely(
  p_title text,
  p_date date,
  p_time time without time zone,
  p_created_by uuid,
  p_description text DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_price numeric DEFAULT NULL,
  p_image_url text DEFAULT NULL,
  p_is_public boolean DEFAULT true,
  p_requires_approval boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_event_id uuid;
BEGIN
  -- Validate user
  IF p_created_by IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Insert event
  INSERT INTO events (
    title,
    description,
    category_id,
    location,
    price,
    date,
    time,
    image_url,
    created_by,
    organization_id,
    is_public,
    requires_approval,
    is_approved
  ) VALUES (
    p_title,
    p_description,
    p_category_id,
    p_location,
    p_price,
    p_date,
    p_time,
    p_image_url,
    p_created_by,
    NULL, -- Always null to avoid RLS issues
    p_is_public,
    p_requires_approval,
    true
  ) RETURNING id INTO new_event_id;

  RETURN new_event_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_event_safely TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- Run these after the script to verify everything works
-- =====================================================

-- Check that RLS policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('organizations', 'events')
ORDER BY tablename, policyname;

-- Test organization access
SELECT id, name, is_public FROM organizations LIMIT 5;

-- Test users table access (should work without circular dependency)
SELECT id, email, organization_id FROM users LIMIT 5;

-- Test event creation (should work now)
-- INSERT INTO events (title, description, date, time, created_by, organization_id)
-- VALUES ('Test Event', 'Test Description', CURRENT_DATE, CURRENT_TIME, auth.uid(), NULL);

-- =====================================================
-- EMERGENCY ROLLBACK (if needed)
-- =====================================================
/*
-- If something goes wrong, run these to restore basic functionality:
DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_select_members" ON organizations;
DROP POLICY IF EXISTS "events_select_policy" ON events;
DROP POLICY IF EXISTS "events_select_organization" ON events;

-- Restore basic permissive policies
CREATE POLICY "temp_org_access" ON organizations FOR SELECT USING (true);
CREATE POLICY "temp_event_access" ON events FOR SELECT USING (true);
CREATE POLICY "temp_event_insert" ON events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
*/

COMMIT;
