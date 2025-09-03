-- Fix booking cancellation RLS policy for admins
-- This allows admins to cancel any booking, not just their own

-- First, create the RPC function that the Edge Function will use
CREATE OR REPLACE FUNCTION cancel_booking_admin(booking_id UUID)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    booking_record bookings;
BEGIN
    -- Check if the current user is an admin
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'ADMIN'
    ) THEN
        RAISE EXCEPTION 'Access denied: Only administrators can cancel bookings through this method';
    END IF;

    -- Update the booking status
    UPDATE bookings
    SET status = 'CANCELLED'
    WHERE id = booking_id
    RETURNING * INTO booking_record;

    -- Check if the booking was found and updated
    IF booking_record IS NULL THEN
        RAISE EXCEPTION 'Booking not found with ID: %', booking_id;
    END IF;

    RETURN booking_record;
END;
$$;

-- Add RLS policies that allow admins to access any booking
-- This is the recommended approach for admin access
-- Allow admins to SELECT any booking
CREATE POLICY "Admins can view any booking"
ON bookings FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'ADMIN'
    )
);

-- Allow admins to UPDATE any booking
CREATE POLICY "Admins can update any booking"
ON bookings FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'ADMIN'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'ADMIN'
    )
);

-- Allow admins to DELETE any booking (if needed in the future)
CREATE POLICY "Admins can delete any booking"
ON bookings FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'ADMIN'
    )
);

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION cancel_booking_admin(UUID) TO authenticated;
