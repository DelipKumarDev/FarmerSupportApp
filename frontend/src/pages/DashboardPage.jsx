import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

export default function DashboardPage({ user }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch profile')

      const data = await response.json()
      setProfile(data.user)
    } catch (err) {
      setMessage('Error loading profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center mt-10">Loading profile...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">Welcome, {user?.name}!</h2>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">👤 Profile</h3>
          <p>
            <strong>Name:</strong> {profile?.name}
          </p>
          <p>
            <strong>Email:</strong> {profile?.email}
          </p>
          <p>
            <strong>Role:</strong> {profile?.role}
          </p>
          <p>
            <strong>City:</strong> {profile?.city || 'Not set'}
          </p>
          <button className="btn-primary mt-4 w-full">Edit Profile</button>
        </div>

        {/* Functions based on role */}
        {user?.role === 'farmer' && (
          <>
            <div className="card">
              <h3 className="text-xl font-bold mb-4">🌾 My Products</h3>
              <p className="text-gray-600 mb-4">Manage your farm products</p>
              <a href="/my-products" className="btn-primary w-full block text-center">View Products</a>
            </div>
            <div className="card">
              <h3 className="text-xl font-bold mb-4">📊 Market Prices</h3>
              <p className="text-gray-600 mb-4">Check current market prices</p>
              <a href="/crop-guides" className="btn-secondary w-full block text-center">View Prices</a>
            </div>
          </>
        )}

        {user?.role === 'customer' && (
          <>
            <div className="card">
              <h3 className="text-xl font-bold mb-4">🛒 Marketplace</h3>
              <p className="text-gray-600 mb-4">Browse farm products</p>
              <a href="/marketplace" className="btn-primary w-full block text-center">Shop Now</a>
            </div>
            <div className="card">
              <h3 className="text-xl font-bold mb-4">📦 My Orders</h3>
              <p className="text-gray-600 mb-4">Track your orders</p>
              <a href="/orders" className="btn-secondary w-full block text-center">View Orders</a>
            </div>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <a href="/admin/users" className="card">
              <h3 className="text-xl font-bold mb-4">👥 Users</h3>
              <p className="text-gray-600 mb-4">Manage all users</p>
              <button className="btn-primary w-full">Manage Users</button>
            </a>
            <a href="/admin/discounts" className="card">
              <h3 className="text-xl font-bold mb-4">🏷️ Discounts</h3>
              <p className="text-gray-600 mb-4">Create discount codes</p>
              <button className="btn-secondary w-full">Manage Discounts</button>
            </a>
            <a href="/admin/dashboard" className="card">
              <h3 className="text-xl font-bold mb-4">📊 Admin Panel</h3>
              <p className="text-gray-600 mb-4">View dashboard stats</p>
              <button className="btn-secondary w-full">View Dashboard</button>
            </a>
          </>
        )}

        {/* Common features */}
        <a href="/crop-guides" className="card">
          <h3 className="text-xl font-bold mb-4">🌱 Crop Guidance</h3>
          <p className="text-gray-600 mb-4">Expert farming advice</p>
          <button className="btn-secondary w-full">View Guides</button>
        </a>

        <a href="/disease-detection" className="card">
          <h3 className="text-xl font-bold mb-4">🔍 Disease Detection</h3>
          <p className="text-gray-600 mb-4">AI-powered disease detection</p>
          <button className="btn-secondary w-full">Check Crop Health</button>
        </a>

        <a href="/value-addition" className="card">
          <h3 className="text-xl font-bold mb-4">💰 Value Addition</h3>
          <p className="text-gray-600 mb-4">Increase produce value</p>
          <button className="btn-secondary w-full">Learn More</button>
        </a>
      </div>
    </div>
  )
}
