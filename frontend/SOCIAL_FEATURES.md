# Social Features Implementation

This document describes the social features that have been implemented in the Event Management System.

## Overview

The social features enhance community interaction by allowing users to:
- Follow other users
- Follow events
- Follow categories
- View follower counts and social profiles

## Database Schema

### Follows Table
```sql
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('USER', 'EVENT', 'CATEGORY')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, target_id, target_type)
);
```

### Added Columns
- `users.follower_count` - Number of followers for each user
- `events.follower_count` - Number of followers for each event
- `categories.follower_count` - Number of followers for each category

## Components

### 1. FollowButton Component
Located at: `src/components/ui/follow-button.tsx`

A reusable button component that handles following/unfollowing for users, events, and categories.

**Props:**
- `targetId` - ID of the target to follow
- `targetType` - Type of target ('USER', 'EVENT', 'CATEGORY')
- `targetName` - Display name of the target
- `followerCount` - Current follower count
- `variant` - Button variant
- `size` - Button size
- `showCount` - Whether to show follower count
- `onFollowChange` - Callback when follow status changes

**Usage:**
```tsx
<FollowButton
  targetId={event.id}
  targetType="EVENT"
  targetName={event.title}
  followerCount={event.follower_count}
  variant="outline"
  size="sm"
/>
```

### 2. SocialProfile Component
Located at: `src/components/SocialProfile.tsx`

Displays a user's social profile with follower/following information.

**Props:**
- `userId` - ID of the user to display
- `showFollowButton` - Whether to show follow button
- `className` - Additional CSS classes

**Usage:**
```tsx
<SocialProfile userId={user.id} showFollowButton={true} />
```

### 3. Social Dashboard Page
Located at: `src/app/social/page.tsx`

A comprehensive dashboard showing all social features including:
- User profile
- Following/Followers lists
- Event following
- Category following

## API Functions

### Social API (src/lib/api.ts)
The `socialAPI` object provides the following functions:

#### Follow/Unfollow Functions
- `followUser(targetUserId)` - Follow a user
- `unfollowUser(targetUserId)` - Unfollow a user
- `followEvent(eventId)` - Follow an event
- `unfollowEvent(eventId)` - Unfollow an event
- `followCategory(categoryId)` - Follow a category
- `unfollowCategory(categoryId)` - Unfollow a category

#### Query Functions
- `isFollowing(targetId, targetType)` - Check if user is following a target
- `getUserFollows(targetType?)` - Get user's follows (optionally filtered by type)
- `getUserFollowers(userId)` - Get user's followers
- `getUserProfile(userId)` - Get user profile with follower counts

## Context

### SocialContext (src/contexts/SocialContext.tsx)
Provides React context for managing social state and real-time updates.

**Features:**
- Real-time follow updates using Supabase subscriptions
- Automatic follower count updates
- Follow/unfollow actions
- Loading states

**Usage:**
```tsx
const { 
  userFollows, 
  followUser, 
  unfollowUser, 
  isFollowing 
} = useSocial();
```

## Real-time Features

### Supabase Subscriptions
The social features use Supabase's real-time subscriptions to:
- Update follower counts in real-time
- Notify users of new followers
- Sync follow status across multiple tabs

### Database Triggers
Automatic triggers update follower counts when follows are created/deleted:
- `update_follower_count()` - Trigger function
- `trigger_update_follower_count` - Trigger on follows table

## Integration Points

### Event List
The main event list now includes follow buttons for each event.

### User Profiles
User profiles show follower/following information and allow following.

### Social Dashboard
A dedicated page at `/social` provides a comprehensive social experience.

## Security

### Row Level Security (RLS)
The follows table has RLS policies that ensure:
- Users can only view their own follows
- Users can only create follows for themselves
- Users can only delete their own follows
- Public read access for follower counts

### Policies
- Users can view who follows them
- Users can view event/category follows
- Only authenticated users can create follows
- Users cannot follow themselves

## Usage Examples

### Following a User
```tsx
const { followUser } = useSocial();

const handleFollow = async () => {
  try {
    await followUser(targetUserId);
    // Follow successful
  } catch (error) {
    // Handle error
  }
};
```

### Checking Follow Status
```tsx
const { isFollowing } = useSocial();

const checkStatus = async () => {
  const following = await isFollowing(eventId, 'EVENT');
  if (following) {
    // User is following this event
  }
};
```

### Displaying Follower Count
```tsx
<FollowButton
  targetId={event.id}
  targetType="EVENT"
  followerCount={event.follower_count}
  showCount={true}
/>
```

## Migration

To set up the social features, run the SQL migration in `social-features-migration.sql` in your Supabase SQL editor.

### Troubleshooting

If you encounter foreign key errors like "Could not find a relationship between 'follows' and 'users'", run the `fix-follows-table.sql` script in your Supabase SQL editor. This will:

1. Drop and recreate the follows table with proper foreign key constraints
2. Add missing follower_count columns
3. Set up proper RLS policies
4. Create the necessary triggers

### Testing

Run the `test-follows.sql` script to verify that:
- The follows table exists and has the correct structure
- Follower count columns are present
- RLS policies are properly configured

## Future Enhancements

Potential improvements for the social features:
1. Follow notifications
2. Activity feed
3. Social recommendations
4. Follow suggestions
5. Social analytics
6. Follow lists (public/private)
7. Social sharing
8. Follow verification badges 