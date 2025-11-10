# ⚙️ Admin Panel Setup Guide

Complete guide to set up the Admin Panel for managing user roles and permissions.

---

## 📋 Quick Setup Steps

### Step 1: Run the SQL Script

1. **Open Supabase Dashboard**: Go to https://supabase.com/dashboard
2. **Navigate to SQL Editor**: Click "SQL Editor" in the left sidebar
3. **Open the SQL file**: Find `ADMIN_ROLES_SETUP.sql` in your project root
4. **Copy the entire SQL script**
5. **Paste it into Supabase SQL Editor**
6. **Click "RUN"** button
7. **Wait for "Success" message**

The script will create:
- ✅ `roles` table with 5 initial roles
- ✅ `role_id` column in `user_profiles`
- ✅ Migrates existing users to use role_id
- ✅ `permissions` and `role_permissions` tables (for future use)
- ✅ RLS policies for admin-only access

### Step 2: Verify Setup

Run this in SQL Editor to check:

```sql
-- Check roles were created
SELECT * FROM public.roles ORDER BY id;

-- Check users have role_id
SELECT email, role_id, (SELECT name FROM roles WHERE id = user_profiles.role_id) as role_name
FROM public.user_profiles
LIMIT 10;
```

### Step 3: Access Admin Panel

1. **Log in as admin** at http://localhost:3000/login
2. **Click "Admin" (⚙️)** in the navigation menu
3. You should see the Admin Panel!

---

## 🎯 Features Overview

### ✅ Roles Management
- View all roles in a table
- Add new custom roles
- Edit role names and descriptions
- Delete custom roles (system roles protected)
- See role type (System vs Custom)
- See role status (Active/Inactive)

### ✅ Users Management
- View all users with their roles
- Add new users
- Edit user information
- Change user roles (dropdown in table)
- Activate/deactivate users
- See user status and creation date

### ✅ Security
- Only Admin role can access
- Protected routes
- RLS policies enforce access
- System roles cannot be deleted

---

## 👥 Initial Roles Created

1. **Admin** (System Role)
   - Full system access
   - Can manage users and roles
   - Cannot be deleted

2. **Staff** (Custom Role)
   - General staff access
   - Can be customized

3. **Inventory Manager** (Custom Role)
   - Can manage products, categories, inventory
   - Can be customized

4. **Accountant** (Custom Role)
   - Can manage invoices, customers, financial data
   - Can be customized

5. **Viewer** (Custom Role)
   - Read-only access
   - Default role for new users

---

## 🚀 How to Use

### Managing Roles

**View Roles:**
1. Go to Admin Panel
2. Click "Roles" tab
3. See all roles in table

**Add New Role:**
1. Click "Add Role" button
2. Enter role name (required)
3. Enter description (optional)
4. Click "Create Role"

**Edit Role:**
1. Click edit icon (pencil) next to role
2. Modify name/description
3. Click "Update Role"
4. Note: System roles cannot have name changed

**Delete Role:**
1. Click delete icon (trash) next to role
2. Confirm deletion
3. Users with this role will be assigned "Viewer" role
4. Note: System roles cannot be deleted

### Managing Users

**View Users:**
1. Go to Admin Panel
2. Click "Users" tab (default)
3. See all users with their roles

**Add New User:**
1. Click "Add User" button
2. Fill in:
   - Full Name (required)
   - Email (required)
   - Password (required, min 6 chars)
   - Role (optional, defaults to Viewer)
   - Active status (checkbox)
3. Click "Create User"
4. Note: User may need to confirm email

**Edit User:**
1. Click edit icon (pencil) next to user
2. Modify information
3. Note: Password updates require service role (see limitations)
4. Click "Update User"

**Change User Role:**
1. Find user in table
2. Click dropdown in "Role" column
3. Select new role
4. Changes save automatically!

**Deactivate User:**
1. Click delete icon (trash) next to user
2. Confirm deactivation
3. User cannot log in (but can be reactivated)

---

## 🎨 UI Features

### Tabs
- **Users Tab**: Manage all users
- **Roles Tab**: Manage all roles

### Tables
- Sortable columns
- Hover effects
- Status badges (Active/Inactive, System/Custom)
- Quick actions (Edit, Delete)

### Forms
- Modal dialogs
- Validation
- Success/error notifications
- Auto-save for role changes

### Notifications
- Success messages (green)
- Error messages (red)
- Auto-dismiss after 5 seconds

---

## 🔐 Security & Permissions

### Access Control
- **Only Admin role** can access `/admin` route
- Other roles see "Access Denied" message
- Protected by `ProtectedRoute` component

### Row Level Security
- Roles table: Admins can manage, others can view active roles
- User profiles: Admins can manage all, users can view own
- Permissions: Admins only

### System Roles Protection
- Admin role cannot be deleted
- System roles cannot have name changed
- Visual indicator (yellow "System" badge)

---

## 📊 Database Schema

