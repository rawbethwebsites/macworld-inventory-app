# Supabase Setup Guide

This guide will help you set up Supabase for the Macworld Inventory System and create the products table.

## 🚀 Quick Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the details:
   - **Name**: Macworld Inventory
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest to Nigeria (e.g., Europe West)
5. Click "Create new project" (takes ~2 minutes)

### Step 2: Create the Products Table

Once your project is ready:

1. Go to **Table Editor** in the left sidebar
2. Click "Create a new table"
3. Use these settings:

**Table Name**: `products`

**Columns**:
- `id` (int8) - Primary key, auto-increment ✓
- `created_at` (timestamptz) - Default: now() ✓
- `name` (text) - Required
- `price` (numeric) - Required
- `quantity` (int4) - Required

Or use this SQL directly:

```sql
-- Go to SQL Editor and run this:

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0)
);

-- Enable Row Level Security (RLS) - IMPORTANT!
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for development)
-- WARNING: This allows anyone to read/write. Tighten this for production!

CREATE POLICY "Allow all access to products"
ON products
FOR ALL
USING (true)
WITH CHECK (true);
```

### Step 3: Get Your API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL** (starts with https://xxx.supabase.co)
   - **Project API keys**
     - `anon` / `public` key (use this one)
     - `service_role` key (keep this secret!)

### Step 4: Configure Your Frontend

1. Copy `env.example` to `.env.local`:
   ```bash
   cd frontend
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5000/api

   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here

   # Application Settings
   VITE_APP_NAME=Macworld Inventory System
   VITE_APP_VERSION=1.0.0
   ```

3. Save the file

### Step 5: Install Dependencies and Run

```bash
# If you haven't installed dependencies yet
npm install

# Start the development server
npm run dev
```

Visit http://localhost:3000 and you should see the Products page!

## 📋 Add Sample Data (Optional)

You can add some test products in the Supabase dashboard:

1. Go to **Table Editor** > **products**
2. Click "Insert row"
3. Add sample products:

```
Name: iPhone 14 Pro
Price: 850000
Quantity: 15

Name: MacBook Air M2
Price: 1200000
Quantity: 8

Name: AirPods Pro
Price: 180000
Quantity: 25
```

Or use SQL:

```sql
INSERT INTO products (name, price, quantity) VALUES
  ('iPhone 14 Pro', 850000, 15),
  ('MacBook Air M2', 1200000, 8),
  ('AirPods Pro', 180000, 25),
  ('Samsung Galaxy S23', 780000, 12),
  ('Dell XPS 15', 1100000, 6);
```

## 🔒 Security Notes

### Current Setup (Development)
The RLS policy we created allows **anyone** to read/write to the products table. This is fine for development but NOT for production!

### For Production
You should implement proper authentication and restrict access:

```sql
-- Remove the open policy
DROP POLICY "Allow all access to products" ON products;

-- Create authenticated-only policies
CREATE POLICY "Allow authenticated users to read products"
ON products FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert products"
ON products FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update products"
ON products FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete products"
ON products FOR DELETE
USING (auth.role() = 'authenticated');
```

## 🧪 Testing the Integration

Once everything is set up, test the Products page:

1. ✅ Open http://localhost:3000
2. ✅ You should see the Products Management page
3. ✅ Stats cards should show totals
4. ✅ Click "Add Product" button
5. ✅ Fill in the form and submit
6. ✅ Product should appear in the table
7. ✅ Delete a product to test deletion
8. ✅ Check Supabase dashboard to confirm changes

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists in the frontend folder
- Check that the variables start with `VITE_`
- Restart the dev server after changing env variables

### "Failed to load products: relation 'products' does not exist"
- The products table hasn't been created
- Go to Supabase SQL Editor and run the CREATE TABLE script above

### "new row violates row-level security policy"
- RLS is enabled but no policies exist
- Run the policy creation SQL from Step 2 above

### Products not showing up
- Check browser console (F12) for errors
- Check Network tab to see the Supabase API response
- Verify your API keys are correct
- Make sure RLS policies allow SELECT operations

### CORS errors
- Supabase handles CORS automatically for your project URL
- Make sure you're using the correct Project URL

## 📊 Database Schema

Current schema for the products table:

```typescript
interface Product {
  id: number                    // Auto-generated
  created_at: string           // Auto-generated timestamp
  name: string                 // Product name
  price: number                // Price in Naira
  quantity: number             // Stock quantity
}
```

## 🎯 Next Steps

Once products are working, you can:

1. **Add more tables**: invoices, customers, users
2. **Implement authentication**: Use Supabase Auth
3. **Add real-time subscriptions**: Get live updates when products change
4. **Add file upload**: Store product images in Supabase Storage
5. **Add advanced features**: Search, filters, pagination

## 📚 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## 💡 Pro Tips

1. **Use Supabase Studio**: The web interface is great for managing data during development
2. **Check the Logs**: Go to Database > Logs to see query logs and errors
3. **Use TypeScript**: Supabase can generate TypeScript types from your schema
4. **Real-time subscriptions**: Add live updates with just a few lines of code
5. **Backup regularly**: Use Database > Backups to create snapshots

---

**Happy Building! 🚀**
