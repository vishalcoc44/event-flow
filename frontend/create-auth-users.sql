-- Create Users in Supabase Auth and Sync to Users Table
-- This method creates users in Supabase Auth system

-- Note: This requires admin access to Supabase Auth
-- You can also do this through the Supabase Dashboard

-- Method 1: Using Supabase Dashboard (Recommended)
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User"
-- 3. Fill in the details:
--    - Email: test@example.com
--    - Password: test123456
--    - Email Confirm: true
-- 4. Repeat for multiple test users

-- Method 2: Using SQL (if you have the right permissions)
-- This creates users in the auth.users table
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'john.doe@test.com',
    crypt('test123456', gen_salt('bf')),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    '',
    '',
    '',
    ''
),
(
    '22222222-2222-2222-2222-222222222222',
    'jane.smith@test.com',
    crypt('test123456', gen_salt('bf')),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    '',
    '',
    '',
    ''
)
ON CONFLICT (id) DO NOTHING;

-- Then sync to your users table
INSERT INTO users (id, email, username, first_name, last_name, role, created_at) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'john.doe@test.com',
    'johndoe',
    'John',
    'Doe',
    'USER',
    CURRENT_TIMESTAMP
),
(
    '22222222-2222-2222-2222-222222222222',
    'jane.smith@test.com',
    'janesmith',
    'Jane',
    'Smith',
    'USER',
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING; 