# Migration Guide: Old Auth → Supabase

This guide helps you migrate from the old authentication system to Supabase.

## 🔄 What Changed

### Before (Old System)
```javascript
// Used axios with custom backend API
import axios from 'axios'

const response = await axios.post('/api/auth/login', { email, password })
const { token, user } = response.data
localStorage.setItem('token', token)
```

### After (Supabase)
```javascript
// Uses Supabase with built-in session management
import { useContext } from 'react'
import { AuthContext } from './context/AuthContext'

const { login } = useContext(AuthContext)
const result = await login(email, password)
// Session is managed automatically!
```

## 📋 Migration Checklist

### 1. Update AuthContext Usage

**Before:**
```javascript
const { user, token, loading, login, logout, isAuthenticated } = useContext(AuthContext)
```

**After:**
```javascript
const { user, session, loading, login, logout, register, isAuthenticated } = useContext(AuthContext)
```

**Changes:**
- ✅ `token` → `session` (contains more info including the token)
- ✅ New `register` method added
- ✅ `user` object structure changed to Supabase format

### 2. Update Login Components

**Before:**
```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await axios.post('/api/auth/login', { email, password })
    localStorage.setItem('token', response.data.token)
    navigate('/dashboard')
  } catch (error) {
    alert('Login failed')
  }
}
```

**After:**
```javascript
const { login } = useContext(AuthContext)

const handleLogin = async (email, password) => {
  const result = await login(email, password)
  
  if (result.success) {
    navigate('/dashboard')
  } else {
    alert(result.message)
  }
}
```

### 3. Update Registration Components

**Before (if you had registration):**
```javascript
const response = await axios.post('/api/auth/register', { email, password })
```

**After:**
```javascript
const { register } = useContext(AuthContext)

const result = await register(email, password, {
  // Optional metadata
  display_name: name,
  phone: phone
})
```

### 4. Update Logout

**Before:**
```javascript
const handleLogout = () => {
  localStorage.removeItem('token')
  navigate('/login')
}
```

**After:**
```javascript
const { logout } = useContext(AuthContext)

const handleLogout = async () => {
  const result = await logout()
  if (result.success) {
    navigate('/login')
  }
}
```

### 5. Update Protected Routes

**Before (if using manual token check):**
```javascript
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/login" />
  }
  
  return children
}
```

**After:**
```javascript
import { useContext } from 'react'
import { AuthContext } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext)
  
  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" />
  
  return children
}
```

### 6. Update User Information Display

**Before:**
```javascript
// User object from custom backend
{
  id: 123,
  email: "user@example.com",
  name: "John Doe",
  role: "admin"
}
```

**After:**
```javascript
// User object from Supabase
{
  id: "uuid-string",
  email: "user@example.com",
  user_metadata: {
    display_name: "John Doe"
  },
  created_at: "2024-01-01T00:00:00Z",
  // ... more Supabase fields
}
```

**Update your code:**
```javascript
// Before
<p>{user.name}</p>

// After
<p>{user.user_metadata?.display_name || user.email}</p>
```

### 7. Update API Calls with Authentication

**Before:**
```javascript
import api from './utils/api' // Axios with interceptor

const response = await api.get('/inventory')
// Token automatically added by interceptor
```

**After (if keeping your backend):**
```javascript
import api from './utils/api'
import { supabase } from './utils/supabase'

// Get Supabase token
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token

// Send to backend
const response = await api.get('/inventory', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

**Better approach (migrate to Supabase database):**
```javascript
import { supabase } from './utils/supabase'

const { data, error } = await supabase
  .from('inventory')
  .select('*')
```

## 🔧 Updating Specific Components

### Login Page

**Find and Replace:**

1. Find: `import axios from 'axios'`
   Replace with: `import { useContext } from 'react'\nimport { AuthContext } from '../context/AuthContext'`

2. Find: `axios.post('/api/auth/login'`
   Replace with: `login(email, password)`

3. Find: `localStorage.setItem('token'`
   Remove: Session is managed automatically

### Registration Page

1. Add to imports: `const { register } = useContext(AuthContext)`

2. Replace registration logic:
   ```javascript
   const result = await register(email, password, {
     display_name: name // optional metadata
   })
   ```

### User Profile Components

1. Update user data access:
   ```javascript
   // Before
   user.name
   user.role
   
   // After
   user.email
   user.user_metadata?.display_name
   user.created_at
   ```

## 🗄️ Database Migration (Optional)

If you want to migrate from your backend API to Supabase database:

### Step 1: Export Current Data

```javascript
// Export from your old database
const response = await axios.get('/api/inventory/export')
const oldData = response.data
```

### Step 2: Create Tables in Supabase

See `GETTING_STARTED_CHECKLIST.md` for SQL examples.

### Step 3: Import Data

```javascript
import { supabase } from './utils/supabase'

// Import data in batches
const batchSize = 100
for (let i = 0; i < oldData.length; i += batchSize) {
  const batch = oldData.slice(i, i + batchSize)
  
  const { error } = await supabase
    .from('inventory')
    .insert(batch.map(item => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      category: item.category,
      user_id: item.userId // Map to new user IDs
    })))
  
  if (error) console.error('Import error:', error)
}
```

### Step 4: Update Components

Replace all API calls:

```javascript
// Before
const response = await api.get('/inventory')
setItems(response.data)

