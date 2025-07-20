-- Admin Request System
-- This system allows users to request admin privileges that need approval

-- ========================================
-- STEP 1: Create Admin Requests Table
-- ========================================

-- Create admin_requests table to track admin privilege requests
CREATE TABLE IF NOT EXISTS admin_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    contact_number VARCHAR(20),
    reason TEXT NOT NULL, -- Why they want admin access
    organization VARCHAR(255), -- Organization they represent
    experience_level VARCHAR(50) CHECK (experience_level IN ('BEGINNER', 'INTERMEDIATE', 'EXPERIENCED', 'EXPERT')),
    intended_use TEXT, -- How they plan to use admin privileges
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    reviewed_by UUID REFERENCES auth.users(id), -- Admin who reviewed the request
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT, -- Notes from the admin reviewer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- One request per user
);

-- ========================================
-- STEP 2: Create Indexes
-- ========================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_requests_user_id ON admin_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_requests_created_at ON admin_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_requests_reviewed_by ON admin_requests(reviewed_by);

-- ========================================
-- STEP 3: Create Views
-- ========================================

-- Create view for pending admin requests
CREATE OR REPLACE VIEW pending_admin_requests AS
SELECT 
    ar.id,
    ar.user_id,
    ar.email,
    ar.first_name,
    ar.last_name,
    ar.contact_number,
    ar.reason,
    ar.organization,
    ar.experience_level,
    ar.intended_use,
    ar.created_at,
    u.username,
    u.role as current_role
FROM admin_requests ar
LEFT JOIN users u ON ar.user_id = u.id
WHERE ar.status = 'PENDING'
ORDER BY ar.created_at ASC;

-- Create view for admin request history
CREATE OR REPLACE VIEW admin_request_history AS
SELECT 
    ar.id,
    ar.user_id,
    ar.email,
    ar.first_name,
    ar.last_name,
    ar.reason,
    ar.organization,
    ar.experience_level,
    ar.status,
    ar.reviewed_by,
    ar.review_notes,
    ar.created_at,
    ar.reviewed_at,
    reviewer.email as reviewer_email,
    reviewer.first_name as reviewer_first_name,
    reviewer.last_name as reviewer_last_name
FROM admin_requests ar
LEFT JOIN users reviewer ON ar.reviewed_by = reviewer.id
ORDER BY ar.created_at DESC;

