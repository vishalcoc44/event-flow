-- Update handle_refund_status_change to automatically cancel booking when refund is processed
CREATE OR REPLACE FUNCTION public.handle_refund_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    
    -- If status is PROCESSED or APPROVED, update the booking status to CANCELLED
    -- (Adjust logic if you want to wait for PROCESSED explicitly)
    IF NEW.status = 'PROCESSED' THEN
        UPDATE public.bookings 
        SET status = 'CANCELLED' 
        WHERE id = NEW.booking_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS tr_on_refund_status_change ON public.refund_requests;
CREATE TRIGGER tr_on_refund_status_change
    AFTER UPDATE ON public.refund_requests
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.handle_refund_status_change();
