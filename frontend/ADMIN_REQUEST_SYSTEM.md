# Admin Request System

## Overview

The Admin Request System is a comprehensive solution that allows users to request admin privileges in the EventFlow application. Instead of directly granting admin access during registration, users must submit a request that gets reviewed by existing administrators before they can access admin features.

## Features

### For Users Requesting Admin Access:
- Submit admin requests during registration
- Check request status and review notes
- Cancel pending requests
- Receive notifications about request status changes

### For Existing Admins:
- View all pending admin requests
- Approve or reject requests with review notes
- Receive notifications about new requests
- Access comprehensive admin request management dashboard

## Database Schema

### Tables Created

#### 1. `admin_requests` Table
```sql
CREATE TABLE admin_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    contact_number VARCHAR(20),
    reason TEXT NOT NULL,
    organization VARCHAR(255),
    experience_level VARCHAR(50) CHECK (experience_level IN ('BEGINNER', 'INTERMEDIATE', 'EXPERIENCED', 'EXPERT')),
    intended_use TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### Views Created

#### 1. `pending_admin_requests`
Shows all pending admin requests with user information.

#### 2. `admin_request_history`
Shows complete history of all admin requests with reviewer information.

#### 3. `admin_dashboard_stats`
Provides statistics for admin dashboard.

## Functions

### User Functions

#### 1. `create_admin_request()`
Creates a new admin request for a user.

**Parameters:**
- `p_user_id`: User's UUID
- `p_email`: User's email
- `p_first_name`: User's first name
- `p_last_name`: User's last name
- `p_contact_number`: User's contact number
- `p_reason`: Reason for requesting admin access
- `p_organization`: Organization (optional)
- `p_experience_level`: Experience level (default: 'INTERMEDIATE')
- `p_intended_use`: How they plan to use admin privileges (optional)

#### 2. `get_user_admin_request_status()`
Gets the current status of a user's admin request.

**Parameters:**
- `p_user_id`: User's UUID

#### 3. `cancel_admin_request()`
Allows users to cancel their pending admin request.

**Parameters:**
- `p_user_id`: User's UUID

### Admin Functions

#### 1. `get_pending_admin_requests()`
Returns all pending admin requests (admin only).

#### 2. `approve_admin_request()`
Approves an admin request and grants admin privileges.

**Parameters:**
- `p_request_id`: Request UUID
- `p_reviewer_id`: Admin reviewer's UUID
- `p_review_notes`: Review notes (optional)

#### 3. `reject_admin_request()`
Rejects an admin request.

**Parameters:**
- `p_request_id`: Request UUID
- `p_reviewer_id`: Admin reviewer's UUID
- `p_review_notes`: Review notes (required)

## Setup Instructions

### 1. Run the SQL Migration

Execute the `admin-request-system.sql` file in your Supabase SQL Editor:

```bash
# Copy the contents of admin-request-system.sql and run it in Supabase
```

### 2. Verify Setup

Check that the following were created:
- `admin_requests` table
- All views (`pending_admin_requests`, `admin_request_history`, `admin_dashboard_stats`)
- All functions
- RLS policies
- Notification templates

### 3. Test the System

1. **Create a test admin request:**
   ```sql
   SELECT create_admin_request(
       'user-uuid-here',
       'test@example.com',
       'John',
       'Doe',
       '+1234567890',
       'Need admin access for event management',
       'Test Organization',
       'INTERMEDIATE',
       'Manage events and bookings'
   );
   ```

2. **Check pending requests:**
   ```sql
   SELECT * FROM get_pending_admin_requests();
   ```

3. **Approve a request:**
   ```sql
   SELECT approve_admin_request(
       'request-uuid-here',
       'admin-uuid-here',
       'Approved - Good experience level'
   );
   ```

## Frontend Integration

### Registration Flow

When a user registers and checks "Register as Admin":
1. User is registered as a regular USER
2. An admin request is automatically created
3. User receives a confirmation message
4. User is redirected to login page
5. User must wait for admin approval before accessing admin features

### Admin Dashboard

Admins can access the admin requests page at `/admin/admin-requests` to:
- View all pending requests
- See request details (reason, organization, experience level)
- Approve or reject requests with notes
- Track request history

### User Dashboard

Users can check their admin request status at `/customer/admin-request-status` to:
- View current request status
- See review notes if rejected
- Cancel pending requests
- Submit new requests if needed

## Notification System

The system automatically sends notifications for:
- **Request Submitted**: User gets confirmation
- **New Request**: All admins get notified
- **Request Approved**: User gets approval notification
- **Request Rejected**: User gets rejection notification with notes

## Security Features

### Row Level Security (RLS)
- Users can only view their own requests
- Admins can view all requests
- Only admins can approve/reject requests
- Users can only cancel their own pending requests

### Validation
- One request per user
- Cannot request if already admin
- Cannot request if already has pending request
- Required fields validation
- Status transition validation

## API Endpoints

The system uses Supabase RPC functions for all operations:

### User Endpoints
- `create_admin_request()` - Create new request
- `get_user_admin_request_status()` - Get request status
- `cancel_admin_request()` - Cancel pending request

### Admin Endpoints
- `get_pending_admin_requests()` - Get all pending requests
- `approve_admin_request()` - Approve request
- `reject_admin_request()` - Reject request

## Usage Examples

### For Users

1. **Register with admin request:**
   - Go to `/register`
   - Fill in all required fields
   - Check "Register as Admin"
   - Submit registration
   - Wait for admin approval

2. **Check request status:**
   - Go to `/customer/admin-request-status`
   - View current status and any review notes

3. **Cancel request:**
   - On the status page, click "Cancel Request"

### For Admins

1. **View pending requests:**
   - Go to `/admin/admin-requests`
   - See all pending requests with details

2. **Review a request:**
   - Click "Approve" or "Reject"
   - Add review notes (required for rejection)
   - Submit decision

3. **Monitor activity:**
   - Check notification bell for new requests
   - View request history

## Troubleshooting

### Common Issues

1. **"You already have a pending request"**
   - User already has a request in PENDING status
   - Solution: Cancel existing request or wait for review

2. **"Only admins can approve admin requests"**
   - User trying to approve without admin role
   - Solution: Ensure user has ADMIN role

3. **"Request not found or not pending"**
   - Request already processed or doesn't exist
   - Solution: Check request status

4. **"Please provide a reason for rejection"**
   - Rejection requires review notes
   - Solution: Add review notes before rejecting

### Database Issues

1. **Function not found:**
   - Ensure all SQL functions were created
   - Check Supabase logs for errors

2. **Permission denied:**
   - Verify RLS policies are in place
   - Check user roles and permissions

3. **Trigger not working:**
   - Ensure triggers are properly created
   - Check for syntax errors in trigger functions

## Best Practices

### For Admins
- Review requests promptly
- Provide clear, constructive feedback
- Consider experience level and intended use
- Document decisions with review notes

### For Users
- Provide detailed reasons for admin access
- Include relevant experience and organization
- Be patient during review process
- Check status regularly

### For Developers
- Monitor system performance
- Review logs for errors
- Update notification templates as needed
- Test all functions regularly

## Future Enhancements

Potential improvements for the admin request system:

1. **Bulk Operations**: Approve/reject multiple requests at once
2. **Request Templates**: Pre-defined reasons for common use cases
3. **Auto-approval**: Automatic approval for certain criteria
4. **Request Expiry**: Auto-cancel old pending requests
5. **Advanced Filtering**: Filter requests by date, status, experience level
6. **Email Notifications**: Send email notifications in addition to in-app
7. **Request Analytics**: Track approval rates and response times
8. **Integration**: Connect with external identity verification services

## Support

For issues or questions about the admin request system:

1. Check this documentation
2. Review Supabase logs
3. Test with sample data
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0 