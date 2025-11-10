-- ═══════════════════════════════════════════════════════════════
-- 🔐 SET ADMIN USER FOR MACWORLD
-- ═══════════════════════════════════════════════════════════════
-- 
-- CREDENTIALS:
-- Email: admin@macworld.com
-- Password: Macworld.101
--
-- INSTRUCTIONS:
-- 1. FIRST: Create the user in Supabase Dashboard:
--    - Go to Authentication → Users → Add user
--    - Email: admin@macworld.com
--    - Password: Macworld.101
--    - Turn ON "Auto Confirm User"
--    - Click "Create user"
--
-- 2. THEN: Run this SQL script
--
-- 3. FINALLY: Log in at http://localhost:3000/login
--
-- ═══════════════════════════════════════════════════════════════

-- Set user as admin
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'admin@macworld.com';

-- Verify the update
SELECT 
  email, 
  full_name, 
  role, 
  is_active,
  created_at
FROM public.user_profiles 
WHERE email = 'admin@macworld.com';

-- ═══════════════════════════════════════════════════════════════
-- ✅ DONE!
-- ═══════════════════════════════════════════════════════════════
-- 
-- Expected result:
-- email: admin@macworld.com
-- role: admin
-- is_active: true
--
-- Now log in at: http://localhost:3000/login
-- Email: admin@macworld.com
-- Password: Macworld.101
--
-- ═══════════════════════════════════════════════════════════════

