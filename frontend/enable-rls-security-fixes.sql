-- Enable Row Level Security (RLS) on Public Tables
-- This fixes the security advisor errors where tables have RLS policies but RLS is not enabled
-- Generated to address Supabase security linting errors

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on event_spaces table
ALTER TABLE public.event_spaces ENABLE ROW LEVEL SECURITY;

-- Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on notification_templates table
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Enable RLS on organizations table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify that RLS has been enabled on all tables
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'bookings',
        'categories',
        'events',
        'event_spaces',
        'follows',
        'notifications',
        'notification_templates',
        'organizations',
        'users'
    )
ORDER BY tablename;

-- Fix RLS policies for organization_invitations table
-- Drop existing restrictive policies that are causing 403 errors
DROP POLICY IF EXISTS "Organization admins can view invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON public.organization_invitations;
DROP POLICY IF EXISTS "Users can view their own invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins can create invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins can delete invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins can update invitations" ON public.organization_invitations;

-- Create permissive policies for organization members
CREATE POLICY "Organization members can view invitations" ON public.organization_invitations
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
);

CREATE POLICY "Organization members can create invitations" ON public.organization_invitations
FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ) AND
  invited_by = auth.uid()
);

CREATE POLICY "Organization members can update invitations" ON public.organization_invitations
FOR UPDATE USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ) AND
  invited_by = auth.uid()
);

CREATE POLICY "Organization members can delete invitations" ON public.organization_invitations
FOR DELETE USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ) AND
  invited_by = auth.uid()
);

-- Also allow users to view invitations sent to their email (for acceptance)
CREATE POLICY "Users can view their own invitations by email" ON public.organization_invitations
FOR SELECT USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);