-- Test User Account Creation Process
-- Run this in Supabase SQL Editor to verify user accounts are being created

-- 1. Check total number of users in auth.users
SELECT 
    'Total users in auth.users' as metric,
    COUNT(*) as count
FROM auth.users;

-- 2. Check total number of user profiles
SELECT 
    'Total user profiles' as metric,
    COUNT(*) as count
FROM user_profiles;

-- 3. Check recent appointments with user linkage
SELECT 
    'Recent appointments (last 7 days)' as metric,
    COUNT(*) as total_appointments,
    COUNT(user_id) as appointments_with_user_id,
    COUNT(*) - COUNT(user_id) as anonymous_appointments
FROM appointments 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- 4. Show sample of recent appointments with user data
SELECT 
    a.id as appointment_id,
    a.customer_name,
    a.customer_email,
    a.user_id,
    CASE 
        WHEN a.user_id IS NOT NULL THEN '✅ Has User Account'
        ELSE '❌ Anonymous Booking'
    END as account_status,
    a.created_at
FROM appointments a
ORDER BY a.created_at DESC
LIMIT 10;

-- 5. Check for orphaned user profiles (profiles without auth users)
SELECT 
    'Orphaned user profiles' as metric,
    COUNT(*) as count
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE au.id IS NULL;

-- 6. Check for users without profiles (auth users without user_profiles)
SELECT 
    'Auth users without profiles' as metric,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL;

-- 7. Show user creation pattern over time (last 30 days)
SELECT 
    DATE(created_at) as date,
    COUNT(*) as users_created
FROM auth.users
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 10;