// After
import { useInventory } from './hooks/useSupabase'

const { items, loading, error } = useInventory()
// No need to manage state manually!
```

## 🔑 Environment Variables

Make sure your `.env` file has both old and new variables during migration:

```env
# Old backend API (keep during migration)
VITE_API_URL=http://localhost:5000/api

# New Supabase (add these)
VITE_SUPABASE_URL=https://ngluohuaitkwqhrsysnk.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

## 🚨 Breaking Changes

### Token Storage
- **Before**: Manual `localStorage.setItem('token', ...)`
- **After**: Automatic session management
- **Action**: Remove all `localStorage` token operations

### User Object Structure
- **Before**: Custom user object from your backend
- **After**: Supabase user object
- **Action**: Update all references to `user.name`, `user.role`, etc.

### Error Handling
- **Before**: Axios errors with `error.response.data.message`
- **After**: Supabase errors with `error.message`
- **Action**: Update error handling code

### Session Persistence
- **Before**: Manual token refresh needed
- **After**: Automatic token refresh
- **Action**: Remove token refresh logic

## ✅ Testing Your Migration

### 1. Test Authentication Flow
- [ ] Can users register?
- [ ] Can users login?
- [ ] Does session persist on page reload?
- [ ] Does logout work correctly?
- [ ] Are protected routes working?

### 2. Test Data Access
- [ ] Can users see their data?
- [ ] Can users create data?
- [ ] Can users update data?
- [ ] Can users delete data?
- [ ] Can users only see their own data? (RLS check)

### 3. Test Edge Cases
- [ ] Invalid login credentials
- [ ] Expired session handling
- [ ] Network errors
- [ ] Concurrent sessions

## 🐛 Common Migration Issues

### Issue: "User is null after login"
**Cause**: Auth state not updating
**Solution**: Ensure AuthContext is wrapping your app properly

### Issue: "Can't access database"
**Cause**: Row Level Security blocking access
**Solution**: Check RLS policies in Supabase dashboard

### Issue: "Token undefined"
**Cause**: Trying to access old token format
**Solution**: Use `session?.access_token` instead

### Issue: "User data missing"
**Cause**: Different user object structure
**Solution**: Update all user property access

## 📊 Comparison Table

| Feature | Old System | Supabase |
|---------|-----------|----------|
| Auth Method | Custom Backend | Supabase Auth |
| Token Storage | localStorage | Automatic |
| Session Management | Manual | Automatic |
| Token Refresh | Manual | Automatic |
| Password Reset | Custom | Built-in |
| Email Verification | Custom | Built-in |
| User Metadata | Custom | user_metadata |
| Real-time Updates | WebSocket/Polling | Built-in |
| File Storage | Custom | Supabase Storage |

## 🎯 Rollback Plan

If you need to rollback:

1. **Keep old code commented:**
   ```javascript
   // Old implementation (backup)
   // const handleLogin = async () => { ... }
   
   // New Supabase implementation
   const handleLogin = async () => { ... }
   ```

2. **Keep old dependencies:**
   Don't remove old auth packages immediately

3. **Test thoroughly:**
   Keep both systems running in parallel initially

## 💡 Best Practices

1. **Migrate gradually**: Start with auth, then move to database
2. **Test thoroughly**: Use the checklist above
3. **Keep backups**: Export all data before migration
4. **Monitor errors**: Check Supabase logs regularly
5. **Update documentation**: Document any custom implementations

## 📚 Additional Resources

- [AuthContext.jsx](./src/context/AuthContext.jsx) - Updated implementation
- [AuthExample.jsx](./src/components/AuthExample.jsx) - Example usage
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Complete setup guide
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

## 🆘 Getting Help

If you encounter issues:

1. Check browser console for errors
2. Review Supabase dashboard logs
3. Check this migration guide
4. Refer to `TROUBLESHOOTING.md` (if available)
5. Check Supabase Discord/GitHub

---

**Migration Progress Tracker:**

- [ ] Updated AuthContext usage
- [ ] Migrated login components
- [ ] Migrated registration components
- [ ] Updated protected routes
- [ ] Updated user information display
- [ ] Tested authentication flow
- [ ] Verified RLS policies
- [ ] Tested all CRUD operations
- [ ] Updated error handling
- [ ] Removed old auth code
- [ ] Documentation updated

Good luck with your migration! 🚀

