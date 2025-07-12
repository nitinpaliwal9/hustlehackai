-- Setup RLS policies for users table
-- Run this in your Supabase SQL editor

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional)
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users;

-- INSERT policy: Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = id);

-- SELECT policy: Allow authenticated users to read their own profile
CREATE POLICY "Users can read their own profile" ON users
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);

-- UPDATE policy: Allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- DELETE policy: Allow authenticated users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON users
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = id);

-- Optional: Allow service role to bypass RLS for admin operations
-- CREATE POLICY "Service role can do anything" ON users
--     FOR ALL 
--     TO service_role 
--     USING (true)
--     WITH CHECK (true);

-- Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';
