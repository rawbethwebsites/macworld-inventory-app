# Supabase Quick Reference Card

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Create .env file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Import and Use
```javascript
import { supabase } from './utils/supabase'
import { useInventory } from './hooks/useSupabase'
import { AuthContext } from './context/AuthContext'
```

---

## 🔐 Authentication

### Sign Up
```javascript
import { useContext } from 'react'
import { AuthContext } from './context/AuthContext'

const { register } = useContext(AuthContext)
const result = await register(email, password, { display_name: 'John' })
```

### Sign In
```javascript
const { login } = useContext(AuthContext)
const result = await login(email, password)
```

### Sign Out
```javascript
const { logout } = useContext(AuthContext)
await logout()
```

### Check Auth Status
```javascript
const { user, isAuthenticated, loading } = useContext(AuthContext)
```

---

## 📊 Database Operations

### Fetch All Records
```javascript
const { data, error } = await supabase
  .from('inventory')
  .select('*')
```

### Fetch with Filter
```javascript
const { data, error } = await supabase
  .from('inventory')
  .select('*')
  .eq('category', 'Electronics')
  .gte('quantity', 10)
```

### Fetch Single Record
```javascript
const { data, error } = await supabase
  .from('inventory')
  .select('*')
  .eq('id', itemId)
  .single()
```

### Insert Record
```javascript
const { data, error } = await supabase
  .from('inventory')
  .insert([{ name: 'Item', quantity: 10 }])
  .select()
```

### Update Record
```javascript
const { data, error } = await supabase
  .from('inventory')
  .update({ quantity: 15 })
  .eq('id', itemId)
  .select()
```

### Delete Record
```javascript
const { error } = await supabase
  .from('inventory')
  .delete()
  .eq('id', itemId)
```

---

## 🎣 Using Hooks

### Simple Query
```javascript
import { useSupabaseQuery } from './hooks/useSupabase'

const { data, loading, error } = useSupabaseQuery('inventory')
```

### With Options
```javascript
const { data, loading, error } = useSupabaseQuery('inventory', {
  filter: { category: 'Electronics' },
  orderBy: 'created_at',
  ascending: false,
  limit: 10
})
```

### CRUD Operations
```javascript
const { create, update, remove } = useSupabaseMutation('inventory')

// Create
await create({ name: 'Item', quantity: 10 })

// Update
await update(id, { quantity: 15 })

// Delete
await remove(id)
```

### Real-time Updates
```javascript
useSupabaseSubscription('inventory', {
  onInsert: (item) => console.log('New:', item),
  onUpdate: (item) => console.log('Updated:', item),
  onDelete: (item) => console.log('Deleted:', item)
})
```

### Complete Inventory Hook
```javascript
const { items, loading, addItem, updateItem, deleteItem } = useInventory()
```

---

## 🔍 Query Filters

```javascript
// Equal
.eq('status', 'active')

// Not equal
.neq('status', 'deleted')

// Greater than
.gt('quantity', 10)

// Greater than or equal
.gte('quantity', 10)

// Less than
.lt('quantity', 100)

// Less than or equal
.lte('quantity', 100)

// Like (case-sensitive)
.like('name', '%MacBook%')

// iLike (case-insensitive)
.ilike('name', '%macbook%')

// In array
.in('category', ['Electronics', 'Laptops'])

// Is null
.is('deleted_at', null)

// Multiple conditions (AND)
.eq('category', 'Electronics')
.gte('quantity', 10)

// OR conditions
.or('quantity.lt.10,status.eq.discontinued')
```

---

## 📄 Advanced Queries

### Ordering
```javascript
.order('created_at', { ascending: false })
.order('name', { ascending: true })
```

### Limiting
```javascript
.limit(10)
```

### Range/Pagination
```javascript
.range(0, 9)   // First 10 items
.range(10, 19) // Next 10 items
```

### Count
```javascript
const { count } = await supabase
  .from('inventory')
  .select('*', { count: 'exact', head: true })
```

### Search Multiple Columns
```javascript
.or('name.ilike.%search%,description.ilike.%search%')
```

### Joins (Related Tables)
```javascript
const { data } = await supabase
  .from('inventory')
  .select(`
    *,
    category:categories(name, description)
  `)
```

---

## 🔴 Real-time

### Basic Subscription
```javascript
const subscription = supabase
  .channel('my_channel')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'inventory' },
    (payload) => console.log(payload)
  )
  .subscribe()

// Clean up
subscription.unsubscribe()
```

