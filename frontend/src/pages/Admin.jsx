import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../hooks/useAuth'

const Admin = () => {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'roles'
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  // Roles state
  const [roles, setRoles] = useState([])
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: ''
  })

  // Users state
  const [users, setUsers] = useState([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userFormData, setUserFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: '',
    is_active: true
  })

  useEffect(() => {
    if (!isAdmin()) {
      return
    }
    fetchRoles()
    fetchUsers()
  }, [isAdmin])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
  }

  // ==================== ROLES MANAGEMENT ====================

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name')

      if (error) throw error
      setRoles(data || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
      showNotification('Failed to load roles: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSubmit = async (e) => {
    e.preventDefault()
    if (!roleFormData.name.trim()) {
      showNotification('Role name is required', 'error')
      return
    }

    try {
      setSubmitting(true)
      
      if (editingRole) {
        // Update role
        const { error } = await supabase
          .from('roles')
          .update({
            name: roleFormData.name,
            description: roleFormData.description || null
          })
          .eq('id', editingRole.id)

        if (error) throw error
        showNotification('Role updated successfully!', 'success')
      } else {
        // Create role
        const { error } = await supabase
          .from('roles')
          .insert([{
            name: roleFormData.name,
            description: roleFormData.description || null,
            is_system_role: false
          }])

        if (error) throw error
        showNotification('Role created successfully!', 'success')
      }

      resetRoleForm()
      setShowRoleForm(false)
      fetchRoles()
    } catch (error) {
      console.error('Error saving role:', error)
      showNotification('Failed to save role: ' + error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRole = async (role) => {
    if (role.is_system_role) {
      showNotification('System roles cannot be deleted', 'error')
      return
    }

    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"? This will affect all users with this role.`)) {
      return
    }

    try {
      // First, assign default role to users with this role
      const defaultRole = roles.find(r => r.name === 'Viewer')
      if (defaultRole) {
        await supabase
          .from('user_profiles')
          .update({ role_id: defaultRole.id })
          .eq('role_id', role.id)
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', role.id)

      if (error) throw error
      showNotification('Role deleted successfully!', 'success')
      fetchRoles()
      fetchUsers() // Refresh users to show updated roles
    } catch (error) {
      console.error('Error deleting role:', error)
      showNotification('Failed to delete role: ' + error.message, 'error')
    }
  }

  const resetRoleForm = () => {
    setRoleFormData({ name: '', description: '' })
    setEditingRole(null)
  }

  const handleEditRole = (role) => {
    setEditingRole(role)
    setRoleFormData({
      name: role.name,
      description: role.description || ''
    })
    setShowRoleForm(true)
  }

  // ==================== USERS MANAGEMENT ====================

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          role:roles(id, name, description)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      showNotification('Failed to load users: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    if (!userFormData.email.trim()) {
      showNotification('Email is required', 'error')
      return
    }
    if (!userFormData.full_name.trim()) {
      showNotification('Full name is required', 'error')
      return
    }
    if (!editingUser && !userFormData.password) {
      showNotification('Password is required for new users', 'error')
      return
    }

    try {
      setSubmitting(true)

      if (editingUser) {
        // Update existing user profile
        const updates = {
          full_name: userFormData.full_name,
          role_id: userFormData.role_id || null,
          is_active: userFormData.is_active
        }

        // Note: Password updates require service role key
        // For now, we'll just update the profile
        if (userFormData.password) {
          showNotification('Password updates require admin API access. Please update password in Supabase Dashboard.', 'error')
          return
        }

        const { error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', editingUser.id)

        if (error) throw error
        showNotification('User updated successfully!', 'success')
      } else {
        // Create new user - use signUp (will require email confirmation unless disabled)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userFormData.email,
          password: userFormData.password,
          options: {
            data: {
              full_name: userFormData.full_name
            },
            email_redirect_to: window.location.origin
          }
        })

        if (authError) throw authError

        if (authData.user) {
          // Wait a moment for trigger to create profile
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Update profile with role and other info
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({
              full_name: userFormData.full_name,
              role_id: userFormData.role_id || null,
              is_active: userFormData.is_active
            })
            .eq('id', authData.user.id)

          if (profileError) {
            console.error('Error updating profile:', profileError)
            // Profile might not exist yet, try creating it
            const { data: defaultRole } = await supabase
              .from('roles')
              .select('id')
              .eq('name', 'Viewer')
              .single()

            await supabase
              .from('user_profiles')
              .insert([{
                id: authData.user.id,
                email: userFormData.email,
                full_name: userFormData.full_name,
                role_id: userFormData.role_id || defaultRole?.id || null,
                is_active: userFormData.is_active
              }])
          }
        }

        showNotification('User created successfully! They may need to confirm their email.', 'success')
      }

      resetUserForm()
      setShowUserForm(false)
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      showNotification('Failed to save user: ' + error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to deactivate user "${user.full_name || user.email}"? They will not be able to log in. You can reactivate them later.`)) {
      return
    }

    try {
      // Deactivate user instead of deleting (safer and doesn't require admin API)
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', user.id)

      if (error) throw error

      showNotification('User deactivated successfully!', 'success')
      fetchUsers()
    } catch (error) {
      console.error('Error deactivating user:', error)
      showNotification('Failed to deactivate user: ' + error.message, 'error')
    }
  }

  const handleChangeUserRole = async (userId, newRoleId) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role_id: newRoleId })
        .eq('id', userId)

      if (error) throw error
      showNotification('User role updated successfully!', 'success')
      fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      showNotification('Failed to update user role: ' + error.message, 'error')
    }
  }

  const resetUserForm = () => {
    setUserFormData({
      full_name: '',
      email: '',
      password: '',
      role_id: '',
      is_active: true
    })
    setEditingUser(null)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setUserFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      password: '', // Don't pre-fill password
      role_id: user.role_id || '',
      is_active: user.is_active !== undefined ? user.is_active : true
    })
    setShowUserForm(true)
  }

  // Check if user is admin
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">
            Manage user roles and permissions
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : notification.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Roles ({roles.length})
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <button
                onClick={() => {
                  resetUserForm()
                  setShowUserForm(true)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role_id || ''}
                              onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="">No Role</option>
                              {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-900 p-2"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-900 p-2"
                                title="Deactivate"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Role Management</h2>
              <button
                onClick={() => {
                  resetRoleForm()
                  setShowRoleForm(true)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Role
              </button>
            </div>

            {/* Roles Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading roles...</p>
                </div>
              ) : roles.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No roles found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {roles.map((role) => (
                        <tr key={role.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{role.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{role.description || 'No description'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {role.is_system_role ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                System
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                Custom
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              role.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {role.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditRole(role)}
                                className="text-blue-600 hover:text-blue-900 p-2"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {!role.is_system_role && (
                                <button
                                  onClick={() => handleDeleteRole(role)}
                                  className="text-red-600 hover:text-red-900 p-2"
                                  title="Delete"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Role Form Modal */}
        {showRoleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRole ? 'Edit Role' : 'Add New Role'}
                </h3>
                <button
                  onClick={() => {
                    setShowRoleForm(false)
                    resetRoleForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRoleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={roleFormData.name}
                    onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                    className="input-base"
                    placeholder="e.g., Manager"
                    required
                    disabled={editingRole?.is_system_role}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={roleFormData.description}
                    onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                    rows="3"
                    className="input-base"
                    placeholder="Describe what this role can do..."
                  />
                </div>

                {editingRole?.is_system_role && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      This is a system role. The name cannot be changed.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleForm(false)
                      resetRoleForm()
                    }}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Form Modal */}
        {showUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-8">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={() => {
                    setShowUserForm(false)
                    resetUserForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userFormData.full_name}
                    onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                    className="input-base"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="input-base"
                    placeholder="user@example.com"
                    required
                    disabled={!!editingUser}
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="input-base"
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                    required={!editingUser}
                    minLength={6}
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={userFormData.role_id}
                    onChange={(e) => setUserFormData({ ...userFormData, role_id: e.target.value })}
                    className="input-base"
                  >
                    <option value="">No Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userFormData.is_active}
                      onChange={(e) => setUserFormData({ ...userFormData, is_active: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active User</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Inactive users cannot log in
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserForm(false)
                      resetUserForm()
                    }}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin

