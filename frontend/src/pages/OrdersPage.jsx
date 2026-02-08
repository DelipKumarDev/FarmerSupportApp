import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('customer')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    setUserRole(user?.role || 'customer')
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user'))
      
      let url = `${API_BASE_URL}/orders`
      if (user?.role === 'farmer') {
        url += '/farmer-orders'
      } else {
        url += '/my-orders'
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning',
      confirmed: 'badge-primary',
      shipped: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
    }
    return colors[status] || 'badge-primary'
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">
        {userRole === 'farmer' ? '📦 Farmer Orders' : '🛍️ My Orders'}
      </h2>

      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{order.orderId}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>From:</strong>{' '}
                    {userRole === 'farmer'
                      ? order.customerId?.name
                      : order.farmerId?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Location:</strong> {order.shippingAddress?.city}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Items:</strong> {order.items?.length || 0}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    ₹{order.finalAmount}
                  </p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <ul className="space-y-1 text-sm">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        • {item.quantity?.amount} {item.quantity?.unit} @
                        ₹{item.pricePerUnit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <button className="btn-secondary flex-1">View Details</button>
                {userRole === 'farmer' && order.status === 'confirmed' && (
                  <button className="btn-primary flex-1">Mark as Shipped</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