### roles Table
```sql
roles
├─ id (BIGSERIAL PRIMARY KEY)
├─ created_at (TIMESTAMPTZ)
├─ updated_at (TIMESTAMPTZ)
├─ name (TEXT UNIQUE, NOT NULL)
├─ description (TEXT)
├─ is_system_role (BOOLEAN)
└─ is_active (BOOLEAN)
```

### user_profiles (Updated)
```sql
user_profiles
├─ ... (existing columns)
└─ role_id (BIGINT → roles.id)
```

### permissions Table (Future Use)
```sql
permissions
├─ id (BIGSERIAL PRIMARY KEY)
├─ name (TEXT UNIQUE)
├─ description (TEXT)
├─ resource (TEXT)
└─ action (TEXT)
```

---

## ⚠️ Limitations & Notes

### Password Updates
- **Current**: Password updates require service role key
- **Workaround**: Update passwords in Supabase Dashboard
- **Future**: Can be implemented via Edge Function

### User Deletion
- **Current**: Users are deactivated (not deleted)
- **Reason**: Safer and doesn't require admin API
- **Benefit**: Can reactivate users later
- **Note**: To permanently delete, use Supabase Dashboard

### User Creation
- Uses regular `signUp` method
- May require email confirmation (depending on Supabase settings)
- Profile created automatically by trigger
- Role assigned after profile creation

---

## 🔄 Migration Notes

### Existing Users
- All existing users are automatically migrated
- Old `role` text field is kept for backward compatibility
- New code uses `role_id` and `role.name`

### Role Mapping
- `admin` → Admin role
- `staff` → Staff role
- `user` → Viewer role
- Users without role → Viewer (default)

---

## 💡 Best Practices

### Role Management
- ✅ Use descriptive role names
- ✅ Add descriptions for clarity
- ✅ Don't delete roles that are in use
- ✅ Create custom roles for specific needs

### User Management
- ✅ Always assign appropriate roles
- ✅ Deactivate instead of deleting
- ✅ Keep user information updated
- ✅ Monitor active/inactive users

### Security
- ✅ Only admins should access this page
- ✅ Review role assignments regularly
- ✅ Deactivate unused accounts
- ✅ Use strong passwords

---

## 🐛 Troubleshooting

### Problem: "Access Denied" when accessing Admin
**Solution**: 
1. Verify user has Admin role
2. Run: `SELECT * FROM user_profiles WHERE email = 'your-email@example.com'`
3. Check `role_id` points to Admin role
4. Refresh page

### Problem: Can't see roles in dropdown
**Solution**:
1. Verify `roles` table exists
2. Check roles are active: `SELECT * FROM roles WHERE is_active = true`
3. Refresh Admin page

### Problem: Can't change user role
**Solution**:
1. Check RLS policies are set up
2. Verify you're logged in as admin
3. Check browser console for errors

### Problem: User creation fails
**Solution**:
1. Check email is unique
2. Verify password is 6+ characters
3. Check Supabase email settings
4. Verify trigger created profile

### Problem: Role deletion fails
**Solution**:
1. Check if role is system role (cannot delete)
2. Verify no users have this role
3. Check RLS policies

---

## 📝 SQL Queries for Common Tasks

### Make a User Admin
```sql
UPDATE public.user_profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'Admin')
WHERE email = 'user@example.com';
```

### Get All Admins
```sql
SELECT up.email, up.full_name, r.name as role
FROM public.user_profiles up
JOIN public.roles r ON up.role_id = r.id
WHERE r.name = 'Admin';
```

### Count Users by Role
```sql
SELECT r.name, COUNT(up.id) as user_count
FROM public.roles r
LEFT JOIN public.user_profiles up ON r.id = up.role_id
GROUP BY r.name
ORDER BY user_count DESC;
```

### Deactivate All Inactive Users
```sql
UPDATE public.user_profiles
SET is_active = false
WHERE last_login < NOW() - INTERVAL '90 days';
```

---

## ✅ Checklist

After setup, verify:
- [ ] SQL script ran successfully
- [ ] 5 roles created (Admin, Staff, Inventory Manager, Accountant, Viewer)
- [ ] Existing users have role_id assigned
- [ ] Can access `/admin` route as admin
- [ ] Can see roles tab
- [ ] Can see users tab
- [ ] Can add new role
- [ ] Can edit role
- [ ] Can delete custom role (not system)
- [ ] Can add new user
- [ ] Can edit user
- [ ] Can change user role from dropdown
- [ ] Can deactivate user
- [ ] Notifications work
- [ ] Non-admin users see "Access Denied"

---

## 🎉 Success!

Your Admin Panel is now ready! 

**Next Steps:**
1. Create additional roles as needed
2. Assign roles to users
3. Customize permissions (future feature)
4. Monitor user activity

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify SQL script ran completely
3. Check RLS policies in Supabase
4. Verify user has Admin role
5. Check Supabase logs

---

**Happy managing! ⚙️👥**

