-- Safe Database Migration: Price Columns and Relationships
-- This script safely handles cases where price_cents may or may not exist

-- 1. SERVICES TABLE: Add price_dollars column safely
DO $$
BEGIN
    -- Check if price_dollars column exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'price_dollars'
    ) THEN
        ALTER TABLE services ADD COLUMN price_dollars DECIMAL(10,2);
        RAISE NOTICE 'Added price_dollars column to services table';
    ELSE
        RAISE NOTICE 'price_dollars column already exists in services table';
    END IF;

    -- Check if price_cents exists and convert if it does
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'price_cents'
    ) THEN
        -- Convert existing price_cents to dollars
        UPDATE services 
        SET price_dollars = price_cents / 100.0 
        WHERE price_cents IS NOT NULL AND price_dollars IS NULL;
        
        -- Drop the old price_cents column
        ALTER TABLE services DROP COLUMN price_cents;
        RAISE NOTICE 'Converted price_cents to price_dollars in services table';
    ELSE
        -- If no price_cents, set default values for existing services
        UPDATE services 
        SET price_dollars = CASE 
            WHEN name ILIKE '%classic%' THEN 25.00
            WHEN name ILIKE '%fade%' THEN 30.00
            WHEN name ILIKE '%beard%' THEN 15.00
            WHEN name ILIKE '%full%' THEN 40.00
            WHEN name ILIKE '%kids%' THEN 20.00
            WHEN name ILIKE '%design%' THEN 35.00
            ELSE 25.00
        END
        WHERE price_dollars IS NULL;
        RAISE NOTICE 'Set default price_dollars values in services table';
    END IF;
END $$;

-- 2. APPOINTMENTS TABLE: Add price_dollars column safely
DO $$
BEGIN
    -- Check if price_dollars column exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        AND column_name = 'price_dollars'
    ) THEN
        ALTER TABLE appointments ADD COLUMN price_dollars DECIMAL(10,2);
        RAISE NOTICE 'Added price_dollars column to appointments table';
    ELSE
        RAISE NOTICE 'price_dollars column already exists in appointments table';
    END IF;

    -- Check if price_cents exists and convert if it does
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        AND column_name = 'price_cents'
    ) THEN
        -- Convert existing price_cents to dollars
        UPDATE appointments 
        SET price_dollars = price_cents / 100.0 
        WHERE price_cents IS NOT NULL AND price_dollars IS NULL;
        
        -- Drop the old price_cents column
        ALTER TABLE appointments DROP COLUMN price_cents;
        RAISE NOTICE 'Converted price_cents to price_dollars in appointments table';
    ELSE
        -- If no price_cents, try to get price from related service
        UPDATE appointments 
        SET price_dollars = COALESCE(
            (SELECT s.price_dollars FROM services s WHERE s.id = appointments.service_id),
            25.00  -- Default fallback
        )
        WHERE price_dollars IS NULL;
        RAISE NOTICE 'Set price_dollars from services in appointments table';
    END IF;
END $$;

-- 3. Fix foreign key relationships
DO $$
BEGIN
    -- Add user_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'appointments_user_id_fkey'
    ) THEN
        ALTER TABLE appointments 
        ADD CONSTRAINT appointments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added user_id foreign key constraint';
    ELSE
        RAISE NOTICE 'user_id foreign key constraint already exists';
    END IF;

    -- Add barber_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'appointments_barber_id_fkey'
    ) THEN
        ALTER TABLE appointments 
        ADD CONSTRAINT appointments_barber_id_fkey 
        FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE RESTRICT;
        RAISE NOTICE 'Added barber_id foreign key constraint';
    ELSE
        RAISE NOTICE 'barber_id foreign key constraint already exists';
    END IF;

    -- Add service_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'appointments_service_id_fkey'
    ) THEN
        ALTER TABLE appointments 
        ADD CONSTRAINT appointments_service_id_fkey 
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT;
        RAISE NOTICE 'Added service_id foreign key constraint';
    ELSE
        RAISE NOTICE 'service_id foreign key constraint already exists';
    END IF;
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barber_id ON appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);

-- 5. Update RLS policies to ensure proper access control
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;

-- Recreate policies with improved logic
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (
        -- User can see their own appointments (logged in)
        auth.uid() = user_id OR
        -- User can see appointments made with their email (guest bookings)
        customer_email = auth.email() OR
        -- Admins and barbers can see all appointments
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'barber')
        )
    );

CREATE POLICY "Users can create appointments" ON appointments
    FOR INSERT WITH CHECK (
        -- Allow authenticated users to create appointments for themselves
        auth.uid() = user_id OR
        -- Allow guest bookings (user_id can be null)
        user_id IS NULL OR
        -- Allow admins to create appointments for anyone
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'barber')
        )
    );

CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE USING (
        -- User can update their own appointments
        auth.uid() = user_id OR
        -- User can update appointments made with their email
        customer_email = auth.email() OR
        -- Admins and barbers can update any appointment
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'barber')
        )
    );

-- Add a policy for deleting appointments (admins only)
DROP POLICY IF EXISTS "Admins can delete appointments" ON appointments;
CREATE POLICY "Admins can delete appointments" ON appointments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Ensure user_profiles has proper policies for admin access
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Final verification and summary
DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION COMPLETE ===';
    RAISE NOTICE 'Services table now has price_dollars column';
    RAISE NOTICE 'Appointments table now has price_dollars column';
    RAISE NOTICE 'All foreign key relationships established';
    RAISE NOTICE 'RLS policies updated for proper access control';
    RAISE NOTICE 'Performance indexes created';
END $$;
