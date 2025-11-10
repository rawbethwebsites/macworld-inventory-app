import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
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

  return (
    <>
      {isAuthenticated && !loading && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
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

