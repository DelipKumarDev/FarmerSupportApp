import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CropGuidesPage from './pages/CropGuidesPage'
import DiseaseDetectionPage from './pages/DiseaseDetectionPage'
import MarketplacePage from './pages/MarketplacePage'
import FarmerProductsPage from './pages/FarmerProductsPage'
import OrdersPage from './pages/OrdersPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsersPage from './pages/AdminUsersPage'
import DiscountsManagementPage from './pages/DiscountsManagementPage'
import ValueAdditionPage from './pages/ValueAdditionPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-primary text-white p-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">🌾 Farmer Support</h1>
            <div className="space-x-4">
              {user ? (
                <>
                  <span className="text-sm">Welcome, <strong>{user.name}</strong></span>
                  <span className={`badge ${
                    user.role === 'farmer' ? 'role-farmer' : 
                    user.role === 'admin' ? 'role-admin' : 
                    'role-customer'
                  }`}>{user.role}</span>
                  <a href="/dashboard" className="text-secondary hover:underline">Dashboard</a>
                  {user.role === 'admin' && (
                    <a href="/admin/dashboard" className="text-secondary hover:underline">Admin Panel</a>
                  )}
                  <button 
                    onClick={handleLogout} 
                    className="bg-secondary px-4 py-2 rounded hover:bg-opacity-90"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" className="hover:text-secondary">Login</a>
                  <a href="/register" className="hover:text-secondary">Register</a>
                </>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage setUser={setUser} />} />
          <Route path="/dashboard" element={user ? <DashboardPage user={user} /> : <Navigate to="/login" />} />
          <Route path="/crop-guides" element={<CropGuidesPage />} />
          <Route path="/disease-detection" element={user ? <DiseaseDetectionPage user={user} /> : <Navigate to="/login" />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/my-products" element={user && user.role === 'farmer' ? <FarmerProductsPage /> : <Navigate to="/dashboard" />} />
          <Route path="/orders" element={user ? <OrdersPage /> : <Navigate to="/login" />} />
          <Route path="/value-addition" element={<ValueAdditionPage />} />
          <Route path="/admin/dashboard" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin/users" element={user && user.role === 'admin' ? <AdminUsersPage /> : <Navigate to="/login" />} />
          <Route path="/admin/discounts" element={user && user.role === 'admin' ? <DiscountsManagementPage /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

// Home Page Component
function HomePage({ user }) {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4">Welcome to Farmer Support & Marketplace</h2>
        <p className="text-lg text-gray-600">Empowering farmers with technology, knowledge, and market access</p>
      </div>

      {!user && (
        <div className="mb-8 p-6 bg-primary text-white rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Get Started Today</h3>
          <p className="mb-4">Join our community of farmers and customers</p>
          <div className="space-x-4">
            <a href="/register" className="bg-secondary px-6 py-2 rounded hover:bg-opacity-90 inline-block">
              Register Now
            </a>
            <a href="/login" className="bg-white text-primary px-6 py-2 rounded hover:bg-opacity-90 inline-block">
              Login
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/crop-guides" className="card">
          <h3 className="text-xl font-bold mb-2">🌱 Crop Guidance</h3>
          <p className="text-gray-600">Expert advice on crop cultivation, pest management, and seasonal planning</p>
        </a>
        <a href={user ? "/disease-detection" : "/login"} className="card">
          <h3 className="text-xl font-bold mb-2">🔍 Disease Detection</h3>
          <p className="text-gray-600">AI-powered disease identification and treatment recommendations</p>
        </a>
        <a href="/marketplace" className="card">
          <h3 className="text-xl font-bold mb-2">🛒 Marketplace</h3>
          <p className="text-gray-600">Direct platform connecting farmers and customers for farm-fresh products</p>
        </a>
        <a href="/crop-guides" className="card">
          <h3 className="text-xl font-bold mb-2">📊 Market Prices</h3>
          <p className="text-gray-600">Real-time price comparison across multiple markets nationwide</p>
        </a>
        <a href={user ? "/crop-guides" : "/login"} className="card">
          <h3 className="text-xl font-bold mb-2">💰 Value Addition</h3>
          <p className="text-gray-600">Learn processing and branding to increase product value</p>
        </a>
        <a href={user ? "/orders" : "/login"} className="card">
          <h3 className="text-xl font-bold mb-2">📦 Orders</h3>
          <p className="text-gray-600">Track your marketplace orders and transactions</p>
        </a>
      </div>

      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Direct farmer-to-customer connections without middlemen</li>
          <li>AI-powered disease detection for crop health</li>
          <li>Access to real-time market prices across regions</li>
          <li>Expert crop guidance from agricultural specialists</li>
          <li>Value addition training to increase product value</li>
          <li>Secure payments and order tracking</li>
        </ul>
      </div>
    </div>
  )
}

export default App
