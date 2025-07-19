-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Public insert access" ON users;

-- Create a trigger function to sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, first_name, last_name, contact_number, city, pincode, street_address, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'pincode', ''),
    COALESCE(NEW.raw_user_meta_data->>'street_address', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    contact_number = EXCLUDED.contact_number,
    city = EXCLUDED.city,
    pincode = EXCLUDED.pincode,
    street_address = EXCLUDED.street_address,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create new RLS policies for users table
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow public to access the users table (needed for the trigger)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
GRANT ALL ON users TO service_role;
GRANT ALL ON users TO postgres;
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

-- Create a function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 