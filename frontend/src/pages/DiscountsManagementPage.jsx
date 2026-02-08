import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

export default function DiscountsManagementPage() {
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxUsageCount: '',
    applicableRoles: [],
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/discounts?active=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setDiscounts(data.discounts || [])
    } catch (error) {
      console.error('Error fetching discounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/discounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: '',
          minOrderAmount: '',
          maxUsageCount: '',
          applicableRoles: [],
          startDate: '',
          endDate: '',
        })
        setShowForm(false)
        fetchDiscounts()
      }
    } catch (error) {
      console.error('Error creating discount:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">🏷️ Manage Discounts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Create Discount'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-bold mb-4">Create New Discount Code</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., SUMMER25"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Type *
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Discount Value *
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., 15 or 500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Min Order Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderAmount: e.target.value })
                  }
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input-field"
                rows="2"
                placeholder="Optional description"
              />
            </div>

            <button type="submit" className="btn-primary">
              Create Discount
            </button>
          </form>
        </div>
      )}

      {/* Discounts List */}
      {loading ? (
        <div className="text-center py-8">Loading discounts...</div>
      ) : discounts.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No discounts found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {discounts.map((discount) => (
            <div key={discount._id} className="card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold">{discount.code}</h3>
                <span className="badge badge-primary">
                  {discount.discountType === 'percentage'
                    ? discount.discountValue + '%'
                    : '₹' + discount.discountValue}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3">{discount.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <p>
                  <strong>Min Order:</strong> ₹{discount.minOrderAmount}
                </p>
                <p>
                  <strong>Usage:</strong> {discount.usageCount}
                  {discount.maxUsageCount ? `/${discount.maxUsageCount}` : '/ Unlimited'}
                </p>
                <p>
                  <strong>Valid Until:</strong>{' '}
                  {new Date(discount.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <button className="btn-secondary flex-1 text-sm">Edit</button>
                <button className="btn-secondary flex-1 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
