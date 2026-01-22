-- Add qr_code_token to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS qr_code_token UUID DEFAULT gen_random_uuid();

-- Function to ensure qr_code_token is generated if not provided
CREATE OR REPLACE FUNCTION generate_booking_qr_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.qr_code_token IS NULL THEN
        NEW.qr_code_token = gen_random_uuid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for qr_code_token
DROP TRIGGER IF EXISTS tr_generate_booking_qr_token ON bookings;
CREATE TRIGGER tr_generate_booking_qr_token
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_qr_token();

-- Comment
COMMENT ON COLUMN bookings.qr_code_token IS 'Secure token used for QR code generation and validation';

-- Index
CREATE INDEX IF NOT EXISTS idx_bookings_qr_code_token ON bookings(qr_code_token);
