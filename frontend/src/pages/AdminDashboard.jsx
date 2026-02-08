import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8">📊 Admin Dashboard</h2>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-blue-50">
          <h3 className="text-sm font-semibold text-blue-600 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-700">{stats?.users?.total || 0}</p>
          <p className="text-xs text-blue-500 mt-2">Active: {stats?.users?.active || 0}</p>
        </div>

        <div className="card bg-green-50">
          <h3 className="text-sm font-semibold text-green-600 mb-2">Farmers</h3>
          <p className="text-3xl font-bold text-green-700">{stats?.users?.farmers || 0}</p>
        </div>

        <div className="card bg-purple-50">
          <h3 className="text-sm font-semibold text-purple-600 mb-2">Customers</h3>
          <p className="text-3xl font-bold text-purple-700">{stats?.users?.customers || 0}</p>
        </div>

        <div className="card bg-yellow-50">
          <h3 className="text-sm font-semibold text-yellow-600 mb-2">Active Listings</h3>
          <p className="text-3xl font-bold text-yellow-700">{stats?.listings || 0}</p>
        </div>
      </div>

      {/* Orders Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-indigo-50">
          <h3 className="text-sm font-semibold text-indigo-600 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-indigo-700">{stats?.orders?.total || 0}</p>
        </div>

        <div className="card bg-red-50">
          <h3 className="text-sm font-semibold text-red-600 mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-red-700">{stats?.orders?.pending || 0}</p>
        </div>

        <div className="card bg-teal-50">
          <h3 className="text-sm font-semibold text-teal-600 mb-2">Delivered</h3>
          <p className="text-3xl font-bold text-teal-700">{stats?.orders?.delivered || 0}</p>
        </div>

        <div className="card bg-orange-50">
          <h3 className="text-sm font-semibold text-orange-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-orange-700">
            ₹{(stats?.orders?.revenue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/admin/users" className="card hover:shadow-lg transition">
          <h3 className="text-lg font-bold mb-2">👥 Manage Users</h3>
          <p className="text-gray-600 text-sm">View and manage all platform users</p>
        </a>

        <a href="/admin/discounts" className="card hover:shadow-lg transition">
          <h3 className="text-lg font-bold mb-2">🏷️ Manage Discounts</h3>
          <p className="text-gray-600 text-sm">Create and manage promotional codes</p>
        </a>

        <a href="/admin/value-addition" className="card hover:shadow-lg transition">
          <h3 className="text-lg font-bold mb-2">💡 Value Addition</h3>
          <p className="text-gray-600 text-sm">Manage value addition guides</p>
        </a>
      </div>
    </div>
  )
}
