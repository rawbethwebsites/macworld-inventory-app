-- Quick Category Setup for Supabase
-- Copy and paste this entire script into Supabase SQL Editor

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  parent_id BIGINT REFERENCES categories(id) ON DELETE CASCADE
);

-- 2. Add is_active column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='categories' AND column_name='is_active'
    ) THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- 4. Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Allow all access to categories" ON categories;
CREATE POLICY "Allow all access to categories"
ON categories FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 6. Add category_id to products table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='products' AND column_name='category_id'
    ) THEN
        ALTER TABLE products ADD COLUMN category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- 7. Insert sample parent categories
INSERT INTO categories (name, parent_id, is_active) VALUES
  ('Electronics', NULL, true),
  ('Computers', NULL, true),
  ('Audio', NULL, true),
  ('Accessories', NULL, true),
  ('Gaming', NULL, true),
  ('Home & Office', NULL, true)
ON CONFLICT DO NOTHING;

-- Done! Now refresh your app and visit http://localhost:3000/categories
