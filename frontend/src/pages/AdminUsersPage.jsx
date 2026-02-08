import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ role: '', status: '' })
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [filter, page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      let url = `${API_BASE_URL}/admin/users?page=${page}`
      if (filter.role) url += `&role=${filter.role}`
      if (filter.status) url += `&status=${filter.status}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      farmer: 'role-farmer',
      customer: 'role-customer',
      admin: 'role-admin',
    }
    return colors[role] || 'role-farmer'
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">👥 Manage Users</h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Role:</label>
            <select
              value={filter.role}
              onChange={(e) => {
                setFilter({ ...filter, role: e.target.value })
                setPage(1)
              }}
              className="input-field"
            >
              <option value="">All Roles</option>
              <option value="farmer">Farmer</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Status:</label>
            <select
              value={filter.status}
              onChange={(e) => {
                setFilter({ ...filter, status: e.target.value })
                setPage(1)
              }}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilter({ role: '', status: '' })}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No users found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-6 py-3 text-left font-semibold">Email</th>
                <th className="px-6 py-3 text-left font-semibold">Role</th>
                <th className="px-6 py-3 text-left font-semibold">Location</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{user.name}</td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.city}, {user.state}
                  </td>
                  <td className="px-6 py-4">
                    <span className={user.isActive ? 'badge badge-success' : 'badge badge-danger'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <a
                      href={`/admin/users/${user._id}`}
                      className="text-primary hover:underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
    </div>
  )
}
