import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { userProfile, logout, isAdmin, loading, isAuthenticated } = useAuth()

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const baseNavLinks = [
    { name: 'Products', path: '/products', icon: '📦' },
    { name: 'Categories', path: '/categories', icon: '🏷️' },
    { name: 'Invoices', path: '/invoices', icon: '📄' },
    { name: 'Sales', path: '/sales-history', icon: '📈' },
    { name: 'Customers', path: '/customers', icon: '👥' },
  ]

  const navLinks = isAdmin() 
    ? [...baseNavLinks, { name: 'Admin', path: '/admin', icon: '⚙️' }]
    : baseNavLinks

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-brand-dark text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span>📍 Shop B18-a, Emab Plaza. Wuse II, Abuja</span>
            <span>📞 +234 816 836 6739</span>
            <span className="hidden md:inline text-xs font-semibold text-brand-yellow">
              RC: 1755259
            </span>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </div>
            ) : isAuthenticated ? (
              <>
                {userProfile && (
                  <>
                    <span className="hidden sm:inline">
                      Welcome, {userProfile.full_name || userProfile.email}!
                    </span>
                    {isAdmin() && (
                      <span className="px-2 py-1 bg-brand-yellow text-brand-dark rounded text-xs font-semibold">
                        ADMIN
                      </span>
                    )}
                  </>
                )}
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="flex items-center gap-2 hover:bg-primary-700 px-3 py-1 rounded font-medium"
                  title="Sign Out"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
                {userProfile && (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 hover:bg-primary-700 px-2 py-1 rounded"
                      title="User Menu"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-medium text-gray-900">{userProfile.full_name || 'User'}</p>
                          <p className="text-xs text-gray-500">{userProfile.email}</p>
                          {isAdmin() && (
                            <p className="text-xs text-yellow-600 font-semibold mt-1">Administrator</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            logout()
                            navigate('/login')
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {/* Brand wordmark rendered in text so colours remain crisp everywhere */}
            <div className="leading-tight">
              <div className="text-[10px] font-semibold tracking-wide text-brand-yellow uppercase">
                RC: 1755259
              </div>
              <h1 className="text-xl font-bold">
                <span className="text-brand-gray">Mac</span>
                <span className="text-brand-dark">WORLD</span>
              </h1>
              <p className="text-[11px] font-semibold tracking-wide text-brand-red uppercase">
                Gallery Ltd.
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-1 rounded-md hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{link.icon}</span>
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 py-3 overflow-x-auto">
            <Link
              to="/categories"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              All Categories
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/products?featured=true" className="text-sm text-gray-700 hover:text-primary-600 whitespace-nowrap">
              Featured Products
            </Link>
            <Link to="/products?new=true" className="text-sm text-gray-700 hover:text-primary-600 whitespace-nowrap">
              New Arrivals
            </Link>
            <Link to="/products?sale=true" className="text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap">
              🔥 On Sale
            </Link>
            <Link to="/products?low-stock=true" className="text-sm text-yellow-600 hover:text-yellow-700 whitespace-nowrap">
              ⚠️ Low Stock
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Mobile Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
