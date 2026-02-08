import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

export default function MarketplacePage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
  })
  const [cart, setCart] = useState([])

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      setLoading(true)
      let url = `${API_BASE_URL}/marketplace/listings`
      const params = new URLSearchParams()

      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)

      if (params.toString()) {
        url += '?' + params.toString()
      }

      const response = await fetch(url)
      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (listing) => {
    const existingItem = cart.find((item) => item._id === listing._id)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === listing._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart([...cart, { ...listing, quantity: 1 }])
    }
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }
    // Redirect to checkout or handle order creation
    alert('Checkout feature coming soon!')
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">🛒 Farmer's Marketplace</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="card lg:col-span-1 h-fit">
          <h3 className="text-xl font-bold mb-4">Filters</h3>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Min Price (₹):
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="input-field"
              placeholder="0"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Max Price (₹):
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="input-field"
              placeholder="10000"
            />
          </div>

          <button
            onClick={fetchListings}
            className="btn-primary w-full mb-4"
          >
            Apply Filters
          </button>

          <button
            onClick={() => {
              setFilters({ minPrice: '', maxPrice: '' })
              setListings([])
            }}
            className="btn-secondary w-full"
          >
            Reset Filters
          </button>
        </div>

        {/* Listings */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No products available
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Showing {listings.length} products
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings.map((listing) => (
                  <div key={listing._id} className="card">
                    <h3 className="text-lg font-bold mb-2">{listing.title}</h3>

                    <p className="text-gray-600 text-sm mb-2">
                      {listing.description || 'No description'}
                    </p>

                    <div className="mb-4 border-t border-gray-200 pt-2">
                      <p className="font-semibold text-lg text-primary">
                        ₹{listing.price}
                      </p>
                      <p className="text-sm text-gray-600">
                        per {listing.availableQuantity?.unit || 'unit'}
                      </p>
                    </div>

                    {listing.availableQuantity && (
                      <p className="text-sm text-gray-700 mb-4">
                        Available: {listing.availableQuantity.amount}{' '}
                        {listing.availableQuantity.unit}
                      </p>
                    )}

                    {listing.farmerId && (
                      <div className="p-2 bg-gray-50 rounded mb-4 text-sm">
                        <p>
                          <strong>Farmer:</strong> {listing.farmerId.name}
                        </p>
                        <p>
                          <strong>Location:</strong> {listing.farmerId.city}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(listing)}
                        className="btn-primary flex-1"
                      >
                        Add to Cart
                      </button>
                      <button className="btn-secondary flex-1">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 right-0 w-80 bg-white shadow-lg p-4 border-t-4 border-primary">
          <h3 className="text-xl font-bold mb-4">
            🛒 Cart ({cart.length})
          </h3>

          <div className="max-h-64 overflow-y-auto mb-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center p-2 border-b"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-600">
                    ₹{item.price} x {item.quantity}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setCart(cart.filter((c) => c._id !== item._id))
                  }
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-2 mb-4">
            <p className="font-semibold">
              Total: ₹
              {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
            </p>
          </div>

          <button
            onClick={handleCheckout}
            className="btn-primary w-full"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  )
}
