# Supabase Integration Setup

This document describes the Supabase integration in the Macworld Inventory App frontend.

## Overview

The application now uses Supabase for authentication and can be extended to use it for database operations and real-time features.

## Environment Setup

### Required Environment Variables

Create a `.env` file in the frontend root directory with the following variables:

```env
VITE_SUPABASE_URL=https://ngluohuaitkwqhrsysnk.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

⚠️ **Important**: The `.env` file should never be committed to version control. It's already included in `.gitignore`.

## Files Created/Modified

### 1. `/src/utils/supabase.js`
This is the main Supabase client configuration file. It exports:

- `supabase` - The main Supabase client instance
- `signUp()` - Register a new user
- `signIn()` - Sign in an existing user
- `signOut()` - Sign out the current user
- `getCurrentUser()` - Get the currently authenticated user
- `getSession()` - Get the current session
- `resetPassword()` - Send password reset email
- `updatePassword()` - Update user password
- `onAuthStateChange()` - Listen to authentication state changes

### 2. `/src/context/AuthContext.jsx`
Updated to use Supabase authentication instead of custom API endpoints.

**New features:**
- Automatic session management
- Real-time auth state changes
- `register()` method for user registration
- Better error handling

**Context values:**
```javascript
{
  user,           // Current user object from Supabase
  session,        // Current session object
  loading,        // Loading state
  login,          // Login function
  logout,         // Logout function
  register,       // Register function (new)
  isAuthenticated // Boolean indicating if user is logged in
}
```

## Usage Examples

### Using Authentication in Components

```javascript
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

function LoginComponent() {
  const { login, loading, isAuthenticated } = useContext(AuthContext)

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    
    if (result.success) {
      console.log('Login successful!')
    } else {
      console.error(result.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (isAuthenticated) return <div>Already logged in</div>

  return (
    <form onSubmit={handleLogin}>
      {/* Your form fields */}
    </form>
  )
}
```

### Using the Supabase Client Directly

```javascript
import { supabase } from '../utils/supabase'

// Example: Query data from a table
async function fetchInventory() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching inventory:', error)
    return []
  }

  return data
}

// Example: Insert data
async function addInventoryItem(item) {
  const { data, error } = await supabase
    .from('inventory')
    .insert([item])
    .select()

  if (error) {
    console.error('Error adding item:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

// Example: Update data
async function updateInventoryItem(id, updates) {
  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating item:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

// Example: Delete data
async function deleteInventoryItem(id) {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting item:', error)
    return { success: false, error }
  }

  return { success: true }
}
```

### Real-time Subscriptions

```javascript
import { supabase } from '../utils/supabase'
import { useEffect, useState } from 'react'

function InventoryList() {
  const [items, setItems] = useState([])

  useEffect(() => {
    // Fetch initial data
    fetchItems()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('inventory_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'inventory' }, 
        (payload) => {
          console.log('Change received!', payload)
          // Handle INSERT, UPDATE, DELETE events
          if (payload.eventType === 'INSERT') {
            setItems(prev => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new : item
            ))
          } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(item => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchItems() {
    const { data } = await supabase.from('inventory').select('*')
    setItems(data || [])
  }

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

## Authentication Flow

1. **Sign Up**: New users can register using email/password
2. **Email Verification**: Supabase can be configured to send verification emails
3. **Sign In**: Users authenticate with email/password
4. **Session Management**: Sessions are automatically managed and persisted
5. **Token Refresh**: Access tokens are automatically refreshed
6. **Sign Out**: Clears the session and user state

## Security Notes

1. **Row Level Security (RLS)**: Remember to enable RLS policies in your Supabase database
2. **Environment Variables**: Never commit `.env` files or expose API keys
3. **Anon Key**: The anon key is safe to use in the frontend but should be combined with RLS
4. **Service Role Key**: Never use the service role key in frontend code

## Supabase Dashboard

Access your Supabase project dashboard at:
https://app.supabase.com/project/ngluohuaitkwqhrsysnk

From here you can:
- Manage authentication settings
- Create and manage database tables
- Set up Row Level Security policies
- View logs and analytics
- Manage API keys
- Configure email templates

## Migration from Custom Backend

If you're migrating from a custom backend API to Supabase:

1. **Database Migration**: Export your data and import it into Supabase
2. **API Endpoints**: Replace API calls with Supabase client methods
3. **Authentication**: The AuthContext has been updated to use Supabase
4. **File Storage**: Use Supabase Storage for file uploads
5. **Real-time**: Add real-time subscriptions where needed

## Troubleshooting

### Common Issues

1. **"Missing Supabase credentials" error**
   - Make sure your `.env` file exists and contains the correct variables
   - Restart the development server after creating/updating `.env`

2. **Authentication not working**
   - Check that email confirmation is properly configured in Supabase
   - Verify that the URL and anon key are correct
   - Check browser console for detailed error messages

3. **Database queries failing**
   - Ensure RLS policies are set up correctly
   - Verify that the user has the correct permissions
   - Check the table and column names match your queries

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Authentication Guide](https://supabase.com/docs/guides/auth)
- [Database Guide](https://supabase.com/docs/guides/database)
- [Real-time Guide](https://supabase.com/docs/guides/realtime)

