-- ═══════════════════════════════════════════════════════════════
-- 👥 ADMIN ROLES & PERMISSIONS SETUP
-- ═══════════════════════════════════════════════════════════════
-- 
-- This script creates:
-- 1. roles table with predefined roles
-- 2. Updates user_profiles to use role_id
-- 3. Migrates existing role data
-- 4. Sets up permissions structure
--
-- ═══════════════════════════════════════════════════════════════

-- 1. Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- 2. Add role_id to user_profiles (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN role_id BIGINT REFERENCES public.roles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Create index for role_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON public.user_profiles(role_id);

-- 4. Insert initial roles
INSERT INTO public.roles (name, description, is_system_role) VALUES
  ('Admin', 'Full system access, can manage users and roles', true),
  ('Staff', 'General staff access to most features', false),
  ('Inventory Manager', 'Can manage products, categories, and inventory', false),
  ('Accountant', 'Can manage invoices, customers, and financial data', false),
  ('Viewer', 'Read-only access to view data', false)
ON CONFLICT (name) DO NOTHING;

-- 5. Migrate existing role data to role_id
-- Map old text roles to new role IDs
UPDATE public.user_profiles up
SET role_id = r.id
FROM public.roles r
WHERE 
  up.role_id IS NULL
  AND (
    (up.role = 'admin' AND r.name = 'Admin') OR
    (up.role = 'staff' AND r.name = 'Staff') OR
    (up.role = 'user' AND r.name = 'Viewer')
  );

-- 6. Set default role for users without role_id
UPDATE public.user_profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'Viewer' LIMIT 1)
WHERE role_id IS NULL;

-- 7. Enable RLS on roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- 8. Create policies for roles table
DROP POLICY IF EXISTS "Anyone can view active roles" ON public.roles;
CREATE POLICY "Anyone can view active roles"
ON public.roles FOR SELECT
TO authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
CREATE POLICY "Admins can manage roles"
ON public.roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() AND r.name = 'Admin'
  )
);

-- 9. Create function to update updated_at
CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION update_roles_updated_at();

-- 11. Create permissions table (for future use)
CREATE TABLE IF NOT EXISTS public.permissions (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL
);

-- 12. Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id BIGINT REFERENCES public.permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

-- 13. Enable RLS on permissions tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 14. Policies for permissions (admins only)
DROP POLICY IF EXISTS "Admins can view permissions" ON public.permissions;
CREATE POLICY "Admins can view permissions"
ON public.permissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() AND r.name = 'Admin'
  )
);

DROP POLICY IF EXISTS "Admins can manage permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage permissions"
ON public.role_permissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() AND r.name = 'Admin'
  )
);

-- 15. Update user_profiles policies to check role_id
-- (Keep existing policies, they should still work)

-- 16. Create view for user roles (for easier querying)
CREATE OR REPLACE VIEW public.user_roles_view AS
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.is_active,
  up.created_at,
  r.id as role_id,
  r.name as role_name,
  r.description as role_description
FROM public.user_profiles up
LEFT JOIN public.roles r ON up.role_id = r.id;

-- ═══════════════════════════════════════════════════════════════
-- ✅ VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════

-- Check roles were created
SELECT * FROM public.roles ORDER BY id;

-- Check user_profiles have role_id
SELECT 
  email, 
  role, 
  role_id,
  (SELECT name FROM public.roles WHERE id = user_profiles.role_id) as role_name
FROM public.user_profiles
LIMIT 10;

-- ═══════════════════════════════════════════════════════════════
-- 📝 NOTES:
-- ═══════════════════════════════════════════════════════════════
--
-- 1. The old 'role' text column is kept for backward compatibility
--    but new code should use role_id
--
-- 2. System roles (like Admin) cannot be deleted (enforced in UI)
--
-- 3. All existing users are migrated to use role_id
--
-- 4. Default role for new users is 'Viewer'
--
-- ═══════════════════════════════════════════════════════════════

