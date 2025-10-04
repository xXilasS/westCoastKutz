-- Quick Database Status Check
-- Run this in Supabase SQL Editor to verify the migration worked

-- 1. Check if user_id column exists in appointments
SELECT 
    'appointments.user_id column' as check_item,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'appointments' AND column_name = 'user_id'
        ) THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status;

-- 2. Check if foreign key constraint exists
SELECT 
    'appointments_user_id_fkey constraint' as check_item,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'appointments_user_id_fkey'
        ) THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status;

-- 3. Check if user_profiles table exists
SELECT 
    'user_profiles table' as check_item,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'user_profiles'
        ) THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status;

-- 4. Test the exact query that was failing
-- This should work without errors if the migration succeeded
SELECT 
    'appointments query test' as check_item,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM appointments 
            LEFT JOIN services ON appointments.service_id = services.id
            LEFT JOIN barbers ON appointments.barber_id = barbers.id
        ) >= 0 THEN '✅ QUERY WORKS' 
        ELSE '❌ QUERY FAILS' 
    END as status;
