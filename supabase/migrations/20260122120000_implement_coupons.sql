-- Create discount_type enum
DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    discount_type discount_type NOT NULL,
    discount_value NUMERIC NOT NULL,
    organization_id UUID REFERENCES public.organizations(id),
    event_id UUID REFERENCES public.events(id),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT coupons_code_org_unique UNIQUE (code, organization_id),
    CONSTRAINT coupons_check_scope CHECK (
        (organization_id IS NOT NULL AND event_id IS NULL) OR
        (organization_id IS NULL AND event_id IS NOT NULL) OR
        (organization_id IS NOT NULL AND event_id IS NOT NULL)
    )
);

-- Comments
COMMENT ON TABLE coupons IS 'Coupons for event bookings';
COMMENT ON COLUMN coupons.organization_id IS 'If set, coupon applies to all events in this organization';
COMMENT ON COLUMN coupons.event_id IS 'If set, coupon applies only to this event';

-- Add columns to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC;

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policies
-- Organizers can view their coupons
CREATE POLICY "Organizers can view their coupons" ON coupons
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT created_by FROM organizations WHERE id = coupons.organization_id
            UNION
            SELECT created_by FROM events WHERE id = coupons.event_id
        )
    );

-- Organizers can manage their coupons
CREATE POLICY "Organizers can manage their coupons" ON coupons
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT created_by FROM organizations WHERE id = coupons.organization_id
            UNION
            SELECT created_by FROM events WHERE id = coupons.event_id
        )
    );

-- Function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(p_code TEXT, p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_coupon coupons%ROWTYPE;
    v_event events%ROWTYPE;
    v_valid BOOLEAN;
    v_message TEXT;
BEGIN
    -- Get event to find organization
    SELECT * INTO v_event FROM events WHERE id = p_event_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Event not found');
    END IF;

    -- Find coupon
    SELECT * INTO v_coupon FROM coupons 
    WHERE code = p_code 
    AND is_active = true
    AND (
        (event_id = p_event_id) OR
        (organization_id = v_event.organization_id AND event_id IS NULL)
    )
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_until IS NULL OR valid_until >= now())
    AND (usage_limit IS NULL OR usage_count < usage_limit);

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'message', 'Invalid or expired coupon');
    END IF;

    RETURN jsonb_build_object(
        'valid', true, 
        'coupon', jsonb_build_object(
            'id', v_coupon.id,
            'code', v_coupon.code,
            'discount_type', v_coupon.discount_type,
            'discount_value', v_coupon.discount_value
        )
    );
END;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_org_id ON coupons(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_coupon_id ON bookings(coupon_id);
