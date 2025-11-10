-- ═══════════════════════════════════════════════════════════════
-- 🔐 CREATE ADMIN USER
-- ═══════════════════════════════════════════════════════════════
-- 
-- INSTRUCTIONS:
-- 1. First, create a user in Supabase Dashboard:
--    - Go to Authentication → Users → Add user
--    - Enter email and password
--    - Turn ON "Auto Confirm User"
--    - Click "Create user"
--
-- 2. Then run this SQL (replace email with YOUR email):
--    UPDATE public.user_profiles 
--    SET role = 'admin' 
--    WHERE email = 'your-email@example.com';
--
-- 3. Verify it worked:
--    SELECT email, role FROM public.user_profiles WHERE role = 'admin';
--
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- STEP 1: Replace 'your-email@example.com' with YOUR email below
-- ═══════════════════════════════════════════════════════════════

UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- ═══════════════════════════════════════════════════════════════
-- STEP 2: Verify the update worked (optional)
-- ═══════════════════════════════════════════════════════════════

-- Uncomment the line below to check:
-- SELECT email, full_name, role, created_at FROM public.user_profiles WHERE role = 'admin';

-- ═══════════════════════════════════════════════════════════════
-- ✅ DONE!
-- ═══════════════════════════════════════════════════════════════
-- 
-- Now you can:
-- 1. Go to http://localhost:3000/login
-- 2. Enter your email and password
-- 3. Click "Sign in"
-- 4. You should see "ADMIN" badge in the navbar!
--
-- ═══════════════════════════════════════════════════════════════

