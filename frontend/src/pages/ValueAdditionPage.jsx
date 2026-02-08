import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

export default function ValueAdditionPage() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchContent()
  }, [filter])

  const fetchContent = async () => {
    try {
      setLoading(true)
      let url = `${API_BASE_URL}/value-addition`
      if (filter !== 'all') {
        url += `?category=${filter}`
      }
      const response = await fetch(url)
      const data = await response.json()
      setContent(data.content || [])
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Guides' },
    { id: 'processing', name: 'Processing' },
    { id: 'packaging', name: 'Packaging' },
    { id: 'storage', name: 'Storage' },
    { id: 'branding', name: 'Branding' },
    { id: 'certification', name: 'Certification' },
  ]

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">💡 Value Addition Guides</h2>

      {/* Category Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === cat.id
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-8">Loading guides...</div>
      ) : content.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No guides available in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.map((item) => (
            <div key={item._id} className="card">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold flex-1">{item.title}</h3>
                <span className="badge badge-primary text-xs ml-2">
                  {item.category}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{item.description}</p>

              {item.estimatedCost && item.estimatedCost.max && (
                <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                  <strong>Estimated Cost:</strong> ₹
                  {item.estimatedCost.min || 0} - ₹{item.estimatedCost.max}
                </div>
              )}

              {item.expectedReturn && item.expectedReturn.percentage && (
                <div className="mb-3 p-2 bg-green-50 rounded text-sm">
                  <strong>Expected Return:</strong> {item.expectedReturn.percentage}%
                </div>
              )}

              {item.benefits && item.benefits.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-semibold text-sm mb-1">Benefits:</h4>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {item.benefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="btn-primary w-full">Read Full Guide</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
