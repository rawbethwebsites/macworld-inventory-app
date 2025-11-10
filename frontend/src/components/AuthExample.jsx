import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Example component demonstrating Supabase authentication usage
 * This can be used as a reference or starting point for your login/register forms
 */
export default function AuthExample() {
  const { user, login, logout, register, loading, isAuthenticated } = useContext(AuthContext)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (isRegistering) {
      // Registration
      const result = await register(email, password, {
        // Optional metadata
        display_name: email.split('@')[0]
      })

      if (result.success) {
        setMessage('Registration successful! Please check your email for verification.')
        setEmail('')
        setPassword('')
      } else {
        setError(result.message)
      }
    } else {
      // Login
      const result = await login(email, password)

      if (result.success) {
        setMessage('Login successful!')
        setEmail('')
        setPassword('')
      } else {
        setError(result.message)
      }
    }
  }

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      setMessage('Logged out successfully')
    } else {
      setError(result.message || 'Logout failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome!</h2>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-gray-600">You are logged in as:</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{user.email}</p>
              <p className="text-xs text-gray-500 mt-2">User ID: {user.id}</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">{message}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {isRegistering ? 'Create Account' : 'Sign In'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering)
              setError('')
              setMessage('')
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {isRegistering 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  )
}

