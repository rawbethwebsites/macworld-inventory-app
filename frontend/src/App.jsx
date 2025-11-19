import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ComingSoon from './pages/ComingSoon'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Invoices from './pages/Invoices'
import SalesHistory from './pages/SalesHistory'
import Customers from './pages/Customers'
import Admin from './pages/Admin'

// Other pages will be imported here
// import Dashboard from './pages/Dashboard'

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  return (
    <>
      {/* Only show the authenticated navbar on app pages (never on the public landing page) */}
      {isAuthenticated && !loading && !isLandingPage && <Navbar />}
      <Routes>
        {/* Public marketing/entry routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        
        {/* Auth-only application routes */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-history"
          element={
            <ProtectedRoute>
              <SalesHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          }
        />
        
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
