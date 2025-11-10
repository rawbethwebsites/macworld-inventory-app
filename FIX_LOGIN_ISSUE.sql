-- ═══════════════════════════════════════════════════════════════
-- 🔧 FIX LOGIN ISSUE FOR admin@macworld.com
-- ═══════════════════════════════════════════════════════════════
-- 
-- This script will:
-- 1. Check if user exists
-- 2. Check if profile exists
-- 3. Create profile if missing
-- 4. Set user as admin
-- 5. Verify everything is correct
--
-- ═══════════════════════════════════════════════════════════════

-- STEP 1: Check if user exists in auth.users
SELECT 
  'User in auth.users:' as check_type,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@macworld.com';

-- STEP 2: Check if profile exists
SELECT 
  'User profile:' as check_type,
  id,
  email,
  full_name,
  role,
  is_active
FROM public.user_profiles 
WHERE email = 'admin@macworld.com';

-- STEP 3: Create profile if it doesn't exist (and set as admin)
INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  'admin' as role,
  true as is_active
FROM auth.users
WHERE email = 'admin@macworld.com'
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin',
  is_active = true,
  email = EXCLUDED.email;

-- STEP 4: Ensure user is confirmed (if you have access)
-- Note: This might require admin access to auth schema
-- If this fails, manually confirm in Supabase Dashboard

-- STEP 5: Final verification
SELECT 
  'FINAL CHECK:' as status,
  up.email,
  up.role,
  up.is_active,
  au.email_confirmed_at,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email Confirmed'
    ELSE '❌ Email NOT Confirmed - Go to Dashboard to confirm'
  END as email_status
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.email = 'admin@macworld.com';

-- ═══════════════════════════════════════════════════════════════
-- ✅ WHAT TO CHECK NEXT:
-- ═══════════════════════════════════════════════════════════════
--
-- 1. In Supabase Dashboard → Authentication → Users:
--    - Find admin@macworld.com
--    - Check "Email Confirmed" is TRUE
--    - If FALSE, click user → Edit → Set "Email Confirmed" to TRUE
--
-- 2. If user doesn't exist in Authentication → Users:
--    - Click "Add user"
--    - Email: admin@macworld.com
--    - Password: Macworld.101
--    - ✅ Turn ON "Auto Confirm User"
--    - Click "Create user"
--    - Then run this SQL again
--
-- 3. Try logging in again:
--    - Go to http://localhost:3000/login
--    - Email: admin@macworld.com
--    - Password: Macworld.101
--
-- ═══════════════════════════════════════════════════════════════

