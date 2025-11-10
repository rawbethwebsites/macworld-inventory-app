import { createContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  // Define fetchUserProfile before useEffect to avoid hoisting issues
  const fetchUserProfile = async (userId) => {
    try {
      // First try to fetch with role join (if roles table exists)
      let query = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await query

      if (error) throw error

      // Try to fetch role separately if role_id exists
      if (data.role_id) {
        try {
          const { data: roleData } = await supabase
            .from('roles')
            .select('id, name, description')
            .eq('id', data.role_id)
            .single()
          
          if (roleData) {
            data.role = roleData
          }
        } catch (roleError) {
          // Roles table might not exist yet, that's okay
          console.log('Roles table not available yet:', roleError.message)
        }
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        try {
          // Try to get default role (if roles table exists)
          let defaultRoleId = null
          try {
            const { data: defaultRole } = await supabase
              .from('roles')
              .select('id')
              .eq('name', 'Viewer')
              .single()
            defaultRoleId = defaultRole?.id || null
          } catch (roleError) {
            // Roles table doesn't exist yet, use old role field
            console.log('Roles table not available, using old role field')
          }

          // Get user email from auth
          const { data: { user: authUser } } = await supabase.auth.getUser(userId)
          
          const { data: newProfile } = await supabase
            .from('user_profiles')
            .insert([{
              id: userId,
              email: authUser?.email || '',
              full_name: authUser?.email || '',
              role_id: defaultRoleId,
              role: 'user' // Fallback to old role field
            }])
            .select('*')
            .single()
          
          if (newProfile) {
            setUserProfile(newProfile)
          }
        } catch (createError) {
          console.error('Error creating user profile:', createError)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session with shorter timeout
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('Session error:', error)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            await fetchUserProfile(session.user.id)
          } catch (error) {
            console.error('Error fetching profile:', error)
            if (mounted) setLoading(false)
          }
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth init error:', error)
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        try {
          await fetchUserProfile(session.user.id)
        } catch (error) {
          console.error('Error in auth state change:', error)
          if (mounted) setLoading(false)
        }
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    // Safety timeout - ensure loading doesn't hang forever (reduced to 3 seconds)
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - setting loading to false')
        setLoading(false)
      }
    }, 3000) // 3 second timeout

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        await fetchUserProfile(data.user.id)
        return { success: true, user: data.user }
      }

      return { success: false, message: 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.message || 'Login failed. Please check your credentials.'
      }
    }
  }

  const signup = async (email, password, fullName, role = 'user') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Profile will be created automatically by trigger
        return { success: true, user: data.user }
      }

      return { success: false, message: 'Signup failed' }
    } catch (error) {
      console.error('Signup error:', error)
      return {
        success: false,
        message: error.message || 'Signup failed. Please try again.'
      }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setUserProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setUserProfile(data)
      return { success: true, profile: data }
    } catch (error) {
      console.error('Update profile error:', error)
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      }
    }
  }

  const isAdmin = () => {
    // Check both old role field and new role.name for backward compatibility
    return userProfile?.role?.name === 'Admin' || userProfile?.role === 'admin'
  }

  const isStaff = () => {
    const roleName = userProfile?.role?.name || userProfile?.role
    return roleName === 'Staff' || roleName === 'Admin' || roleName === 'staff' || roleName === 'admin'
  }

  const hasRole = (roleName) => {
    // Check both old role field and new role.name for backward compatibility
    return userProfile?.role?.name === roleName || userProfile?.role === roleName.toLowerCase()
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin,
    isStaff,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
