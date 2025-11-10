# 🔐 Authentication & Admin Roles Setup Guide

Complete guide to set up authentication and role-based access control for Macworld Inventory System.

---

## 📋 Quick Setup Steps

### Step 1: Run the SQL Script

1. **Open Supabase Dashboard**: Go to https://supabase.com/dashboard
2. **Navigate to SQL Editor**: Click "SQL Editor" in the left sidebar
3. **Open the SQL file**: Find `AUTH_DATABASE_SETUP.sql` in your project root
4. **Copy the entire SQL script**
5. **Paste it into Supabase SQL Editor**
6. **Click "RUN"** button
7. **Wait for "Success" message**

The script will create:
- ✅ `user_profiles` table (extends Supabase auth.users)
- ✅ Row Level Security policies
- ✅ Automatic profile creation trigger
- ✅ Role-based access policies

### Step 2: Enable Email Authentication

1. **Go to Supabase Dashboard** → Your Project
2. **Click "Authentication"** in the left sidebar
3. **Click "Providers"** tab
4. **Enable "Email"** provider
5. **Configure email settings** (optional):
   - Enable "Confirm email" if you want email verification
   - Set up email templates (optional)

### Step 3: Create Your First Admin User

**Option A: Create via Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click **"Add user"** or **"Invite user"**
3. Enter email and password
4. Click **"Create user"**
5. Go to **SQL Editor** and run:
```sql
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

**Option B: Sign Up via Login Page**
1. Go to your app: http://localhost:3000/login
2. Click **"Create an account"**
3. Fill in name, email, password
4. Click **"Create account"**
5. Go to **SQL Editor** and run:
```sql
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Step 4: Test Login

1. **Refresh your browser** at http://localhost:3000
2. You should be redirected to `/login`
3. **Enter your credentials**
4. **Click "Sign in"**
5. You should be logged in and see the dashboard!

---

## 🎯 Features Overview

### ✅ Authentication
- Email/password login
- User registration
- Session management
- Automatic logout on token expiry
- Protected routes

### ✅ Role-Based Access Control
- **Admin**: Full access to everything
- **Staff**: Access to most features (can be customized)
- **User**: Basic access (can be customized)

### ✅ User Management
- User profiles with roles
- Last login tracking
- Active/inactive status
- Profile updates

### ✅ Security
- Row Level Security (RLS) policies
- Secure password hashing (Supabase handles this)
- Protected API routes
- Session management

---

## 👥 User Roles

### Admin Role
- **Full access** to all features
- Can manage users
- Can access admin-only features
- Yellow "ADMIN" badge in navbar

### Staff Role
- Access to most features
- Can be customized per feature
- No admin privileges

### User Role (Default)
- Basic access
- Can be customized per feature
- Standard user permissions

---

## 🔧 How to Change User Roles

### Make a User Admin:
```sql
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

### Make a User Staff:
```sql
UPDATE public.user_profiles 
SET role = 'staff' 
WHERE email = 'user@example.com';
```

### Make a User Regular:
```sql
UPDATE public.user_profiles 
SET role = 'user' 
WHERE email = 'user@example.com';
```

---

## 📊 Database Schema

### user_profiles Table
```sql
user_profiles
├─ id (UUID → auth.users)
├─ created_at (TIMESTAMPTZ)
├─ updated_at (TIMESTAMPTZ)
├─ email (TEXT UNIQUE)
├─ full_name (TEXT)
├─ role (TEXT: 'admin', 'user', 'staff')
├─ is_active (BOOLEAN)
├─ phone (TEXT)
└─ last_login (TIMESTAMPTZ)
```

---

## 🚀 Using Authentication in Your Code

### Check if User is Authenticated
```javascript
import { useAuth } from '../hooks/useAuth'

function MyComponent() {
  const { isAuthenticated, user, userProfile } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return <div>Welcome, {userProfile.full_name}!</div>
}
```

### Check User Role
```javascript
import { useAuth } from '../hooks/useAuth'

function MyComponent() {
  const { isAdmin, isStaff, hasRole } = useAuth()
  
  if (isAdmin()) {
    return <div>Admin Panel</div>
  }
  
  if (isStaff()) {
    return <div>Staff Panel</div>
  }
  
  return <div>User Panel</div>
}
```

### Protect Routes
```javascript
import ProtectedRoute from './components/ProtectedRoute'

<Route
  path="/admin"
  element={
    <ProtectedRoute requireAdmin={true}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### Logout
```javascript
import { useAuth } from '../hooks/useAuth'

function LogoutButton() {
  const { logout } = useAuth()
  
  return (
    <button onClick={logout}>
      Sign Out
    </button>
  )
}
```

---

## 🎨 UI Features

### Login Page
- Beautiful gradient background
- Email/password login
- Sign up option
- Remember me checkbox
- Forgot password link (placeholder)
- Error/success messages

### Navbar
- User profile dropdown
- Welcome message with name
- Admin badge (yellow)
- Sign out button
- User menu with profile info

### Protected Routes
- Automatic redirect to login
- Loading states
- Access denied messages for unauthorized users

---

## 🔐 Security Features

### Row Level Security (RLS)
- Users can only see their own profile
- Admins can see all profiles
- Policies enforce data access

### Password Security
- Supabase handles password hashing
- Minimum 6 characters required
- Secure password storage

### Session Management
- Automatic session refresh
- Token-based authentication
- Secure cookie handling

---

## 🐛 Troubleshooting

### Problem: "Failed to load user profile"
**Solution**: 
1. Check if `user_profiles` table exists
2. Verify RLS policies are created
3. Check browser console for errors

### Problem: "Cannot create user"
**Solution**:
1. Enable Email provider in Supabase
2. Check email confirmation settings
3. Verify trigger is created

### Problem: "Access denied" when logged in
**Solution**:
1. Check user role in database
2. Verify RLS policies
3. Check if user is active

### Problem: Can't see admin badge
**Solution**:
1. Verify role is set to 'admin' in database
2. Refresh page after role change
3. Check userProfile in browser console

### Problem: Redirect loop
**Solution**:
1. Clear browser cache
2. Clear localStorage
3. Check AuthContext loading state

---

## 📝 Creating Multiple Users

### Via Login Page (Recommended)
1. Go to `/login`
2. Click "Create an account"
3. Fill in details
4. Create account
5. Update role in database if needed

### Via Supabase Dashboard
1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Create user
5. Update role in SQL Editor

---

## 🎯 Role-Based Features (Future)

You can add role-based features like:

```javascript
// In any component
const { isAdmin, isStaff } = useAuth()

{isAdmin() && (
  <button>Delete All</button>
)}

{isStaff() && (
  <button>Edit Product</button>
)}
```

---

## ✅ Checklist

After setup, verify:
- [ ] SQL script ran successfully
- [ ] Email provider enabled in Supabase
- [ ] First admin user created
- [ ] Can log in successfully
- [ ] Admin badge appears in navbar
- [ ] Can access protected routes
- [ ] Can log out
- [ ] User menu works
- [ ] Role changes reflect in UI

---

## 🎉 Success!

Your authentication system is now ready! 

**Next Steps:**
1. Create your admin account
2. Test login/logout
3. Create additional users
4. Customize role-based features
5. Add admin-only pages if needed

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase dashboard settings
3. Check RLS policies
4. Verify user_profiles table exists
5. Check trigger functions

---

**Happy authenticating! 🔐**

