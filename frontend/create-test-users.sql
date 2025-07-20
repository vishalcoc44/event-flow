-- Create Test Users for Social Features Testing
-- This script adds users directly to the database without email authentication

-- First, let's create some test users
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
),
(
    '33333333-3333-3333-3333-333333333333',
    'mike.wilson@test.com',
    'mikewilson',
    'Mike',
    'Wilson',
    'USER',
    CURRENT_TIMESTAMP
),
(
    '44444444-4444-4444-4444-444444444444',
    'sarah.jones@test.com',
    'sarahjones',
    'Sarah',
    'Jones',
    'USER',
    CURRENT_TIMESTAMP
),
(
    '55555555-5555-5555-5555-555555555555',
    'alex.brown@test.com',
    'alexbrown',
    'Alex',
    'Brown',
    'USER',
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Create some test follows to demonstrate the social features
INSERT INTO follows (follower_id, target_id, target_type, created_at) VALUES
-- John follows Jane
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'USER', CURRENT_TIMESTAMP),
-- John follows Mike
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'USER', CURRENT_TIMESTAMP),
-- Jane follows John
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'USER', CURRENT_TIMESTAMP),
-- Mike follows John
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'USER', CURRENT_TIMESTAMP),
-- Sarah follows Jane
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'USER', CURRENT_TIMESTAMP),
-- Alex follows Sarah
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'USER', CURRENT_TIMESTAMP)
ON CONFLICT (follower_id, target_id, target_type) DO NOTHING;

-- Update follower counts (this should happen automatically via triggers, but let's ensure it)
UPDATE users SET follower_count = (
    SELECT COUNT(*) FROM follows 
    WHERE target_id = users.id AND target_type = 'USER'
);

-- Verify the users were created
SELECT 
    id,
    email,
    username,
    first_name,
    last_name,
    role,
    follower_count,
    created_at
FROM users 
WHERE email LIKE '%@test.com'
ORDER BY created_at;

-- Verify the follows were created
SELECT 
    f.id,
    u1.username as follower,
    u2.username as following,
    f.target_type,
    f.created_at
FROM follows f
JOIN users u1 ON f.follower_id = u1.id
JOIN users u2 ON f.target_id = u2.id
WHERE f.target_type = 'USER'
ORDER BY f.created_at; 