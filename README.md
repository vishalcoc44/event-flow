# Event Management System - Supabase Integration

This project is an Event Management System that uses Supabase for backend services.

## Project Overview

The application uses Supabase for:
- Database (PostgreSQL)
- Authentication
- Storage
- Serverless functions (Edge Functions)
- Real-time subscriptions

## Project Structure

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

## Setup Instructions

### 1. Create a Supabase Project

1. Sign up or log in at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys (found in Settings > API)

### 2. Configure Environment Variables

Create a `.env.local` file in the frontend directory:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 3. Set Up Database Schema

Run the following SQL in the Supabase SQL Editor:

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

### 4. Set Up Row Level Security (RLS)

Run the following SQL to enable RLS:

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

### 5. Set Up Social Features

Run the social features migration in the Supabase SQL Editor:

```sql
-- Run the contents of social-features-migration.sql
-- This creates the follows table, adds follower count columns,
-- sets up RLS policies, and creates real-time triggers
```

### 6. Set Up Storage

1. Go to Storage in the Supabase Dashboard
2. Create a bucket named `event-images`
3. Set up storage policies:

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

### 7. Install Dependencies and Run

```bash
cd frontend
npm install
npm run dev
```

## Features

### 1. User Management
- Registration and login
- Role-based access control (Admin/User)
- Profile management

### 2. Event Management
- Create, read, update, delete events
- Categorize events
- Upload event images

### 3. Booking System
- Book events
- View bookings
- Cancel bookings

### 4. Social Features
- Follow other users
- Follow events and categories
- View follower counts and social profiles
- Real-time social updates
- Social dashboard with comprehensive social interactions

### 5. Admin Features
- Manage users
- Manage categories
- View all bookings

## Deployment

### Deploy Frontend to Vercel

```bash
cd frontend
vercel
```

Add your environment variables in the Vercel dashboard.

## License

MIT 