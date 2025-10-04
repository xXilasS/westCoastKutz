-- Test Database Connection and Verify Schema
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Check if all required tables exist
SELECT 
    'appointments' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') as exists
UNION ALL
SELECT 
    'services' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'services') as exists
UNION ALL
SELECT 
    'barbers' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'barbers') as exists
UNION ALL
SELECT 
    'user_profiles' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') as exists;

-- 2. Check if user_id column exists in appointments
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name IN ('user_id', 'price_dollars', 'customer_name', 'customer_email');

-- 3. Check foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'appointments';

-- 4. Test basic queries that the admin dashboard uses
-- Test services query
SELECT 
    'services_test' as test_name,
    COUNT(*) as record_count,
    'SUCCESS' as status
FROM services 
WHERE is_active = true;

-- Test barbers query  
SELECT 
    'barbers_test' as test_name,
    COUNT(*) as record_count,
    'SUCCESS' as status
FROM barbers 
WHERE is_active = true;

-- Test appointments query (without problematic joins)
SELECT 
    'appointments_test' as test_name,
    COUNT(*) as record_count,
    'SUCCESS' as status
FROM appointments;

-- 5. Test the exact query the admin dashboard will use
SELECT 
    id,
    customer_name,
    customer_email,
    appointment_date,
    appointment_time,
    price_dollars,
    status
FROM appointments 
ORDER BY appointment_date DESC 
LIMIT 5;
