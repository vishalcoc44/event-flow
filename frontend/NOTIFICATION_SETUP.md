# Notification System Setup Guide

This guide will help you set up a comprehensive notification system for your Event Management System using Supabase Edge Functions and real-time updates.

## 🚀 Quick Start

### 1. Database Migration

First, run the notification system migration in your Supabase SQL editor:

```sql
-- Copy and paste the contents of notification-system.sql
-- This creates all necessary tables, functions, triggers, and policies
```

### 2. Install Dependencies

```bash
npm install date-fns
```

### 3. Add NotificationProvider to Layout

Update your root layout to include the NotificationProvider:

```tsx
// app/layout.tsx
import { NotificationProvider } from '@/contexts/NotificationContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NotificationProvider>
            {/* Other providers */}
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 4. Deploy Edge Function

Deploy the notification processing Edge Function:

```bash
# Navigate to your Supabase project
cd supabase

# Deploy the function
supabase functions deploy process-notifications
```

### 5. Set Up Cron Job

Set up a cron job to trigger the notification processing function every hour:

```bash
# Using Supabase CLI
supabase functions schedule process-notifications "0 * * * *"
```

Or manually set up a cron job in your hosting platform to call:
```
https://your-project.supabase.co/functions/v1/process-notifications
```

## 📧 Email Integration

### Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to your Supabase environment variables:

```bash
supabase secrets set RESEND_API_KEY=your_api_key_here
```

4. Uncomment and configure the Resend integration in the Edge Function.

### Option 2: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Add to environment variables:

```bash
supabase secrets set SENDGRID_API_KEY=your_api_key_here
```

### Option 3: AWS SES

1. Configure AWS SES in your AWS account
2. Add credentials to environment variables:

```bash
supabase secrets set AWS_ACCESS_KEY_ID=your_access_key
supabase secrets set AWS_SECRET_ACCESS_KEY=your_secret_key
supabase secrets set AWS_REGION=your_region
```

## 🔧 Configuration

### Notification Types

The system supports these notification types:

- **EVENT_CREATED**: When new events are created in followed categories
- **EVENT_REMINDER**: Reminders for upcoming events (24h before)
- **BOOKING_CONFIRMED**: When a booking is confirmed
- **BOOKING_REMINDER**: Reminders for upcoming bookings
- **FOLLOW_UPDATE**: When someone follows you or your content
- **CATEGORY_UPDATE**: New events in followed categories

### User Preferences

Users can customize their notification preferences:

- Email notifications
- Push notifications
- Event reminders
- Booking reminders
- Follow updates
- Category updates
- Reminder timing (default: 24 hours)

## 🎯 Features

### Real-time Notifications

- **Live Updates**: Notifications appear instantly using Supabase real-time subscriptions
- **Unread Count**: Badge showing unread notification count
- **Mark as Read**: Click to mark individual notifications as read
- **Mark All Read**: Bulk action to mark all notifications as read

### Notification Management

- **Search**: Search through notifications by title or message
- **Filtering**: Filter by type (event, booking, follow, etc.) and status (read/unread)
- **Preferences**: Customize notification settings
- **Cleanup**: Automatic cleanup of old notifications (30+ days)

### Smart Reminders

- **Event Reminders**: Automatic reminders 24 hours before events
- **Booking Reminders**: Reminders for upcoming bookings
- **Customizable Timing**: Users can adjust reminder timing
- **Respect Preferences**: Only sends reminders if user has them enabled

## 🔄 Automatic Triggers

The system automatically creates notifications for:

1. **New Events**: Notifies category followers when events are created
2. **New Bookings**: Confirms bookings and sends reminders
3. **Follow Actions**: Notifies users when someone follows them
4. **Scheduled Reminders**: Daily processing of upcoming events

## 📱 UI Components

### NotificationBell

A dropdown component showing recent notifications with:
- Unread count badge
- Quick actions (mark as read, delete)
- Real-time updates
- Link to full notifications page

### NotificationsPage

A dedicated page for managing all notifications with:
- Search and filtering
- Bulk actions
- Preference management
- Statistics dashboard

## 🛠️ Customization

### Adding New Notification Types

1. Add the new type to the database enum:
```sql
ALTER TYPE notification_type ADD VALUE 'NEW_TYPE';
```

2. Create a template in the notification_templates table:
```sql
INSERT INTO notification_templates (type, title_template, message_template) 
VALUES ('NEW_TYPE', 'New Type: {{title}}', '{{message}}');
```

3. Create a trigger or function to generate the notification:
```sql
CREATE OR REPLACE FUNCTION trigger_new_type_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification_from_template(
    NEW.user_id,
    'NEW_TYPE',
    jsonb_build_object('title', NEW.title, 'message', NEW.message)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Custom Email Templates

Modify the email sending function in the Edge Function to use custom templates:

```typescript
const emailTemplate = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">${notification.title}</h2>
    <p style="color: #666; line-height: 1.6;">${notification.message}</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px;">
      EventFlow Notification<br>
      <a href="https://yourapp.com/notifications" style="color: #007bff;">Manage notifications</a>
    </p>
  </div>
`;
```

## 🔍 Testing

### Test Notifications

1. Create a test event to trigger category notifications
2. Make a booking to test booking confirmations
3. Follow a user/category to test follow notifications
4. Check the notifications page to verify everything works

### Test Edge Function

```bash
# Test locally
supabase functions serve process-notifications

# Test deployed function
curl -X POST https://your-project.supabase.co/functions/v1/process-notifications
```

## 📊 Monitoring

### Logs

Monitor Edge Function logs:
```bash
supabase functions logs process-notifications
```

### Database Queries

Check notification statistics:
```sql
-- View notification summary
SELECT * FROM notification_summary WHERE user_id = 'your-user-id';

-- Check unread notifications
SELECT COUNT(*) FROM notifications WHERE user_id = 'your-user-id' AND is_read = false;

-- View recent notifications
SELECT * FROM notifications WHERE user_id = 'your-user-id' ORDER BY created_at DESC LIMIT 10;
```

## 🚨 Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check real-time subscriptions and user authentication
2. **Emails not sending**: Verify email service configuration and API keys
3. **Edge Function errors**: Check function logs and environment variables
4. **Database errors**: Verify RLS policies and function permissions

### Debug Mode

Enable debug logging in the Edge Function:

```typescript
const DEBUG = true;

if (DEBUG) {
  console.log('Processing notification:', notification);
}
```

## 🔐 Security

### RLS Policies

The system includes Row Level Security policies to ensure users can only:
- View their own notifications
- Update their own notification preferences
- Access their own notification summary

### Environment Variables

Keep sensitive data in environment variables:
- Email service API keys
- Supabase service role key
- Database connection strings

## 📈 Performance

### Optimization Tips

1. **Indexes**: The migration includes optimized indexes for common queries
2. **Pagination**: The notification list uses pagination (50 items per page)
3. **Cleanup**: Automatic cleanup of old notifications prevents database bloat
4. **Caching**: Consider implementing Redis caching for frequently accessed data

### Scaling

For high-traffic applications:
- Use database connection pooling
- Implement notification queuing
- Consider using a dedicated notification service
- Monitor database performance and optimize queries

## 🎉 Success!

Your notification system is now fully functional! Users will receive:

- Real-time notifications for social interactions
- Automatic reminders for upcoming events
- Email notifications (when configured)
- Full control over notification preferences

The system is designed to be scalable, secure, and user-friendly while providing comprehensive notification management capabilities. 