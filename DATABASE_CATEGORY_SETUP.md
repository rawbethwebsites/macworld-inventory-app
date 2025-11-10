# Category System Setup for Supabase

This guide will help you set up the category system for products.

## 🗄️ Step 1: Create Categories Table

Go to your Supabase Dashboard → SQL Editor and run this:

```sql
-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  parent_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true
);

-- Add index for faster queries
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories
CREATE POLICY "Allow public read access to categories"
ON categories FOR SELECT
TO public
USING (is_active = true);

-- Allow authenticated users to manage categories (for admins)
CREATE POLICY "Allow authenticated insert to categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update to categories"
ON categories FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete to categories"
ON categories FOR DELETE
TO authenticated
USING (true);

-- Insert sample parent categories
INSERT INTO categories (name, parent_id) VALUES
  ('Electronics', NULL),
  ('Computers', NULL),
  ('Mobile Devices', NULL),
  ('Accessories', NULL),
  ('Audio', NULL),
  ('Gaming', NULL);

-- Insert sample subcategories under Electronics
INSERT INTO categories (name, parent_id) VALUES
  ('Smartphones', (SELECT id FROM categories WHERE name = 'Electronics' AND parent_id IS NULL LIMIT 1)),
  ('Tablets', (SELECT id FROM categories WHERE name = 'Electronics' AND parent_id IS NULL LIMIT 1)),
  ('Smart Watches', (SELECT id FROM categories WHERE name = 'Electronics' AND parent_id IS NULL LIMIT 1)),
  ('TVs', (SELECT id FROM categories WHERE name = 'Electronics' AND parent_id IS NULL LIMIT 1));

-- Insert sample subcategories under Computers
INSERT INTO categories (name, parent_id) VALUES
  ('Laptops', (SELECT id FROM categories WHERE name = 'Computers' AND parent_id IS NULL LIMIT 1)),
  ('Desktops', (SELECT id FROM categories WHERE name = 'Computers' AND parent_id IS NULL LIMIT 1)),
  ('Monitors', (SELECT id FROM categories WHERE name = 'Computers' AND parent_id IS NULL LIMIT 1)),
  ('Keyboards & Mice', (SELECT id FROM categories WHERE name = 'Computers' AND parent_id IS NULL LIMIT 1));

-- Insert sample subcategories under Accessories
INSERT INTO categories (name, parent_id) VALUES
  ('Chargers & Cables', (SELECT id FROM categories WHERE name = 'Accessories' AND parent_id IS NULL LIMIT 1)),
  ('Cases & Covers', (SELECT id FROM categories WHERE name = 'Accessories' AND parent_id IS NULL LIMIT 1)),
  ('Screen Protectors', (SELECT id FROM categories WHERE name = 'Accessories' AND parent_id IS NULL LIMIT 1)),
  ('Power Banks', (SELECT id FROM categories WHERE name = 'Accessories' AND parent_id IS NULL LIMIT 1));

-- Insert sample subcategories under Audio
INSERT INTO categories (name, parent_id) VALUES
  ('Headphones', (SELECT id FROM categories WHERE name = 'Audio' AND parent_id IS NULL LIMIT 1)),
  ('Earbuds', (SELECT id FROM categories WHERE name = 'Audio' AND parent_id IS NULL LIMIT 1)),
  ('Speakers', (SELECT id FROM categories WHERE name = 'Audio' AND parent_id IS NULL LIMIT 1)),
  ('Microphones', (SELECT id FROM categories WHERE name = 'Audio' AND parent_id IS NULL LIMIT 1));
```

## 🔧 Step 2: Update Products Table

Add category_id column to products table:

```sql
-- Add category_id column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Optional: Update existing products with categories
-- Update based on product names (examples)
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Smartphones' LIMIT 1)
WHERE name LIKE '%iPhone%' OR name LIKE '%Galaxy%' OR name LIKE '%Pixel%';

UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Laptops' LIMIT 1)
WHERE name LIKE '%MacBook%' OR name LIKE '%Dell%' OR name LIKE '%HP%' OR name LIKE '%Lenovo%';

UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Earbuds' LIMIT 1)
WHERE name LIKE '%AirPods%' OR name LIKE '%Buds%';
```

## ✅ Step 3: Verify Setup

Check that categories were created:

```sql
-- View all parent categories
SELECT * FROM categories WHERE parent_id IS NULL;

-- View all subcategories
SELECT 
  c.id,
  c.name as subcategory,
  p.name as parent_category
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.parent_id IS NOT NULL
ORDER BY p.name, c.name;

-- View products with their categories
SELECT 
  p.id,
  p.name as product_name,
  c.name as subcategory,
  pc.name as parent_category
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN categories pc ON c.parent_id = pc.id;
```

## 📊 Database Structure

**categories table**:
```
id          | BIGINT (Primary Key)
created_at  | TIMESTAMPTZ
name        | TEXT (Category name)
parent_id   | BIGINT (Reference to parent category, NULL for top-level)
is_active   | BOOLEAN
```

**products table** (updated):
```
id          | BIGINT
name        | TEXT
price       | NUMERIC
quantity    | INTEGER
image_url   | TEXT
category_id | BIGINT (Foreign key to categories) ← NEW
created_at  | TIMESTAMPTZ
```

## 🎯 How It Works

1. **Parent categories** have `parent_id = NULL`
2. **Subcategories** have `parent_id` pointing to their parent
3. **Products** reference the subcategory (not the parent)
4. The app will show: Parent → Subcategory in the UI

## 💡 Example Data

```
Electronics (parent)
├── Smartphones (sub)
├── Tablets (sub)
└── Smart Watches (sub)

Computers (parent)
├── Laptops (sub)
├── Desktops (sub)
└── Monitors (sub)
```

## 🔍 Useful Queries

**Get all parent categories**:
```sql
SELECT * FROM categories WHERE parent_id IS NULL AND is_active = true;
```

**Get subcategories for a specific parent**:
```sql
SELECT * FROM categories 
WHERE parent_id = [parent_id_here] AND is_active = true;
```

**Get product with full category info**:
```sql
SELECT 
  p.*,
  c.name as subcategory_name,
  pc.name as parent_category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN categories pc ON c.parent_id = pc.id;
```

---

Run the SQL commands above in your Supabase SQL Editor, then the app will work! 🚀

