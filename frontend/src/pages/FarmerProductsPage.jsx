import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

export default function FarmerProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    cropId: '',
    productName: '',
    description: '',
    quantity: { amount: '', unit: 'kg' },
    basePrice: '',
    certifications: [],
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/marketplace/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          cropId: '',
          productName: '',
          description: '',
          quantity: { amount: '', unit: 'kg' },
          basePrice: '',
          certifications: [],
        })
        setShowForm(false)
        fetchProducts()
      }
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">🌾 My Products</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-bold mb-4">Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Crop *
                </label>
                <select
                  value={formData.cropId}
                  onChange={(e) =>
                    setFormData({ ...formData, cropId: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="">Select Crop</option>
                  <option value="1">Wheat</option>
                  <option value="2">Rice</option>
                  <option value="3">Cotton</option>
                  <option value="4">Tomato</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
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
                rows="3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Quantity Amount *
                </label>
                <input
                  type="number"
                  value={formData.quantity.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: { ...formData.quantity, amount: e.target.value },
                    })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Unit
                </label>
                <select
                  value={formData.quantity.unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: { ...formData.quantity, unit: e.target.value },
                    })
                  }
                  className="input-field"
                >
                  <option value="kg">kg</option>
                  <option value="quintals">quintals</option>
                  <option value="tons">tons</option>
                  <option value="liters">liters</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Base Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Create Product
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No products yet. Create your first product!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="card">
              <h3 className="text-lg font-bold mb-2">{product.productName}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>

              <div className="mb-4 border-t border-gray-200 pt-2">
                <p className="font-semibold text-primary text-lg">
                  ₹{product.basePrice}
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: {product.quantity?.amount} {product.quantity?.unit}
                </p>
              </div>

              <div className="flex gap-2">
                <button className="btn-primary flex-1">Edit</button>
                <button className="btn-secondary flex-1">List for Sale</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
