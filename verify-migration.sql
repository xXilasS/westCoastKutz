-- Quick verification that the migration worked
-- Run this in Supabase SQL Editor

-- 1. Check if user_id column exists in appointments
SELECT 
    'user_id column exists' as check_name,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'user_id'
    ) as result;

-- 2. Check if foreign key constraint exists
SELECT 
    'foreign key constraint exists' as check_name,
    EXISTS(
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'appointments_user_id_fkey'
    ) as result;

-- 3. Test the appointments query that admin dashboard uses
SELECT 
    'appointments query test' as check_name,
    COUNT(*) as appointment_count,
    'SUCCESS' as status
FROM appointments;

-- 4. Test services and barbers relationships
SELECT 
    a.id,
    a.customer_name,
    a.appointment_date,
    a.price_dollars,
    s.name as service_name,
    b.name as barber_name
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN barbers b ON a.barber_id = b.id
LIMIT 3;
