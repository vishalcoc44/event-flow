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
