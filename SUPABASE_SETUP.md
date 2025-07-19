# Supabase Integration Setup Guide

## Overview
This guide explains how to connect your Spring Boot Event Management System to Supabase.

## Prerequisites
1. A Supabase account and project
2. Your Supabase project credentials

## Setup Steps

### 1. Get Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - Project URL
   - Anon/Public Key
   - Service Role Key
   - Database Password

### 2. Configure Database Connection

#### Option A: Direct PostgreSQL Connection (Recommended)
Update `src/main/resources/application-supabase.properties`:

```properties
# Replace with your actual Supabase credentials
spring.datasource.url=jdbc:postgresql://db.YOUR_PROJECT_REF.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=YOUR_DATABASE_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

# Supabase API Configuration
supabase.url=https://YOUR_PROJECT_REF.supabase.co
supabase.anon.key=YOUR_ANON_KEY
supabase.service.role.key=YOUR_SERVICE_ROLE_KEY
```

#### Option B: Use REST API Only
Keep your current MySQL configuration and use SupabaseService for API calls.

### 3. Run the Application

#### For Direct PostgreSQL Connection:
```bash
./gradlew bootRun --args='--spring.profiles.active=supabase'
```

#### For REST API Only:
```bash
./gradlew bootRun
```

## Database Schema Migration

### Option 1: Automatic Migration (Recommended)
The application will automatically create tables using JPA/Hibernate:
- Set `spring.jpa.hibernate.ddl-auto=update` in properties
- Tables will be created based on your Entity classes

### Option 2: Manual SQL Migration
Run the following SQL in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255),
    price DECIMAL(10,2),
    category_id BIGINT REFERENCES categories(id),
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id),
    user_id BIGINT REFERENCES users(id),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Examples

### Using SupabaseService for REST API calls:

```java
@Autowired
private SupabaseService supabaseService;

// Get all events
ResponseEntity<String> events = supabaseService.get("events");

// Create a new event
Event event = new Event();
event.setTitle("Sample Event");
ResponseEntity<String> response = supabaseService.post("events", event);

// Update an event
ResponseEntity<String> updateResponse = supabaseService.put("events", "1", event);

// Delete an event
ResponseEntity<String> deleteResponse = supabaseService.delete("events", "1");
```

### Using JPA Repositories (Direct PostgreSQL):
Your existing repositories will work with Supabase PostgreSQL:

```java
@Autowired
private EventRepository eventRepository;

// All your existing JPA operations will work
List<Event> events = eventRepository.findAll();
Event event = eventRepository.save(newEvent);
```

## Security Considerations

1. **Environment Variables**: Store sensitive credentials in environment variables:
   ```bash
   export SUPABASE_URL=your_url
   export SUPABASE_ANON_KEY=your_anon_key
   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   export SUPABASE_DB_PASSWORD=your_db_password
   ```

2. **Row Level Security (RLS)**: Enable RLS in Supabase for better security:
   ```sql
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;
   ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
   ```

3. **API Keys**: Never commit API keys to version control.

## Troubleshooting

### Common Issues:

1. **Connection Refused**: Check if your IP is whitelisted in Supabase
2. **Authentication Failed**: Verify your database password
3. **SSL Issues**: Add `?sslmode=require` to your database URL if needed

### Testing Connection:
```bash
# Test PostgreSQL connection
psql "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Test REST API
curl -X GET "https://YOUR_PROJECT_REF.supabase.co/rest/v1/events" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Benefits of Supabase Integration

1. **Real-time Features**: Built-in real-time subscriptions
2. **Authentication**: Built-in auth with multiple providers
3. **Storage**: File storage capabilities
4. **Edge Functions**: Serverless functions
5. **Dashboard**: Web-based database management
6. **Backups**: Automatic backups and point-in-time recovery

## Next Steps

1. Set up your Supabase project
2. Update the configuration with your credentials
3. Test the connection
4. Migrate your data if needed
5. Update your frontend to use Supabase client if desired 