-- ========================================
-- STEP 4: Create Functions
-- ========================================

    -- Function to create admin request
    CREATE OR REPLACE FUNCTION create_admin_request(
        p_user_id UUID,
        p_email VARCHAR,
        p_reason TEXT,
        p_first_name VARCHAR DEFAULT NULL,
        p_last_name VARCHAR DEFAULT NULL,
        p_contact_number VARCHAR DEFAULT NULL,
        p_organization VARCHAR DEFAULT NULL,
        p_experience_level VARCHAR DEFAULT 'INTERMEDIATE',
        p_intended_use TEXT DEFAULT NULL
    )
    RETURNS UUID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        request_id UUID;
        existing_status VARCHAR;
    BEGIN
        -- Check if user already has a request
        SELECT status INTO existing_status 
        FROM admin_requests 
        WHERE user_id = p_user_id;
        
        IF existing_status IS NOT NULL THEN
            IF existing_status = 'PENDING' THEN
                RAISE EXCEPTION 'You already have a pending admin request';
            ELSIF existing_status = 'APPROVED' THEN
                RAISE EXCEPTION 'Your admin request has already been approved';
            ELSIF existing_status = 'REJECTED' THEN
                RAISE EXCEPTION 'Your admin request was rejected. Please contact support for reconsideration';
            END IF;
        END IF;
        
        -- Check if user is already an admin
        IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role = 'ADMIN') THEN
            RAISE EXCEPTION 'You are already an admin';
        END IF;
        
        -- Create the request
        INSERT INTO admin_requests (
            user_id, 
            email, 
            first_name, 
            last_name, 
            contact_number, 
            reason, 
            organization, 
            experience_level, 
            intended_use
        )
        VALUES (
            p_user_id, 
            p_email, 
            p_first_name, 
            p_last_name, 
            p_contact_number, 
            p_reason, 
            p_organization, 
            p_experience_level, 
            p_intended_use
        )
        RETURNING id INTO request_id;
        
        RETURN request_id;
    END;
    $$;

    -- Function to approve admin request
    CREATE OR REPLACE FUNCTION approve_admin_request(
        p_request_id UUID,
        p_reviewer_id UUID,
        p_review_notes TEXT DEFAULT NULL
    )
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        request_user_id UUID;
        reviewer_role VARCHAR;
    BEGIN
        -- Check if reviewer is an admin
        SELECT role INTO reviewer_role 
        FROM users 
        WHERE id = p_reviewer_id;
        
        IF reviewer_role != 'ADMIN' THEN
            RAISE EXCEPTION 'Only admins can approve admin requests';
        END IF;
        
        -- Get the user ID from the request
        SELECT user_id INTO request_user_id 
        FROM admin_requests 
        WHERE id = p_request_id AND status = 'PENDING';
        
        IF request_user_id IS NULL THEN
            RAISE EXCEPTION 'Request not found or not pending';
        END IF;
        
        -- Update the request status
        UPDATE admin_requests 
        SET 
            status = 'APPROVED',
            reviewed_by = p_reviewer_id,
            reviewed_at = NOW(),
            review_notes = p_review_notes,
            updated_at = NOW()
        WHERE id = p_request_id;
        
        -- Update user role to ADMIN
        UPDATE users 
        SET role = 'ADMIN', updated_at = NOW()
        WHERE id = request_user_id;
        
        -- Update auth.users metadata
        UPDATE auth.users 
        SET raw_user_meta_data = raw_user_meta_data || 
            jsonb_build_object('role', 'ADMIN')
        WHERE id = request_user_id;
        
        RETURN TRUE;
    END;
    $$;

    -- Function to reject admin request
    CREATE OR REPLACE FUNCTION reject_admin_request(
        p_request_id UUID,
        p_reviewer_id UUID,
        p_review_notes TEXT
    )
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        reviewer_role VARCHAR;
    BEGIN
        -- Check if reviewer is an admin
        SELECT role INTO reviewer_role 
        FROM users 
        WHERE id = p_reviewer_id;
        
        IF reviewer_role != 'ADMIN' THEN
            RAISE EXCEPTION 'Only admins can reject admin requests';
        END IF;
        
        -- Update the request status
        UPDATE admin_requests 
        SET 
            status = 'REJECTED',
            reviewed_by = p_reviewer_id,
            reviewed_at = NOW(),
            review_notes = p_review_notes,
            updated_at = NOW()
        WHERE id = p_request_id AND status = 'PENDING';
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Request not found or not pending';
        END IF;
        
        RETURN TRUE;
    END;
    $$;

    -- Function to cancel admin request
    CREATE OR REPLACE FUNCTION cancel_admin_request(p_user_id UUID)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
        UPDATE admin_requests 
        SET 
            status = 'CANCELLED',
            updated_at = NOW()
        WHERE user_id = p_user_id AND status = 'PENDING';
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'No pending request found for this user';
        END IF;
        
        RETURN TRUE;
    END;
    $$;

    -- Function to get user's admin request status
    CREATE OR REPLACE FUNCTION get_user_admin_request_status(p_user_id UUID)
    RETURNS TABLE(
        request_id UUID,
        status VARCHAR,
        reason TEXT,
        organization VARCHAR,
        experience_level VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        review_notes TEXT
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            ar.id,
            ar.status,
            ar.reason,
            ar.organization,
            ar.experience_level,
            ar.created_at,
            ar.reviewed_at,
            ar.review_notes
        FROM admin_requests ar
        WHERE ar.user_id = p_user_id
        ORDER BY ar.created_at DESC
        LIMIT 1;
    END;
    $$;

    -- Function to get all pending admin requests (for admins)
    CREATE OR REPLACE FUNCTION get_pending_admin_requests()
    RETURNS TABLE(
        request_id UUID,
        user_id UUID,
        email VARCHAR,
        first_name VARCHAR,
        last_name VARCHAR,
        contact_number VARCHAR,
        reason TEXT,
        organization VARCHAR,
        experience_level VARCHAR,
        intended_use TEXT,
        created_at TIMESTAMP WITH TIME ZONE,
        username VARCHAR
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
        -- Check if current user is admin
        IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN') THEN
            RAISE EXCEPTION 'Only admins can view pending requests';
        END IF;
        
        RETURN QUERY
        SELECT 
            ar.id,
            ar.user_id,
            ar.email,
            ar.first_name,
            ar.last_name,
            ar.contact_number,
            ar.reason,
            ar.organization,
            ar.experience_level,
            ar.intended_use,
            ar.created_at,
            u.username
        FROM admin_requests ar
        LEFT JOIN users u ON ar.user_id = u.id
        WHERE ar.status = 'PENDING'
        ORDER BY ar.created_at ASC;
    END;
    $$;

-- ========================================
-- STEP 5: Create RLS Policies
-- ========================================

-- Enable RLS on admin_requests table
ALTER TABLE admin_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own admin requests
CREATE POLICY "Users can view their own admin requests" ON admin_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own admin requests
CREATE POLICY "Users can create their own admin requests" ON admin_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own admin requests (only to cancel)
CREATE POLICY "Users can update their own admin requests" ON admin_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Admins can view all admin requests
CREATE POLICY "Admins can view all admin requests" ON admin_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Policy: Admins can update admin requests (approve/reject)
CREATE POLICY "Admins can update admin requests" ON admin_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- ========================================
-- STEP 6: Create Triggers
-- ========================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_requests_updated_at_trigger
    BEFORE UPDATE ON admin_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_requests_updated_at();

-- ========================================
-- STEP 7: Grant Permissions
-- ========================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON admin_requests TO authenticated;
GRANT SELECT ON pending_admin_requests TO authenticated;
GRANT SELECT ON admin_request_history TO authenticated;

-- Grant permissions to service role
GRANT ALL ON admin_requests TO service_role;
GRANT ALL ON pending_admin_requests TO service_role;
GRANT ALL ON admin_request_history TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_admin_request TO authenticated;
GRANT EXECUTE ON FUNCTION approve_admin_request TO authenticated;
GRANT EXECUTE ON FUNCTION reject_admin_request TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_admin_request TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_admin_request_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_admin_requests TO authenticated;

-- ========================================
-- STEP 8: Create Notification Templates
-- ========================================

-- Insert notification templates for admin requests
INSERT INTO notification_templates (type, title_template, message_template) VALUES
(
    'ADMIN_REQUEST_SUBMITTED',
    'Admin Request Submitted',
    'Your admin request has been submitted successfully. You will be notified once it is reviewed.'
),
(
    'ADMIN_REQUEST_APPROVED',
    'Admin Request Approved',
    'Congratulations! Your admin request has been approved. You now have admin privileges.'
),
(
    'ADMIN_REQUEST_REJECTED',
    'Admin Request Rejected',
    'Your admin request has been rejected. Please contact support for more information.'
),
(
    'NEW_ADMIN_REQUEST',
    'New Admin Request',
    'A new admin request has been submitted and requires your review.'
)
ON CONFLICT (type) DO NOTHING;

-- ========================================
-- STEP 9: Create Function to Send Notifications
-- ========================================

-- Function to send admin request notifications
CREATE OR REPLACE FUNCTION send_admin_request_notification(
    p_user_id UUID,
    p_template_type VARCHAR,
    p_additional_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    -- Use the existing create_notification_from_template function
    SELECT create_notification_from_template(
        p_user_id,
        p_template_type,
        p_additional_data
    ) INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_admin_request_notification TO authenticated;

-- ========================================
-- STEP 10: Update Existing Functions
-- ========================================

-- Update the approve_admin_request function to send notifications
CREATE OR REPLACE FUNCTION approve_admin_request(
    p_request_id UUID,
    p_reviewer_id UUID,
    p_review_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_user_id UUID;
    reviewer_role VARCHAR;
BEGIN
    -- Check if reviewer is an admin
    SELECT role INTO reviewer_role 
    FROM users 
    WHERE id = p_reviewer_id;
    
    IF reviewer_role != 'ADMIN' THEN
        RAISE EXCEPTION 'Only admins can approve admin requests';
    END IF;
    
    -- Get the user ID from the request
    SELECT user_id INTO request_user_id 
    FROM admin_requests 
    WHERE id = p_request_id AND status = 'PENDING';
    
    IF request_user_id IS NULL THEN
        RAISE EXCEPTION 'Request not found or not pending';
    END IF;
    
    -- Update the request status
    UPDATE admin_requests 
    SET 
        status = 'APPROVED',
        reviewed_by = p_reviewer_id,
        reviewed_at = NOW(),
        review_notes = p_review_notes,
        updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Update user role to ADMIN
    UPDATE users 
    SET role = 'ADMIN', updated_at = NOW()
    WHERE id = request_user_id;
    
    -- Update auth.users metadata
    UPDATE auth.users 
    SET raw_user_meta_data = raw_user_meta_data || 
        jsonb_build_object('role', 'ADMIN')
    WHERE id = request_user_id;
    
    -- Send approval notification
    PERFORM send_admin_request_notification(
        request_user_id, 
        'ADMIN_REQUEST_APPROVED',
        jsonb_build_object('request_id', p_request_id, 'reviewer_id', p_reviewer_id)
    );
    
    RETURN TRUE;
END;
$$;

-- Update the reject_admin_request function to send notifications
CREATE OR REPLACE FUNCTION reject_admin_request(
    p_request_id UUID,
    p_reviewer_id UUID,
    p_review_notes TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_user_id UUID;
    reviewer_role VARCHAR;
BEGIN
    -- Check if reviewer is an admin
    SELECT role INTO reviewer_role 
    FROM users 
    WHERE id = p_reviewer_id;
    
    IF reviewer_role != 'ADMIN' THEN
        RAISE EXCEPTION 'Only admins can reject admin requests';
    END IF;
    
    -- Get the user ID from the request
    SELECT user_id INTO request_user_id 
    FROM admin_requests 
    WHERE id = p_request_id AND status = 'PENDING';
    
    IF request_user_id IS NULL THEN
        RAISE EXCEPTION 'Request not found or not pending';
    END IF;
    
    -- Update the request status
    UPDATE admin_requests 
    SET 
        status = 'REJECTED',
        reviewed_by = p_reviewer_id,
        reviewed_at = NOW(),
        review_notes = p_review_notes,
        updated_at = NOW()
    WHERE id = p_request_id AND status = 'PENDING';
    
    -- Send rejection notification
    PERFORM send_admin_request_notification(
        request_user_id, 
        'ADMIN_REQUEST_REJECTED',
        jsonb_build_object('request_id', p_request_id, 'reviewer_id', p_reviewer_id, 'notes', p_review_notes)
    );
    
    RETURN TRUE;
END;
$$;

-- Update the create_admin_request function to send notifications
CREATE OR REPLACE FUNCTION create_admin_request(
    p_user_id UUID,
    p_email VARCHAR,
    p_reason TEXT,
    p_first_name VARCHAR DEFAULT NULL,
    p_last_name VARCHAR DEFAULT NULL,
    p_contact_number VARCHAR DEFAULT NULL,
    p_organization VARCHAR DEFAULT NULL,
    p_experience_level VARCHAR DEFAULT 'INTERMEDIATE',
    p_intended_use TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_id UUID;
    existing_status VARCHAR;
    admin_user_id UUID;
BEGIN
    -- Check if user already has a request
    SELECT status INTO existing_status 
    FROM admin_requests 
    WHERE user_id = p_user_id;
    
    IF existing_status IS NOT NULL THEN
        IF existing_status = 'PENDING' THEN
            RAISE EXCEPTION 'You already have a pending admin request';
        ELSIF existing_status = 'APPROVED' THEN
            RAISE EXCEPTION 'Your admin request has already been approved';
        ELSIF existing_status = 'REJECTED' THEN
            RAISE EXCEPTION 'Your admin request was rejected. Please contact support for reconsideration';
        END IF;
    END IF;
    
    -- Check if user is already an admin
    IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND role = 'ADMIN') THEN
        RAISE EXCEPTION 'You are already an admin';
    END IF;
    
    -- Create the request
    INSERT INTO admin_requests (
        user_id, 
        email, 
        first_name, 
        last_name, 
        contact_number, 
        reason, 
        organization, 
        experience_level, 
        intended_use
    )
    VALUES (
        p_user_id, 
        p_email, 
        p_first_name, 
        p_last_name, 
        p_contact_number, 
        p_reason, 
        p_organization, 
        p_experience_level, 
        p_intended_use
    )
    RETURNING id INTO request_id;
    
    -- Send confirmation notification to user
    PERFORM send_admin_request_notification(
        p_user_id, 
        'ADMIN_REQUEST_SUBMITTED',
        jsonb_build_object('request_id', request_id)
    );
    
    -- Send notification to all admins
    FOR admin_user_id IN 
        SELECT id FROM users WHERE role = 'ADMIN'
    LOOP
        PERFORM send_admin_request_notification(
            admin_user_id, 
            'NEW_ADMIN_REQUEST',
            jsonb_build_object('request_id', request_id, 'requester_email', p_email)
        );
    END LOOP;
    
    RETURN request_id;
END;
$$;

-- ========================================
-- STEP 11: Create Admin Dashboard Views
-- ========================================

-- Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending_requests,
    COUNT(*) FILTER (WHERE status = 'APPROVED') as approved_requests,
    COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected_requests,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as requests_last_7_days,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as requests_last_30_days
FROM admin_requests;

-- Grant permissions
GRANT SELECT ON admin_dashboard_stats TO authenticated;
GRANT SELECT ON admin_dashboard_stats TO service_role; 