### Specific Events
```javascript
.on('postgres_changes', 
  { event: 'INSERT', schema: 'public', table: 'inventory' },
  handleInsert
)
.on('postgres_changes', 
  { event: 'UPDATE', schema: 'public', table: 'inventory' },
  handleUpdate
)
.on('postgres_changes', 
  { event: 'DELETE', schema: 'public', table: 'inventory' },
  handleDelete
)
```

---

## 📁 File Storage

### Upload File
```javascript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload('path/filename.jpg', file)
```

### Download File
```javascript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .download('path/filename.jpg')
```

### Get Public URL
```javascript
const { data } = supabase.storage
  .from('bucket-name')
  .getPublicUrl('path/filename.jpg')

const url = data.publicUrl
```

### Delete File
```javascript
const { error } = await supabase.storage
  .from('bucket-name')
  .remove(['path/filename.jpg'])
```

---

## 🔒 Row Level Security (RLS)

### Enable RLS
```sql
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
```

### View Own Data
```sql
CREATE POLICY "Users view own data"
ON inventory FOR SELECT
USING (auth.uid() = user_id);
```

### Insert Own Data
```sql
CREATE POLICY "Users insert own data"
ON inventory FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Update Own Data
```sql
CREATE POLICY "Users update own data"
ON inventory FOR UPDATE
USING (auth.uid() = user_id);
```

### Delete Own Data
```sql
CREATE POLICY "Users delete own data"
ON inventory FOR DELETE
USING (auth.uid() = user_id);
```

---

## 🛠️ Helper Functions

### Get Current User
```javascript
const { data: { user } } = await supabase.auth.getUser()
```

### Get Session
```javascript
const { data: { session } } = await supabase.auth.getSession()
```

### Get Access Token
```javascript
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

---

## 🐛 Common Issues

### "Missing Supabase credentials"
✅ Check `.env` file exists  
✅ Restart dev server  
✅ Verify variable names start with `VITE_`

### "Row Level Security policy violation"
✅ Check RLS policies in Supabase dashboard  
✅ Ensure user is authenticated  
✅ Verify `user_id` is set correctly

### Real-time not working
✅ Enable Realtime in Supabase for the table  
✅ Check RLS policies allow subscriptions  
✅ Verify table name is correct

### CORS errors
✅ Check Supabase URL is correct  
✅ Verify project is active in Supabase

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `.env` | Environment variables (not in git) |
| `src/utils/supabase.js` | Supabase client & auth functions |
| `src/utils/supabaseDb.js` | Database operation helpers |
| `src/hooks/useSupabase.js` | React hooks for Supabase |
| `src/context/AuthContext.jsx` | Authentication context |
| `src/components/AuthExample.jsx` | Auth UI example |
| `src/components/InventoryExample.jsx` | Database UI example |
| `SUPABASE_SETUP.md` | Full setup documentation |
| `HOOKS_GUIDE.md` | Detailed hooks guide |

---

## 🎯 Common Patterns

### Authenticated Query
```javascript
const { data: { user } } = await supabase.auth.getUser()

const { data } = await supabase
  .from('inventory')
  .select('*')
  .eq('user_id', user.id)
```

### Transaction-like Operations
```javascript
const { data: item, error: insertError } = await supabase
  .from('inventory')
  .insert([{ name: 'Item' }])
  .select()
  .single()

if (!insertError && item) {
  await supabase
    .from('inventory_log')
    .insert([{ item_id: item.id, action: 'created' }])
}
```

### Conditional Update
```javascript
const { data } = await supabase
  .from('inventory')
  .update({ quantity: 0 })
  .lt('quantity', 5)
  .select()
```

---

## 💡 Tips

1. Always check for errors: `if (error) console.error(error)`
2. Use `.select()` after insert/update to get the result
3. Use `.single()` when expecting one result
4. Indexes speed up queries on filtered columns
5. Test RLS policies thoroughly before production
6. Use environment variables for all config
7. Enable email confirmations in production
8. Monitor usage in Supabase dashboard

---

## 🔗 Quick Links

- **Supabase Dashboard**: https://app.supabase.com
- **Your Project**: https://app.supabase.com/project/ngluohuaitkwqhrsysnk
- **JS Client Docs**: https://supabase.com/docs/reference/javascript
- **SQL Editor**: https://app.supabase.com/project/ngluohuaitkwqhrsysnk/editor

---

**Need more help?** Check `SUPABASE_SETUP.md` and `HOOKS_GUIDE.md` for detailed guides!

