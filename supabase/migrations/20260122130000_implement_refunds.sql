-- Create refund_status enum
DO $$ BEGIN
    CREATE TYPE refund_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create refund_requests table
CREATE TABLE IF NOT EXISTS refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status refund_status DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT refund_requests_booking_unique UNIQUE (booking_id)
);

-- Enable RLS
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own refund requests
CREATE POLICY "Users can view their own refund requests" ON refund_requests
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM bookings WHERE id = refund_requests.booking_id
        )
    );

-- Users can create refund requests for their own bookings
CREATE POLICY "Users can create refund requests" ON refund_requests
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM bookings WHERE id = booking_id
        )
    );

-- Organizers can view refund requests for their events
CREATE POLICY "Organizers can view event refund requests" ON refund_requests
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT e.created_by 
            FROM events e
            JOIN bookings b ON b.event_id = e.id
            WHERE b.id = refund_requests.booking_id
        )
    );

-- Organizers can update refund requests for their events
CREATE POLICY "Organizers can manage event refund requests" ON refund_requests
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT e.created_by 
            FROM events e
            JOIN bookings b ON b.event_id = e.id
            WHERE b.id = refund_requests.booking_id
        )
    );

-- Function to handle refund status changes (can be expanded later)
CREATE OR REPLACE FUNCTION handle_refund_status_change()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    
    -- If status is PROCESSED, we might want to automatically cancel the booking
    -- IF NEW.status = 'PROCESSED' THEN
    --     UPDATE bookings SET status = 'CANCELLED' WHERE id = NEW.booking_id;
    -- END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_handle_refund_status_change
    BEFORE UPDATE ON refund_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_refund_status_change();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_refund_requests_booking_id ON refund_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
