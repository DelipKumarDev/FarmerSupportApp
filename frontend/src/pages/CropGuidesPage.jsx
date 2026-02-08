import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api'

export default function CropGuidesPage() {
  const [crops, setCrops] = useState([])
  const [guides, setGuides] = useState([])
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCrops()
    fetchGuides()
  }, [selectedCrop])

  const fetchCrops = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/crops`)
      const data = await response.json()
      setCrops(data.crops || [])
    } catch (error) {
      console.error('Error fetching crops:', error)
    }
  }

  const fetchGuides = async () => {
    try {
      setLoading(true)
      let url = `${API_BASE_URL}/crops/guides`
      if (selectedCrop) {
        url += `?cropId=${selectedCrop}`
      }
      const response = await fetch(url)
      const data = await response.json()
      setGuides(data.guides || [])
    } catch (error) {
      console.error('Error fetching guides:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">🌱 Crop Guidance</h2>

      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Filter by Crop:</label>
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="input-field max-w-sm"
        >
          <option value="">All Crops</option>
          {crops.map((crop) => (
            <option key={crop._id} value={crop._id}>
              {crop.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading guides...</div>
      ) : guides.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No guides available for the selected crop
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <div key={guide._id} className="card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{guide.title}</h3>
                <span className="badge badge-primary text-xs">
                  {guide.stage.charAt(0).toUpperCase() + guide.stage.slice(1)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{guide.content}</p>

              {guide.tips && guide.tips.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">💡 Tips:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {guide.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {guide.fertilizer && guide.fertilizer.name && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <h4 className="font-semibold mb-1">🥗 Fertilizer:</h4>
                  <p className="text-sm">
                    <strong>{guide.fertilizer.name}</strong> - {guide.fertilizer.quantity} ({guide.fertilizer.time})
                  </p>
                </div>
              )}

              {guide.irrigation && guide.irrigation.frequency && (
                <div className="p-3 bg-green-50 rounded">
                  <h4 className="font-semibold mb-1">💧 Irrigation:</h4>
                  <p className="text-sm">
                    Every <strong>{guide.irrigation.frequency}</strong> - {guide.irrigation.quantity}
                  </p>
                </div>
              )}

              {guide.warnings && guide.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-semibold mb-1">⚠️ Warnings:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {guide.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
