import { useState, useEffect } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = ({ children, requireAdmin = false, requireStaff = false }) => {
  const { isAuthenticated, loading, isAdmin, isStaff } = useAuth()
  const location = useLocation()
  const [showBypass, setShowBypass] = useState(false)

  useEffect(() => {
    // Show bypass option after 3 seconds
    const timer = setTimeout(() => {
      setShowBypass(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading authentication...</p>
          {showBypass && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">Taking too long?</p>
              <Link
                to="/login"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Go to Login Page
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  if (requireStaff && !isStaff()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need staff or admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute

