-- Fix Foreign Key Relationships for West Coast Kutz
-- Run this in Supabase SQL Editor to fix the appointments-user_profiles relationship

-- 1. First, ensure user_profiles table exists and has proper structure
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'barber')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add user_id column to appointments if it doesn't exist
DO $$
BEGIN
    -- Check if user_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        AND column_name = 'user_id'
    ) THEN
        -- Add the user_id column
        ALTER TABLE appointments ADD COLUMN user_id UUID;
        RAISE NOTICE 'Added user_id column to appointments table';
    ELSE
        RAISE NOTICE 'user_id column already exists in appointments table';
    END IF;
END $$;

-- 3. Create the foreign key constraint if it doesn't exist
DO $$
BEGIN
    -- Check if the foreign key constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'appointments_user_id_fkey'
        AND table_name = 'appointments'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE appointments 
        ADD CONSTRAINT appointments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Created foreign key constraint appointments_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint appointments_user_id_fkey already exists';
    END IF;
END $$;

-- 4. Enable RLS on user_profiles if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for user_profiles if they don't exist
DO $$
BEGIN
    -- Check if policies exist and create them if they don't
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON user_profiles
            FOR SELECT USING (auth.uid() = id);
        RAISE NOTICE 'Created policy: Users can view own profile';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON user_profiles
            FOR UPDATE USING (auth.uid() = id);
        RAISE NOTICE 'Created policy: Users can update own profile';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON user_profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
        RAISE NOTICE 'Created policy: Users can insert own profile';
    END IF;
END $$;

-- 6. Update appointments RLS policies to handle the new user_id relationship
DO $$
BEGIN
    -- Drop existing appointment policies if they exist
    DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
    DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
    DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;

    -- Create new policies that handle both user_id and email-based access
    CREATE POLICY "Users can view own appointments" ON appointments
        FOR SELECT USING (
            auth.uid() = user_id OR
            customer_email = auth.email() OR
            EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'barber'))
        );

    CREATE POLICY "Users can create appointments" ON appointments
        FOR INSERT WITH CHECK (
            auth.uid() = user_id OR
            customer_email = auth.email() OR
            auth.uid() IS NULL  -- Allow anonymous bookings
        );

    CREATE POLICY "Users can update own appointments" ON appointments
        FOR UPDATE USING (
            auth.uid() = user_id OR
            customer_email = auth.email() OR
            EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'barber'))
        );

    RAISE NOTICE 'Updated appointments RLS policies';
END $$;

-- 7. Create an index on the new user_id column for performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);

-- 8. Verify the setup
DO $$
DECLARE
    constraint_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    -- Check if user_id column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'user_id'
    ) INTO column_exists;

    -- Check if foreign key constraint exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'appointments_user_id_fkey'
    ) INTO constraint_exists;

    RAISE NOTICE 'Setup verification:';
    RAISE NOTICE '- user_id column exists: %', column_exists;
    RAISE NOTICE '- Foreign key constraint exists: %', constraint_exists;
    
    IF column_exists AND constraint_exists THEN
        RAISE NOTICE 'SUCCESS: All foreign key relationships are properly configured!';
    ELSE
        RAISE NOTICE 'WARNING: Some relationships may still be missing';
    END IF;
END $$;
