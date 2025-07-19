# Supabase Frontend Integration Guide

This guide explains how to set up and use Supabase in your Next.js frontend for the Event Management System.

## Prerequisites

1. A Supabase account and project (same one used for backend)
2. Your Supabase project credentials

## Setup Steps

### 1. Install Dependencies

The `@supabase/supabase-js` package has already been added to your project. If you need to install it manually:

```bash
npm install @supabase/supabase-js
```

### 2. Configure Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Replace `YOUR_PROJECT_REF` and `YOUR_ANON_KEY` with your actual Supabase project values.

### 3. Choose Integration Approach

#### Option A: Direct Supabase Client (Frontend Only)

Use the Supabase client directly in your components:

```tsx
import { supabase, supabaseDB, supabaseAuth } from '@/lib/supabase';

// Authentication
const handleLogin = async () => {
  const { data, error } = await supabaseAuth.signIn(email, password);
  if (error) console.error('Error logging in:', error);
  else console.log('Logged in:', data);
};

// Database operations
const fetchEvents = async () => {
  const { data, error } = await supabaseDB.getEvents();
  if (error) console.error('Error fetching events:', error);
  else setEvents(data);
};
```

#### Option B: Hybrid Approach (Backend + Frontend)

Continue using your existing API client for backend communication, but use Supabase for specific features:

```tsx
import { eventsAPI } from '@/lib/api'; // Existing API client
import { supabase } from '@/lib/supabase'; // Supabase for specific features

// Use existing API for most operations
const fetchEvents = async () => {
  try {
    const events = await eventsAPI.getAllEvents();
    setEvents(events);
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Use Supabase for real-time features
const subscribeToEvents = () => {
  const subscription = supabase
    .channel('public:events')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
      console.log('Change received!', payload);
      // Update your UI based on the change
      fetchEvents();
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(subscription);
  };
};
```

### 4. Authentication Flow

#### With Supabase Auth

```tsx
// Sign up
const handleSignUp = async () => {
  const { data, error } = await supabaseAuth.signUp(email, password);
  if (error) {
    console.error('Error signing up:', error);
  } else {
    console.log('Signed up:', data);
    // Redirect or show confirmation
  }
};

// Sign in
const handleSignIn = async () => {
  const { data, error } = await supabaseAuth.signIn(email, password);
  if (error) {
    console.error('Error signing in:', error);
  } else {
    console.log('Signed in:', data);
    router.push('/dashboard');
  }
};

// Sign out
const handleSignOut = async () => {
  const { error } = await supabaseAuth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  } else {
    router.push('/login');
  }
};
```

### 5. Real-time Subscriptions

One of Supabase's powerful features is real-time data:

```tsx
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function EventsList() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    // Fetch initial data
    fetchEvents();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('public:events')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' }, 
        (payload) => {
          console.log('Change received!', payload);
          fetchEvents(); // Refresh data when changes occur
        }
      )
      .subscribe();
      
    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  
  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) console.error('Error fetching events:', error);
    else setEvents(data);
  };
  
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

### 6. File Storage

Supabase also provides file storage capabilities:

```tsx
const uploadEventImage = async (file, eventId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${eventId}.${fileExt}`;
  const filePath = `event-images/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('events')
    .upload(filePath, file);
    
  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('events')
    .getPublicUrl(filePath);
    
  return publicUrl;
};
```

## Benefits of Supabase in Frontend

1. **Real-time Data**: Automatic real-time subscriptions
2. **Authentication**: Built-in auth with multiple providers
3. **Storage**: Simple file uploads and management
4. **TypeScript Support**: Full type safety with generated types
5. **Edge Functions**: Serverless functions for complex operations

## Next Steps

1. Create a Supabase project if you haven't already
2. Set up your environment variables
3. Decide on your integration approach
4. Update components to use Supabase where appropriate
5. Test the integration

## Troubleshooting

- **CORS Issues**: Ensure your Supabase project has the correct CORS configuration
- **Authentication Problems**: Check that your anon key has the correct permissions
- **TypeScript Errors**: Generate types using Supabase CLI for better type safety 