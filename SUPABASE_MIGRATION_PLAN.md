# Complete Supabase Migration Plan

This document outlines the steps to completely remove the Spring Boot backend and migrate your application to use Supabase exclusively.

## 1. Setup Supabase Project

1. **Create Supabase Project**
   - Sign up/login at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Configure Environment**
   - Create `.env.local` file in your frontend directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

## 2. Database Migration

1. **Create Tables in Supabase**
   - Go to SQL Editor in Supabase Dashboard
   - Execute the following SQL:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255),
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255),
    price DECIMAL(10,2),
    image_url TEXT,
    category_id UUID REFERENCES categories(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

2. **Set Up Row Level Security (RLS)**
   - Enable RLS for all tables:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Admin can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for categories
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);
    
CREATE POLICY "Only admins can modify categories" ON categories
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for events
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);
    
CREATE POLICY "Creators can modify their events" ON events
    USING (auth.uid() = created_by);
    
CREATE POLICY "Admins can modify all events" ON events
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Event creators can view bookings for their events" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events WHERE events.id = bookings.event_id AND events.created_by = auth.uid()
        )
    );
    
CREATE POLICY "Users can create their own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);
```

## 3. Authentication Setup

1. **Configure Supabase Auth**
   - Go to Authentication > Settings in Supabase Dashboard
   - Enable Email provider
   - Configure any additional providers (Google, GitHub, etc.)
   - Set up email templates

2. **Update Frontend Auth**
   - Remove JWT token handling from frontend
   - Use Supabase Auth methods instead

## 4. Frontend Migration

1. **Update API Client**
   - Remove existing API calls to Spring Boot backend
   - Replace with Supabase client calls

2. **Update Components**
   - Modify components to use Supabase data fetching
   - Implement real-time subscriptions where needed

3. **Example Component Updates:**

```tsx
// Before (with Spring Boot backend)
import { eventsAPI } from '@/lib/api';

const EventList = () => {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.getAllEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    
    fetchEvents();
  }, []);
  
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
};
```

```tsx
// After (with Supabase)
import { supabase } from '@/lib/supabase';

const EventList = () => {
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
};
```

## 5. Implement Serverless Functions (Edge Functions)

For complex operations that were handled by your Spring Boot controllers:

1. **Create Edge Functions**
   - Go to Edge Functions in Supabase Dashboard
   - Create new functions for complex operations

2. **Example Edge Function:**

```typescript
// supabase/functions/create-booking/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { eventId, userId } = await req.json()
    
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )
    
    // Check if event exists and has available capacity
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
      
    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    // Check if user already has a booking for this event
    const { data: existingBooking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()
      
    if (existingBooking) {
      return new Response(
        JSON.stringify({ error: 'You already have a booking for this event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Create booking
    const { data: booking, error: createError } = await supabaseClient
      .from('bookings')
      .insert([
        { event_id: eventId, user_id: userId, status: 'CONFIRMED' }
      ])
      .select()
      .single()
      
    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    return new Response(
      JSON.stringify({ booking }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

## 6. Storage Setup

1. **Create Storage Buckets**
   - Go to Storage in Supabase Dashboard
   - Create buckets for:
     - Event images
     - User avatars
     - Documents

2. **Configure Storage Policies**
```sql
-- Public access for event images
CREATE POLICY "Event images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'event-images');

-- Only authenticated users can upload event images
CREATE POLICY "Authenticated users can upload event images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');

-- Users can update their own uploads
CREATE POLICY "Users can update their own uploads" 
ON storage.objects FOR UPDATE 
USING (auth.uid() = owner);
```

## 7. Project Structure Update

1. **Remove Backend Code**
   - ✅ Delete or archive the Spring Boot backend code
   - Keep only the frontend directory

2. **Update Project Structure**
```
event-management-system/
  ├── frontend/               # Next.js frontend
  │   ├── public/             # Static assets
  │   ├── src/
  │   │   ├── app/            # Next.js app router
  │   │   ├── components/     # React components
  │   │   ├── contexts/       # React contexts
  │   │   └── lib/
  │   │       ├── supabase.ts # Supabase client
  │   │       └── api.ts      # API functions using Supabase
  │   ├── .env.local          # Environment variables (not in git)
  │   └── package.json        # Frontend dependencies
  └── README.md               # Project documentation
```

## 8. Deployment

1. **Deploy Frontend**
   - Deploy your Next.js frontend to Vercel:
   ```bash
   cd frontend
   npm run build
   # Deploy to Vercel
   vercel
   ```

2. **Update Environment Variables**
   - Add production environment variables in Vercel dashboard

## 9. Testing

1. **Test Authentication**
   - Sign up
   - Sign in
   - Password reset

2. **Test CRUD Operations**
   - Create, read, update, delete for:
     - Events
     - Categories
     - Bookings

3. **Test Real-time Features**
   - Verify real-time updates work

## 10. Cleanup

1. **Remove Unused Dependencies**
   - Update package.json to remove unused dependencies

2. **Update Documentation**
   - Update README.md with new architecture information
   - Document Supabase setup for new developers

## Next Steps After Backend Removal

Now that you've deleted all backend Java files, here are the immediate next steps to complete your migration:

1. **Setup Supabase Project**
   - Create your Supabase project if you haven't already
   - Copy your project URL and API keys

2. **Configure Environment Variables**
   - Create a `.env.local` file in your frontend directory with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

3. **Create Database Schema**
   - Execute the SQL scripts in sections 2.1 and 2.2 to create tables and RLS policies
   - Verify tables are created correctly

4. **Setup Storage**
   - Create the `event-images` bucket
   - Apply the storage policies in section 6.2

5. **Test Frontend Integration**
   - Run your frontend application
   - Test authentication (sign up, sign in)
   - Test CRUD operations for events, categories, and bookings
   - Verify that real-time updates work

6. **Address Any Issues**
   - Debug any connection issues
   - Check RLS policies if permission errors occur
   - Verify authentication flow

7. **Deploy Your Application**
   - Once everything is working locally, deploy to Vercel or your preferred hosting platform

## Migration Checklist

- [ ] Create Supabase project
- [ ] Set up database schema and RLS policies
- [ ] Configure authentication
- [ ] Set up Storage buckets and policies
- [ ] Test all features
- [ ] Deploy frontend
- [ ] Clean up and document 