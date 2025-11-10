# Products Management Page

A fully functional Products management page built with React and Supabase.

## ✨ Features

- ✅ **Real-time Product List** - Fetches and displays all products from Supabase
- ✅ **Loading Skeleton** - Shows animated skeleton while data is loading
- ✅ **Add New Products** - Form to add products with validation
- ✅ **Delete Products** - Remove products with confirmation dialog
- ✅ **Statistics Dashboard** - Shows total products, stock, and inventory value
- ✅ **Stock Status Badges** - Visual indicators (In Stock, Low Stock, Out of Stock)
- ✅ **Error Handling** - Displays user-friendly error messages
- ✅ **Success Notifications** - Auto-dismissing success messages
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Empty State** - Friendly message when no products exist

## 🎨 UI Components

### Statistics Cards
- **Total Products**: Count of all products
- **Total Stock**: Sum of all quantities
- **Total Value**: Combined value of all inventory (price × quantity)

### Product Table
Displays products with:
- Product name
- Price (formatted in Nigerian Naira ₦)
- Quantity in stock
- Total value per product
- Stock status badge
- Delete action button

### Add Product Form
Fields:
- **Product Name** (required) - Text input
- **Price** (required) - Number input with decimal support
- **Quantity** (required) - Integer input

Validation:
- Name must not be empty
- Price must be greater than 0
- Quantity must be 0 or greater

## 🚀 Getting Started

### 1. Set up Supabase

Follow the [SUPABASE_SETUP.md](../SUPABASE_SETUP.md) guide to:
- Create a Supabase project
- Create the products table
- Get your API keys

### 2. Configure Environment Variables

Create `.env.local` in the frontend directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install Dependencies

```bash
npm install
```

The following packages are required:
- `@supabase/supabase-js` - Supabase client
- `react` & `react-dom` - React framework
- `react-router-dom` - Routing

### 4. Run the App

```bash
npm run dev
```

Open http://localhost:3000 to see the Products page.

## 📁 File Structure

```
frontend/src/
├── pages/
│   └── Products.jsx          # Main Products management page
├── utils/
│   └── supabase.js           # Supabase client configuration
└── App.jsx                   # Updated with Products route
```

## 🔧 How It Works

### Supabase Client

```javascript
// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Fetching Products

```javascript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .order('created_at', { ascending: false })
```

### Adding a Product

```javascript
const { data, error } = await supabase
  .from('products')
  .insert([{ name, price, quantity }])
  .select()
```

### Deleting a Product

```javascript
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId)
```

## 🎯 Key Features Explained

### Loading State
- Shows animated skeleton while fetching data
- Prevents layout shift when data loads
- Provides better UX

### Notifications
- Auto-dismiss after 5 seconds
- Can be manually closed
- Color-coded: green (success), red (error), blue (info)

### Form Validation
- Client-side validation before submission
- Shows error messages below each field
- Prevents invalid data submission

### Stock Status
- **In Stock** (green) - Quantity ≥ 10
- **Low Stock** (yellow) - Quantity 1-9
- **Out of Stock** (red) - Quantity = 0

### Empty State
- Friendly message when no products exist
- Call-to-action button to add first product
- Icon for visual appeal

## 🔒 Security Considerations

### Current Setup (Development)
The page uses Supabase's anon/public key which is safe to expose in frontend code.

### Row Level Security (RLS)
Make sure to enable RLS policies on your products table:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow all operations (development only)
CREATE POLICY "Allow all access to products"
ON products FOR ALL
USING (true)
WITH CHECK (true);
```

### Production
For production, implement proper authentication:
- Use Supabase Auth
- Create policies that check auth.role()
- Restrict access based on user roles

## 🐛 Troubleshooting

### Products not loading
1. Check browser console for errors
2. Verify Supabase URL and key in `.env.local`
3. Check that the products table exists
4. Verify RLS policies allow SELECT

### Can't add products
1. Check form validation errors
2. Verify RLS policies allow INSERT
3. Check database constraints
4. Look at Network tab in DevTools

### Delete not working
1. Verify RLS policies allow DELETE
2. Check browser console for errors
3. Confirm product ID is correct

## 📊 Database Schema

Required table structure:

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0)
);
```

## 🚀 Next Steps

### Enhancements to Add
1. **Edit Products** - Update existing products
2. **Search & Filter** - Find products quickly
3. **Pagination** - Handle large product lists
4. **Sorting** - Sort by name, price, quantity
5. **Product Images** - Upload and display images
6. **Categories** - Organize products by category
7. **Bulk Actions** - Delete or update multiple products
8. **Export** - Download products as CSV
9. **Real-time Updates** - See changes from other users instantly
10. **Stock History** - Track stock level changes over time

### Example: Add Real-time Subscriptions

```javascript
useEffect(() => {
  const subscription = supabase
    .channel('products')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' },
      (payload) => {
        console.log('Change received!', payload)
        fetchProducts() // Refresh the list
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

## 💡 Tips

1. **Use Supabase Studio** for quick data management during development
2. **Check the Network tab** in DevTools to see API requests/responses
3. **Enable source maps** in Vite for easier debugging
4. **Use React DevTools** to inspect component state
5. **Test RLS policies** in Supabase SQL Editor before deploying

## 📚 Resources

- [Supabase JavaScript Docs](https://supabase.com/docs/reference/javascript)
- [React Hooks Documentation](https://react.dev/reference/react)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Built with ❤️ for Macworld Inventory System**

