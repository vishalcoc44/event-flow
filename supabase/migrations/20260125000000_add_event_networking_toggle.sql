-- Add is_networking_enabled column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_networking_enabled BOOLEAN DEFAULT false;

-- Update RLS policies for networking_messages to check event-level toggle
-- Policy: Attendees with networking enabled can view messages
DROP POLICY IF EXISTS "Attendees with networking enabled can view messages" ON public.networking_messages;
CREATE POLICY "Attendees with networking enabled can view messages" ON public.networking_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events e
            JOIN public.bookings b ON b.event_id = e.id
            WHERE e.id = networking_messages.event_id 
            AND b.user_id = auth.uid() 
            AND b.status = 'CONFIRMED'
            AND b.is_networking_enabled = true
            AND e.is_networking_enabled = true
        )
    );

-- Policy: Attendees with networking enabled can send messages
DROP POLICY IF EXISTS "Attendees with networking enabled can send messages" ON public.networking_messages;
CREATE POLICY "Attendees with networking enabled can send messages" ON public.networking_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.events e
            JOIN public.bookings b ON b.event_id = e.id
            WHERE e.id = networking_messages.event_id 
            AND b.user_id = auth.uid() 
            AND b.status = 'CONFIRMED'
            AND b.is_networking_enabled = true
            AND e.is_networking_enabled = true
        )
    );
