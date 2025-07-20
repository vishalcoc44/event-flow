-- Test Social Features with Existing Users
-- This script uses your existing users and adds some test users for social features

-- Add some additional test users for social features testing
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
)
ON CONFLICT (id) DO NOTHING;

-- Create test follows using your existing users
INSERT INTO follows (follower_id, target_id, target_type, created_at) VALUES
-- vishalsatish45 follows john
('a6af65c0-4d03-433d-b860-719b510469e8', '11111111-1111-1111-1111-111111111111', 'USER', CURRENT_TIMESTAMP),
-- vishalsatish45 follows jane
('a6af65c0-4d03-433d-b860-719b510469e8', '22222222-2222-2222-2222-222222222222', 'USER', CURRENT_TIMESTAMP),
-- john follows vishalsatish45
('11111111-1111-1111-1111-111111111111', 'a6af65c0-4d03-433d-b860-719b510469e8', 'USER', CURRENT_TIMESTAMP),
-- jane follows vishalsatish45
('22222222-2222-2222-2222-222222222222', 'a6af65c0-4d03-433d-b860-719b510469e8', 'USER', CURRENT_TIMESTAMP),
-- mike follows vishalsatish45
('33333333-3333-3333-3333-333333333333', 'a6af65c0-4d03-433d-b860-719b510469e8', 'USER', CURRENT_TIMESTAMP),
-- sarah follows vishalsatish45
('44444444-4444-4444-4444-444444444444', 'a6af65c0-4d03-433d-b860-719b510469e8', 'USER', CURRENT_TIMESTAMP),
-- john follows jane
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'USER', CURRENT_TIMESTAMP),
-- mike follows sarah
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'USER', CURRENT_TIMESTAMP)
ON CONFLICT (follower_id, target_id, target_type) DO NOTHING;

-- Update follower counts
UPDATE users SET follower_count = (
    SELECT COUNT(*) FROM follows 
    WHERE target_id = users.id AND target_type = 'USER'
);

-- Show all users with their follower counts
SELECT 
    username,
    email,
    role,
    follower_count,
    created_at
FROM users 
ORDER BY created_at;

-- Show all follows
SELECT 
    u1.username as follower,
    u2.username as following,
    f.target_type,
    f.created_at
FROM follows f
JOIN users u1 ON f.follower_id = u1.id
JOIN users u2 ON f.target_id = u2.id
WHERE f.target_type = 'USER'
ORDER BY f.created_at;

-- Show specific user's follows (vishalsatish45)
SELECT 
    'vishalsatish45 follows:' as info,
    u2.username as following
FROM follows f
JOIN users u1 ON f.follower_id = u1.id
JOIN users u2 ON f.target_id = u2.id
WHERE u1.username = 'vishalsatish45' AND f.target_type = 'USER';

-- Show who follows vishalsatish45
SELECT 
    'Followers of vishalsatish45:' as info,
    u1.username as follower
FROM follows f
JOIN users u1 ON f.follower_id = u1.id
JOIN users u2 ON f.target_id = u2.id
WHERE u2.username = 'vishalsatish45' AND f.target_type = 'USER'; 